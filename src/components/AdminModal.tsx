import React, { useState, useEffect } from "react";
import { Tournament } from "../config/site";
import {
  SiteSettings,
  getAdminPassword,
  setAdminPassword,
  isDeviceAuthorized,
  authorizeCurrentDevice,
  getSecretAdminUrl,
  SECRET_ADMIN_KEY,
  formatGoogleFormEmbedUrl,
} from "../utils/adminStorage";
import {
  Lock,
  Unlock,
  Key,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Trophy,
  Layers,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  Monitor,
  Copy,
  Users,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournaments: Tournament[];
  onSaveTournaments: (tournaments: Tournament[]) => void;
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => void;
  onResetAll: () => void;
}

const AVAILABLE_MAPS = [
  "Mirage",
  "Inferno",
  "Nuke",
  "Anubis",
  "Ancient",
  "Dust II",
  "Train",
  "Vertigo",
  "Overpass",
  "Cache",
];

const EMPTY_TOURNAMENT: Omit<Tournament, "id"> = {
  title: "",
  subtitle: "Турнир серии 5x5",
  game: "Counter-Strike 2",
  format: "5x5 Single Elimination",
  teamCount: 16,
  date: "15 ОКТ 2026",
  time: "18:00 МСК",
  prizePool: "$500 CAD",
  firstPlacePrize: "$350 CAD",
  secondPlacePrize: "$150 CAD",
  status: "РЕГИСТРАЦИЯ ОТКРЫТА",
  region: "Европа / СНГ",
  serverLocation: "Франкфурт и Стокгольм (эквивалент 128-tick)",
  antiCheat: "VACnet + серверная проверка целостности",
  entryFee: "Бесплатно",
  registrationDeadline: "14 ОКТ 2026, 23:59 МСК",
  maps: ["Mirage", "Inferno", "Nuke", "Anubis", "Ancient", "Dust II", "Train"],
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  tournaments,
  onSaveTournaments,
  settings,
  onSaveSettings,
  onResetAll,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isDeviceAuthorized());
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Active sub-tab inside admin: "list" | "form" | "access" | "settings"
  const [activeTab, setActiveTab] = useState<"list" | "form" | "access" | "settings">("list");

  // Tournament editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Tournament, "id">>(EMPTY_TOURNAMENT);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string>("");
  const [formErrorMessage, setFormErrorMessage] = useState<string>("");

  // Deletion confirmation state (replaces window.confirm which is blocked in iframes)
  const [tournamentToDelete, setTournamentToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Settings form state
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);
  const [newPassword, setNewPassword] = useState<string>("");
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string>("");
  const [settingsErrorMessage, setSettingsErrorMessage] = useState<string>("");

  // Copy secret link feedback
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (isDeviceAuthorized()) {
        setIsAuthenticated(true);
      }
      setTempSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = passwordInput.trim();
    const storedPw = getAdminPassword();

    if (entered === storedPw || entered === SECRET_ADMIN_KEY) {
      setIsAuthenticated(true);
      authorizeCurrentDevice();
      setAuthError("");
      setPasswordInput("");
    } else {
      setAuthError("Неверный пароль администратора. Попробуйте снова.");
    }
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_TOURNAMENT,
      title: `LINEUP OPEN #${tournaments.length + 1}`,
    });
    setFormSuccessMessage("");
    setFormErrorMessage("");
    setActiveTab("form");
  };

  const handleStartEdit = (t: Tournament) => {
    setEditingId(t.id);
    setFormData({
      title: t.title,
      subtitle: t.subtitle,
      game: t.game,
      format: t.format,
      teamCount: t.teamCount,
      date: t.date,
      time: t.time,
      prizePool: t.prizePool,
      firstPlacePrize: t.firstPlacePrize,
      secondPlacePrize: t.secondPlacePrize,
      status: t.status,
      region: t.region,
      serverLocation: t.serverLocation,
      antiCheat: t.antiCheat,
      entryFee: t.entryFee,
      registrationDeadline: t.registrationDeadline,
      maps: [...t.maps],
    });
    setFormSuccessMessage("");
    setFormErrorMessage("");
    setActiveTab("form");
  };

  // Safe deletion with custom UI confirmation (works 100% inside iframes and mobile)
  const handleConfirmDelete = () => {
    if (!tournamentToDelete) return;
    const deletedTitle = tournamentToDelete.title;
    const updated = tournaments.filter((t) => t.id !== tournamentToDelete.id);
    onSaveTournaments(updated);
    setTournamentToDelete(null);
    setDeletingId(null);
    setFormSuccessMessage(`Турнир «${deletedTitle}» успешно удален.`);
    setTimeout(() => {
      setFormSuccessMessage("");
    }, 3000);
  };

  const handleDirectDelete = (id: string, title: string) => {
    const updated = tournaments.filter((t) => t.id !== id);
    onSaveTournaments(updated);
    setDeletingId(null);
    setTournamentToDelete(null);
    setFormSuccessMessage(`Турнир «${title}» успешно удален.`);
    setTimeout(() => {
      setFormSuccessMessage("");
    }, 3000);
  };

  const handleQuickStatusChange = (
    id: string,
    newStatus: "РЕГИСТРАЦИЯ ОТКРЫТА" | "В ПРОЦЕССЕ" | "СКОРО" | "ЗАВЕРШЕН"
  ) => {
    const updated = tournaments.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    onSaveTournaments(updated);
  };

  const handleMoveTournament = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tournaments.length) return;
    const updated = [...tournaments];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onSaveTournaments(updated);
  };

  const handleToggleMap = (mapName: string) => {
    setFormData((prev) => {
      const exists = prev.maps.includes(mapName);
      if (exists) {
        return { ...prev, maps: prev.maps.filter((m) => m !== mapName) };
      } else {
        return { ...prev, maps: [...prev.maps, mapName] };
      }
    });
  };

  const handleSaveTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage("");

    if (!formData.title.trim()) {
      setFormErrorMessage("Пожалуйста, укажите название турнира.");
      return;
    }

    if (editingId) {
      // Update existing
      const updated = tournaments.map((t) =>
        t.id === editingId ? { ...formData, id: editingId } : t
      );
      onSaveTournaments(updated);
      setFormSuccessMessage("Турнир успешно сохранен!");
    } else {
      // Create new
      const newId = `tournament-${Date.now()}`;
      const newTournament: Tournament = {
        ...formData,
        id: newId,
      };
      onSaveTournaments([newTournament, ...tournaments]);
      setFormSuccessMessage("Новый турнир успешно опубликован на сайте!");
    }

    setTimeout(() => {
      setActiveTab("list");
      setFormSuccessMessage("");
    }, 1000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsErrorMessage("");
    
    const formattedEmbed = formatGoogleFormEmbedUrl(tempSettings.googleFormUrl);
    const updatedSettings: SiteSettings = {
      ...tempSettings,
      googleFormEmbedUrl: formattedEmbed,
    };
    setTempSettings(updatedSettings);
    onSaveSettings(updatedSettings);

    if (newPassword.trim().length > 0 && newPassword.trim().length < 4) {
      setSettingsErrorMessage("Новый пароль должен содержать минимум 4 символа.");
      return;
    }

    if (newPassword.trim().length >= 4) {
      setAdminPassword(newPassword.trim());
      setNewPassword("");
      setSettingsSuccessMessage("Настройки и новый пароль сохранены!");
    } else {
      setSettingsSuccessMessage("Настройки платформы сохранены! Ссылка на форму обновлена.");
    }

    setTimeout(() => {
      setSettingsSuccessMessage("");
    }, 2500);
  };

  const handleCopySecretLink = () => {
    const url = getSecretAdminUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    } else {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl shadow-black overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top metallic chrome trim */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/15 flex items-center justify-center text-white">
              {isAuthenticated ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  ПАНЕЛЬ ОРГАНИЗАТОРА
                </h3>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/10 text-neutral-300 uppercase tracking-wider">
                  LINEUP ADMIN
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Управление турнирами CS2, статусами регистрации и доступом
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-mono-tech transition-colors cursor-pointer"
                title="Заблокировать доступ"
              >
                Блокировка
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Закрыть панель"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Password Authentication Gate (NO HINTS SHOWN) */
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/20 mx-auto flex items-center justify-center text-neutral-200 mb-6 shadow-inner">
              <Key className="w-8 h-8 text-neutral-300" />
            </div>

            <h4 className="font-display text-xl font-bold text-white mb-2">
              Вход для организаторов
            </h4>
            <p className="text-xs text-neutral-400 mb-6">
              Введите пароль администратора или секретный ключ организатора для доступа к управлению турнирами.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Пароль администратора"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white/40 font-mono-tech pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-chrome py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer"
              >
                Войти в панель
              </button>
            </form>
          </div>
        ) : (
          /* Main Authenticated Dashboard */
          <div>
            {/* Nav Tabs */}
            <div className="flex border-b border-white/10 bg-black/40 px-6 pt-3 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-2.5 rounded-t-lg text-xs font-mono-tech tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "list"
                    ? "bg-neutral-900 text-white border-t border-x border-white/20 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Все турниры ({tournaments.length})</span>
              </button>

              <button
                onClick={handleStartAdd}
                className={`px-4 py-2.5 rounded-t-lg text-xs font-mono-tech tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "form"
                    ? "bg-neutral-900 text-white border-t border-x border-white/20 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{editingId ? "Редактировать" : "+ Добавить турнир"}</span>
              </button>

              <button
                onClick={() => setActiveTab("access")}
                className={`px-4 py-2.5 rounded-t-lg text-xs font-mono-tech tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "access"
                    ? "bg-neutral-900 text-white border-t border-x border-white/20 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Доступ 2 организаторов</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2.5 rounded-t-lg text-xs font-mono-tech tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-neutral-900 text-white border-t border-x border-white/20 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ссылки и пароль</span>
              </button>
            </div>

            {/* Tab 1: Tournament List */}
            {activeTab === "list" && (
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase font-mono-tech">
                      Активные и запланированные турниры
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Изменения мгновенно применяются на сайте и сохраняются на устройстве.
                    </p>
                  </div>
                  <button
                    onClick={handleStartAdd}
                    className="btn-chrome px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить турнир</span>
                  </button>
                </div>

                {/* Safe In-Modal Delete Confirmation Banner */}
                {tournamentToDelete && (
                  <div className="p-4 rounded-xl bg-red-950/90 border border-red-500/50 shadow-xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Удалить турнир «{tournamentToDelete.title}»?
                        </div>
                        <div className="text-xs text-red-300">
                          Турнир исчезнет с главной страницы и из списка турниров.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setTournamentToDelete(null)}
                        className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-neutral-200 transition-colors cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Да, удалить</span>
                      </button>
                    </div>
                  </div>
                )}

                {formSuccessMessage && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{formSuccessMessage}</span>
                  </div>
                )}

                {tournaments.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-xl p-8">
                    <Trophy className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400 mb-4">На сайте пока нет активных турниров.</p>
                    <button
                      onClick={handleStartAdd}
                      className="btn-chrome px-4 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer"
                    >
                      Создать первый турнир
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tournaments.map((t, idx) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1 pt-1 text-neutral-500">
                            <button
                              onClick={() => handleMoveTournament(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              title="Поднять выше"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveTournament(idx, "down")}
                              disabled={idx === tournaments.length - 1}
                              className="p-1 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              title="Опустить ниже"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-display font-extrabold text-sm text-white">
                                {t.title}
                              </span>
                              <span className="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">
                                {t.prizePool}
                              </span>
                              <span className="text-xs text-neutral-400">
                                • {t.date} ({t.time})
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                              <span>{t.format}</span>
                              <span>• {t.teamCount} команд</span>
                              <span>• {t.region}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Switcher & Controls / Inline Delete Confirmation */}
                        {deletingId === t.id ? (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-red-950/90 border border-red-500/50 animate-fadeIn shrink-0">
                            <span className="text-xs text-red-200 font-bold">Удалить «{t.title}»?</span>
                            <button
                              type="button"
                              onClick={() => handleDirectDelete(t.id, t.title)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Да, удалить</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 text-xs transition-colors cursor-pointer"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <select
                              value={t.status}
                              onChange={(e) =>
                                handleQuickStatusChange(
                                  t.id,
                                  e.target.value as Tournament["status"]
                                )
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-tech font-bold border focus:outline-none cursor-pointer ${
                                t.status === "РЕГИСТРАЦИЯ ОТКРЫТА"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : t.status === "В ПРОЦЕССЕ"
                                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                                  : t.status === "ЗАВЕРШЕН"
                                  ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                                  : "bg-neutral-800 text-neutral-300 border-white/10"
                              }`}
                            >
                              <option value="РЕГИСТРАЦИЯ ОТКРЫТА">РЕГИСТРАЦИЯ ОТКРЫТА</option>
                              <option value="В ПРОЦЕССЕ">В ПРОЦЕССЕ</option>
                              <option value="СКОРО">СКОРО</option>
                              <option value="ЗАВЕРШЕН">ЗАВЕРШЕН</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleStartEdit(t)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Редактировать турнир"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingId(t.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Удалить турнир"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Create / Edit Tournament Form */}
            {activeTab === "form" && (
              <form onSubmit={handleSaveTournament} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-sm font-bold text-white uppercase font-mono-tech">
                    {editingId ? `Редактирование турнира: ${formData.title}` : "Новый турнир CS2"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="text-xs font-mono-tech text-neutral-400 hover:text-white cursor-pointer"
                  >
                    ← Назад к списку
                  </button>
                </div>

                {formSuccessMessage && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{formSuccessMessage}</span>
                  </div>
                )}

                {formErrorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formErrorMessage}</span>
                  </div>
                )}

                {/* Primary Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      НАЗВАНИЕ ТУРНИРА *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="например: LINEUP OPEN #2"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ПОДЗАГОЛОВОК / ОПИСАНИЕ
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="например: Еженедельный кубок 5х5"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                {/* Date, Time, Format, Teams */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ДАТА ПРОВЕДЕНИЯ
                    </label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="например: 15 ОКТ 2026"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ВРЕМЯ СТАРТА
                    </label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="например: 18:00 МСК"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ФОРМАТ МАТЧЕЙ
                    </label>
                    <input
                      type="text"
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      placeholder="5x5 Single Elimination"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      КОЛИЧЕСТВО КОМАНД
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={128}
                      value={formData.teamCount}
                      onChange={(e) =>
                        setFormData({ ...formData, teamCount: parseInt(e.target.value) || 16 })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 font-mono-tech"
                    />
                  </div>
                </div>

                {/* Prizes & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ОБЩИЙ ПРИЗОВОЙ ФОНД
                    </label>
                    <input
                      type="text"
                      value={formData.prizePool}
                      onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                      placeholder="$500 CAD"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 font-mono-tech font-bold text-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      1-Е МЕСТО
                    </label>
                    <input
                      type="text"
                      value={formData.firstPlacePrize}
                      onChange={(e) =>
                        setFormData({ ...formData, firstPlacePrize: e.target.value })
                      }
                      placeholder="$350 CAD"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 font-mono-tech"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      2-Е МЕСТО
                    </label>
                    <input
                      type="text"
                      value={formData.secondPlacePrize}
                      onChange={(e) =>
                        setFormData({ ...formData, secondPlacePrize: e.target.value })
                      }
                      placeholder="$150 CAD"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 font-mono-tech"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      СТАТУС ТУРНИРА
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Tournament["status"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 font-mono-tech"
                    >
                      <option value="РЕГИСТРАЦИЯ ОТКРЫТА">РЕГИСТРАЦИЯ ОТКРЫТА</option>
                      <option value="В ПРОЦЕССЕ">В ПРОЦЕССЕ</option>
                      <option value="СКОРО">СКОРО</option>
                      <option value="ЗАВЕРШЕН">ЗАВЕРШЕН</option>
                    </select>
                  </div>
                </div>

                {/* Servers, Anti-cheat, Deadline, Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      СЕРВЕРЫ И РЕГИОН
                    </label>
                    <input
                      type="text"
                      value={formData.serverLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, serverLocation: e.target.value })
                      }
                      placeholder="Франкфурт и Стокгольм (эквивалент 128-tick)"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      АНТИЧИТ
                    </label>
                    <input
                      type="text"
                      value={formData.antiCheat}
                      onChange={(e) => setFormData({ ...formData, antiCheat: e.target.value })}
                      placeholder="VACnet + серверная проверка"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ВЗНОС / УЧАСТИЕ
                    </label>
                    <input
                      type="text"
                      value={formData.entryFee}
                      onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                      placeholder="Бесплатно"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ДЕДЛАЙН РЕГИСТРАЦИИ
                    </label>
                    <input
                      type="text"
                      value={formData.registrationDeadline}
                      onChange={(e) =>
                        setFormData({ ...formData, registrationDeadline: e.target.value })
                      }
                      placeholder="например: 14 ОКТ 2026, 23:59 МСК"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                {/* Active Map Pool Checkboxes */}
                <div>
                  <label className="block text-xs font-mono-tech text-neutral-400 mb-2">
                    ТУРНИРНЫЙ МАППУЛ ({formData.maps.length} выбрано)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {AVAILABLE_MAPS.map((mapName) => {
                      const isSelected = formData.maps.includes(mapName);
                      return (
                        <button
                          key={mapName}
                          type="button"
                          onClick={() => handleToggleMap(mapName)}
                          className={`p-2 rounded-lg text-xs font-mono-tech transition-colors text-left flex items-center justify-between border cursor-pointer ${
                            isSelected
                              ? "bg-white/15 border-white/40 text-white font-bold"
                              : "bg-neutral-900/60 border-white/5 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>{mapName}</span>
                          {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="btn-chrome-dark px-5 py-2.5 rounded-lg text-xs font-bold uppercase cursor-pointer"
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    className="btn-chrome px-7 py-2.5 rounded-lg text-xs font-extrabold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingId ? "Сохранить изменения" : "Опубликовать турнир"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Access for 2 Organizers (Phone & PC) */}
            {activeTab === "access" && (
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white uppercase font-mono-tech">
                      Секретный доступ для 2 организаторов (ПК и Телефон)
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Как это работает: кнопка входа полностью удалена с сайта. Доступ имеют только 2 человека через секретную ссылку или скрытый жест.
                  </p>
                </div>

                {/* Secret Link Box */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-tech text-amber-300 font-bold uppercase">
                      ВАША СЕКРЕТНАЯ ССЫЛКА ОРГАНИЗАТОРА
                    </span>
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      АВТО-АВТОРИЗАЦИЯ
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    Отправьте эту ссылку второму организатору в Telegram. Достаточно открыть её <b>один раз</b> на телефоне и на компьютере:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getSecretAdminUrl()}
                      className="flex-1 px-3 py-2 rounded-lg bg-black border border-white/20 text-white font-mono-tech text-xs select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopySecretLink}
                      className="btn-chrome px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Скопировано!" : "Скопировать ссылку"}</span>
                    </button>
                  </div>
                </div>

                {/* 2 Secret Ways to Open the Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white text-xs font-bold font-mono-tech">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>1. ПО ССЫЛКЕ / ДОМЕНУ</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Откройте секретный адрес <span className="font-mono-tech text-white">?admin=lineup2026</span> в браузере телефона или ПК. Панель мгновенно откроется.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white text-xs font-bold font-mono-tech">
                      <Monitor className="w-4 h-4 text-sky-400" />
                      <span>2. НА ПК (ГОРЯЧИЕ КЛАВИШИ)</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      На компьютере в любой момент нажмите комбинацию <span className="font-mono-tech text-white">Ctrl + Shift + A</span> (или Cmd на Mac).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200">
                    <span className="font-bold text-white">Текущее устройство авторизовано. </span>
                    Обычные игроки и посетители сайта не видят ни кнопок, ни ссылок на админку. Вход доступен строго только вам и вашему со-организатору.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: System & Platform Settings */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="pb-3 border-b border-white/10">
                  <h4 className="text-sm font-bold text-white uppercase font-mono-tech">
                    Ссылки платформы и безопасность
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Управляйте ссылками на Telegram, Google Форму и GoodGame сетку.
                  </p>
                </div>

                {settingsSuccessMessage && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{settingsSuccessMessage}</span>
                  </div>
                )}

                {settingsErrorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{settingsErrorMessage}</span>
                  </div>
                )}

                {/* Safe Reset In-Modal Confirmation Banner */}
                {showResetConfirm && (
                  <div className="p-4 rounded-xl bg-red-950/90 border border-red-500/50 shadow-xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                        <RotateCcw className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Сбросить все турниры и настройки к исходным?
                        </div>
                        <div className="text-xs text-red-300">
                          Все добавленные турниры будут удалены, а ссылки возвращены к базовым.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-neutral-200 transition-colors cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onResetAll();
                          setShowResetConfirm(false);
                          setSettingsSuccessMessage("Данные успешно сброшены к начальным значениям!");
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
                      >
                        <span>Да, сбросить</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ОФИЦИАЛЬНАЯ ССЫЛКА НА TELEGRAM КАНАЛ
                    </label>
                    <input
                      type="url"
                      value={tempSettings.telegramUrl}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, telegramUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ОТОБРАЖАЕМЫЙ ЮЗЕРНЕЙМ TELEGRAM
                    </label>
                    <input
                      type="text"
                      value={tempSettings.telegramHandle}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, telegramHandle: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-mono-tech text-neutral-400">
                        ССЫЛКА НА GOOGLE ФОРМУ РЕГИСТРАЦИИ
                      </label>
                      {tempSettings.googleFormUrl && (
                        <a
                          href={tempSettings.googleFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono-tech transition-colors"
                        >
                          <span>Проверить форму</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={tempSettings.googleFormUrl}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, googleFormUrl: e.target.value })
                      }
                      placeholder="https://docs.google.com/forms/d/e/.../viewform"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech focus:outline-none focus:border-white/40"
                    />
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Встроенный фрейм на главной странице автоматически обновится при сохранении.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
                      ССЫЛКА НА ТУРНИРНУЮ СЕТКУ GOODGAME
                    </label>
                    <input
                      type="url"
                      value={tempSettings.bracketUrl}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, bracketUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-xs font-mono-tech text-neutral-300 mb-1">
                      СМЕНИТЬ ПАРОЛЬ АДМИНИСТРАТОРА
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Оставьте пустым, чтобы не менять (мин. 4 символа)"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="text-xs font-mono-tech text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сбросить к исходным данным</span>
                  </button>

                  <button
                    type="submit"
                    className="btn-chrome px-7 py-2.5 rounded-lg text-xs font-extrabold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить настройки</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
