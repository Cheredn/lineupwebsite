import React, { useState, useEffect } from "react";
import { SITE_CONFIG, Tournament } from "../config/site";
import {
  formatGoogleFormEmbedUrl,
  addStoredRegistration,
  RegistrationSubmission,
} from "../utils/adminStorage";
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Users,
  Send,
  Copy,
  Check,
  Trophy,
  AlertCircle,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

interface RegistrationSectionProps {
  tournaments?: Tournament[];
  selectedTournament?: Tournament | null;
  googleFormUrl?: string;
  googleFormEmbedUrl?: string;
  telegramUrl?: string;
  telegramHandle?: string;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  tournaments = [],
  selectedTournament,
  googleFormUrl,
  googleFormEmbedUrl,
  telegramUrl = SITE_CONFIG.telegramUrl,
  telegramHandle = SITE_CONFIG.telegramHandle,
}) => {
  const directFormUrl = googleFormUrl || SITE_CONFIG.googleFormUrl;
  const embedFormUrl =
    googleFormEmbedUrl && googleFormEmbedUrl.includes("embedded=true")
      ? googleFormEmbedUrl
      : formatGoogleFormEmbedUrl(directFormUrl);

  // Tab mode: "native" (shows full form directly) or "google" (iframe)
  const [activeTab, setActiveTab] = useState<"native" | "google">("native");

  // Form Fields
  const availableTournaments = tournaments.length > 0 ? tournaments : SITE_CONFIG.tournaments;
  const [chosenTournamentId, setChosenTournamentId] = useState<string>("");

  const [teamName, setTeamName] = useState("");
  const [captainNick, setCaptainNick] = useState("");
  const [captainContact, setCaptainContact] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player3, setPlayer3] = useState("");
  const [player4, setPlayer4] = useState("");
  const [player5, setPlayer5] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [steamProfile, setSteamProfile] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationSubmission | null>(null);
  const [copiedRoster, setCopiedRoster] = useState(false);

  // Sync chosen tournament when selectedTournament changes from props
  useEffect(() => {
    if (selectedTournament) {
      setChosenTournamentId(selectedTournament.id);
    } else if (availableTournaments.length > 0 && !chosenTournamentId) {
      setChosenTournamentId(availableTournaments[0].id);
    }
  }, [selectedTournament, availableTournaments]);

  // Autofill player1 with captainNick if player1 is untouched
  const handleCaptainChange = (val: string) => {
    setCaptainNick(val);
    if (!player1 || player1 === captainNick) {
      setPlayer1(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!teamName.trim()) {
      setFormError("Укажите название вашей команды.");
      return;
    }
    if (!captainNick.trim()) {
      setFormError("Укажите никнейм капитана.");
      return;
    }
    if (!captainContact.trim()) {
      setFormError("Укажите контакт капитана (Telegram @username или Discord).");
      return;
    }
    if (!player1.trim() || !player2.trim() || !player3.trim() || !player4.trim() || !player5.trim()) {
      setFormError("Укажите никнеймы всех 5 основных игроков состава команды.");
      return;
    }

    setIsSubmitting(true);

    const selectedTourn = availableTournaments.find((t) => t.id === chosenTournamentId) || availableTournaments[0];

    try {
      const submission = addStoredRegistration({
        tournamentId: selectedTourn ? selectedTourn.id : "default",
        tournamentTitle: selectedTourn ? selectedTourn.title : "LINEUP CS2 TOURNAMENT",
        teamName: teamName.trim(),
        captainNick: captainNick.trim(),
        captainContact: captainContact.trim(),
        player1: player1.trim(),
        player2: player2.trim(),
        player3: player3.trim(),
        player4: player4.trim(),
        player5: player5.trim(),
        substitute: substitute.trim() || undefined,
        steamProfile: steamProfile.trim() || undefined,
      });

      setSubmittedData(submission);
      setIsSubmitting(false);

      // Reset form inputs
      setTeamName("");
      setCaptainNick("");
      setCaptainContact("");
      setPlayer1("");
      setPlayer2("");
      setPlayer3("");
      setPlayer4("");
      setPlayer5("");
      setSubstitute("");
      setSteamProfile("");
    } catch (err) {
      console.error(err);
      setFormError("Произошла ошибка при сохранении заявки. Попробуйте снова.");
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = () => {
    if (!submittedData) return;
    const text = `🏆 ЗАЯВКА НА ТУРНИР LINEUP:
Турнир: ${submittedData.tournamentTitle}
Команда: ${submittedData.teamName}
Капитан: ${submittedData.captainNick} (${submittedData.captainContact})
Состав:
1. ${submittedData.player1} (Капитан)
2. ${submittedData.player2}
3. ${submittedData.player3}
4. ${submittedData.player4}
5. ${submittedData.player5}
${submittedData.substitute ? `Запасной: ${submittedData.substitute}` : ""}
${submittedData.steamProfile ? `Steam/Faceit: ${submittedData.steamProfile}` : ""}
Дата подачи: ${submittedData.submittedAt}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedRoster(true);
        setTimeout(() => setCopiedRoster(false), 2500);
      });
    }
  };

  return (
    <section id="register" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-tech text-neutral-300 uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Сезон 2026 // Официальный приём заявок</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            РЕГИСТРАЦИЯ <span className="text-chrome">КОМАНДЫ</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 font-medium max-w-xl mx-auto mb-2">
            Заполните анкету состава прямо здесь или используйте Google-форму
          </p>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
            Все поля открыты сразу. Заявка моментально сохраняется в системе и отправляется организаторам турнира.
          </p>
        </div>

        {/* Requirements Checklist Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 rounded-xl glass-panel border-white/10">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">5 активных игроков</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">Привязанный SteamID / Faceit</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">Telegram капитана</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">Без банов VAC</span>
          </div>
        </div>

        {/* Outer Registration Card */}
        <div
          id="registration-wrapper"
          className="relative rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-2xl shadow-black/90 p-5 sm:p-8"
        >
          {/* View Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-white/10 w-fit">
              <button
                type="button"
                id="tab-native-form-btn"
                onClick={() => setActiveTab("native")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "native"
                    ? "bg-white text-black shadow-md shadow-white/10"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Прямая анкета LineUp (Все поля)</span>
              </button>

              <button
                type="button"
                id="tab-google-form-btn"
                onClick={() => setActiveTab("google")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "google"
                    ? "bg-white text-black shadow-md shadow-white/10"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Google Форма (iFrame)</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={directFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="open-google-form-external-btn"
                className="btn-chrome px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Открыть в Google Forms</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* TAB 1: FULL NATIVE FORM (NO BUTTONS, ALL INPUTS FULLY SHOWN) */}
          {activeTab === "native" && (
            <div>
              {submittedData ? (
                /* SUCCESS RECEIPT STATE */
                <div className="py-8 px-4 text-center max-w-xl mx-auto animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                    <Check className="w-8 h-8" />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    Заявка команды успешно принята!
                  </h3>
                  <p className="text-neutral-300 text-sm mb-6">
                    Команда <strong className="text-white">«{submittedData.teamName}»</strong> зарегистрирована на турнир{" "}
                    <strong className="text-amber-300">{submittedData.tournamentTitle}</strong>.
                  </p>

                  <div className="bg-neutral-950 rounded-xl p-4 text-left border border-white/10 mb-6 space-y-2 font-mono-tech text-xs">
                    <div className="flex justify-between text-neutral-400 pb-2 border-b border-white/10">
                      <span>ID ЗАЯВКИ:</span>
                      <span className="text-neutral-200">{submittedData.id}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>КАПИТАН:</span>
                      <span className="text-white font-bold">{submittedData.captainNick}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>СВЯЗЬ:</span>
                      <span className="text-white">{submittedData.captainContact}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 text-neutral-400">
                      <div className="mb-1 text-neutral-300 font-bold">СОСТАВ:</div>
                      <div className="text-neutral-300">
                        1. {submittedData.player1} (К) • 2. {submittedData.player2} • 3. {submittedData.player3} • 4. {submittedData.player4} • 5. {submittedData.player5}
                      </div>
                      {submittedData.substitute && (
                        <div className="text-neutral-400 mt-0.5">Запасной: {submittedData.substitute}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedRoster ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Скопировать данные заявки</span>
                        </>
                      )}
                    </button>

                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg btn-chrome font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Канал турнира @{telegramHandle.replace("@", "")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="mt-6 text-xs text-neutral-400 hover:text-white underline cursor-pointer transition-colors"
                  >
                    Подать заявку для ещё одной команды
                  </button>
                </div>
              ) : (
                /* FULL NATIVE FORM */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formError && (
                    <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* 1. Tournament Selector */}
                  <div>
                    <label className="block text-xs font-mono-tech uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>ВЫБЕРИТЕ ТУРНИР ДЛЯ УЧАСТИЯ *</span>
                    </label>
                    <select
                      value={chosenTournamentId}
                      onChange={(e) => setChosenTournamentId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-white/40 cursor-pointer"
                    >
                      {availableTournaments.map((t) => (
                        <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                          {t.title} — {t.prizePool} ({t.date}, {t.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Team & Captain Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-tech uppercase tracking-wider text-neutral-300 mb-2">
                        НАЗВАНИЕ КОМАНДЫ *
                      </label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Например: NAVI Junior, CYBER_LEGENDS"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono-tech uppercase tracking-wider text-neutral-300 mb-2">
                        НИКНЕЙМ КАПИТАНА *
                      </label>
                      <input
                        type="text"
                        required
                        value={captainNick}
                        onChange={(e) => handleCaptainChange(e.target.value)}
                        placeholder="Никнейм капитана"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {/* 3. Captain Contact & Socials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-tech uppercase tracking-wider text-neutral-300 mb-2">
                        КОНТАКТ КАПИТАНА (TELEGRAM / DISCORD) *
                      </label>
                      <input
                        type="text"
                        required
                        value={captainContact}
                        onChange={(e) => setCaptainContact(e.target.value)}
                        placeholder="@username_telegram или Discord Tag"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono-tech uppercase tracking-wider text-neutral-300 mb-2">
                        ССЫЛКА НА FACEIT ИЛИ STEAM КОМАНДЫ
                      </label>
                      <input
                        type="text"
                        value={steamProfile}
                        onChange={(e) => setSteamProfile(e.target.value)}
                        placeholder="https://faceit.com/team/... или Steam"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {/* 4. Full 5-Player Lineup */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-xs font-mono-tech uppercase tracking-wider text-neutral-300 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>СОСТАВ КОМАНДЫ (5 ОСНОВНЫХ ИГРОКОВ) *</span>
                      </span>
                      <span className="text-[11px] text-neutral-500 font-normal">
                        Никнейм игрока и/или SteamID
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 mb-1">
                          ИГРОК 1 (КАПИТАН) *
                        </span>
                        <input
                          type="text"
                          required
                          value={player1}
                          onChange={(e) => setPlayer1(e.target.value)}
                          placeholder="Никнейм капитана"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech placeholder:text-neutral-600 focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 mb-1">
                          ИГРОК 2 *
                        </span>
                        <input
                          type="text"
                          required
                          value={player2}
                          onChange={(e) => setPlayer2(e.target.value)}
                          placeholder="Никнейм 2-го игрока"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech placeholder:text-neutral-600 focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 mb-1">
                          ИГРОК 3 *
                        </span>
                        <input
                          type="text"
                          required
                          value={player3}
                          onChange={(e) => setPlayer3(e.target.value)}
                          placeholder="Никнейм 3-го игрока"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech placeholder:text-neutral-600 focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 mb-1">
                          ИГРОК 4 *
                        </span>
                        <input
                          type="text"
                          required
                          value={player4}
                          onChange={(e) => setPlayer4(e.target.value)}
                          placeholder="Никнейм 4-го игрока"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech placeholder:text-neutral-600 focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 mb-1">
                          ИГРОК 5 *
                        </span>
                        <input
                          type="text"
                          required
                          value={player5}
                          onChange={(e) => setPlayer5(e.target.value)}
                          placeholder="Никнейм 5-го игрока"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono-tech placeholder:text-neutral-600 focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 mb-1">
                          ЗАПАСНОЙ (ОПЦИОНАЛЬНО)
                        </span>
                        <input
                          type="text"
                          value={substitute}
                          onChange={(e) => setSubstitute(e.target.value)}
                          placeholder="Никнейм запасного"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 text-xs font-mono-tech placeholder:text-neutral-600 focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Bar */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Заявка будет моментально внесена в турнирную сетку и базу команд.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      id="submit-team-registration-btn"
                      className="btn-chrome px-8 py-3.5 rounded-xl font-display font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "ОТПРАВКА..." : "ОТПРАВИТЬ ЗАЯВКУ НА ТУРНИР"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE FORM IFRAME EMBED */}
          {activeTab === "google" && (
            <div>
              {/* Informative helper note about Google's "Заполните форму" button */}
              <div className="mb-4 p-3.5 rounded-xl bg-neutral-900/90 border border-white/15 text-xs text-neutral-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">
                    💡 Если Google-форма ниже показывает серую кнопку «Заполните форму»:
                  </strong>
                  <span>
                    В настройках вашей Google-формы включена авторизация. Чтобы форма открывалась полностью со всеми полями без этой кнопки, перейдите в редактирование вашей Google-формы → вкладка{" "}
                    <strong className="text-white">«Настройки»</strong> → блок <strong className="text-white">«Ответы»</strong> → отключите галочку{" "}
                    <strong className="text-amber-300">«Ограничить до 1 ответа»</strong> (требовать вход в Google) и сохраните.
                  </span>
                </div>
              </div>

              {/* THE REAL GOOGLE FORM IFRAME */}
              <div className="w-full bg-neutral-950 rounded-xl overflow-hidden border border-white/10 min-h-[650px] sm:min-h-[750px] md:min-h-[820px] relative">
                <iframe
                  key={embedFormUrl}
                  src={embedFormUrl}
                  id="lineup-google-form-iframe"
                  title="Google-форма регистрации команды LINEUP TOURNAMENTS"
                  className="w-full h-[650px] sm:h-[750px] md:h-[820px] border-0 bg-neutral-950"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  allow="storage-access *; clipboard-write; web-share"
                  loading="lazy"
                >
                  Загрузка Google-формы…
                </iframe>
              </div>
            </div>
          )}

          {/* Bottom Security Assurance */}
          <div className="mt-4 pt-3 flex items-center justify-center sm:justify-start text-[11px] text-neutral-400 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
              Прямая регистрация команд LINEUP TOURNAMENTS с SSL-шифрованием.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
