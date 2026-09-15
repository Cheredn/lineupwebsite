import React, { useState, useRef } from "react";
import {
  TournamentBracketData,
  BracketMatch,
  BracketTeamSlot,
  generateDefaultBracket,
  setMatchWinner,
} from "../config/bracket";
import { DEFAULT_TEAM_AVATAR, processImageFile } from "../config/ranking";
import {
  Trophy,
  Swords,
  Crown,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  ImagePlus,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  Clock,
  Play,
  CheckCircle2,
} from "lucide-react";
import { playTactileClick, playTabClick, playSuccessChime } from "../utils/audio";

interface AdminBracketEditorProps {
  bracket: TournamentBracketData;
  onSaveBracket: (bracket: TournamentBracketData) => void;
}

export const AdminBracketEditor: React.FC<AdminBracketEditorProps> = ({
  bracket,
  onSaveBracket,
}) => {
  const [currentBracket, setCurrentBracket] = useState<TournamentBracketData>(bracket);
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string>("");
  const [uploadingSlot, setUploadingSlot] = useState<1 | 2 | null>(null);
  const [activeView, setActiveView] = useState<"all" | "upper" | "lower">("all");

  // Temporary match edit state
  const [t1Name, setT1Name] = useState("");
  const [t1Tag, setT1Tag] = useState("");
  const [t1Avatar, setT1Avatar] = useState(DEFAULT_TEAM_AVATAR);
  const [t1Score, setT1Score] = useState<string>("");

  const [t2Name, setT2Name] = useState("");
  const [t2Tag, setT2Tag] = useState("");
  const [t2Avatar, setT2Avatar] = useState(DEFAULT_TEAM_AVATAR);
  const [t2Score, setT2Score] = useState<string>("");

  const [winnerSlot, setWinnerSlot] = useState<1 | 2 | null>(null);
  const [matchStatus, setMatchStatus] = useState<"UPCOMING" | "LIVE" | "FINISHED">("UPCOMING");
  const [matchFormat, setMatchFormat] = useState<"BO1" | "BO3" | "BO5">("BO1");

  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);

  const handleTitleChange = (newTitle: string) => {
    setCurrentBracket((prev) => ({
      ...prev,
      tournamentTitle: newTitle,
    }));
  };

  const handleToggleLowerBracket = () => {
    playTabClick();
    const newHasLower = !currentBracket.hasLowerBracket;
    const regenerated = generateDefaultBracket(
      currentBracket.tournamentTitle,
      (currentBracket.teamCount as 4 | 8 | 16) || 8,
      newHasLower
    );
    setCurrentBracket(regenerated);
    setSaveSuccess(`Нижняя сетка ${newHasLower ? "включена (Double Elimination)" : "отключена (Single Elimination)"}`);
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleChangeTeamCount = (count: 4 | 8 | 16) => {
    playTabClick();
    const regenerated = generateDefaultBracket(
      currentBracket.tournamentTitle,
      count,
      currentBracket.hasLowerBracket
    );
    setCurrentBracket(regenerated);
    setSaveSuccess(`Сетка перестроена на ${count} команд`);
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleSaveAll = () => {
    playSuccessChime();
    onSaveBracket(currentBracket);
    setSaveSuccess("Турнирная сетка успешно сохранена на сервере!");
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  const handleOpenEditMatch = (m: BracketMatch) => {
    playTactileClick();
    setEditingMatch(m);
    setT1Name(m.team1.name || "");
    setT1Tag(m.team1.tag || "");
    setT1Avatar(m.team1.avatar || DEFAULT_TEAM_AVATAR);
    setT1Score(m.team1.score !== null && m.team1.score !== undefined ? String(m.team1.score) : "");

    setT2Name(m.team2.name || "");
    setT2Tag(m.team2.tag || "");
    setT2Avatar(m.team2.avatar || DEFAULT_TEAM_AVATAR);
    setT2Score(m.team2.score !== null && m.team2.score !== undefined ? String(m.team2.score) : "");

    setWinnerSlot(m.team1.isWinner ? 1 : m.team2.isWinner ? 2 : null);
    setMatchStatus(m.status);
    setMatchFormat(m.format);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlot(slot);
    try {
      const dataUrl = await processImageFile(file, 256);
      if (slot === 1) {
        setT1Avatar(dataUrl);
      } else {
        setT2Avatar(dataUrl);
      }
    } catch (err: any) {
      alert(err.message || "Не удалось обработать изображение");
    } finally {
      setUploadingSlot(null);
      e.target.value = "";
    }
  };

  const handleSaveMatchModal = () => {
    if (!editingMatch) return;

    const s1 = t1Score.trim() === "" ? null : parseInt(t1Score, 10);
    const s2 = t2Score.trim() === "" ? null : parseInt(t2Score, 10);

    let updatedMatches = currentBracket.matches.map((m) => {
      if (m.id === editingMatch.id) {
        return {
          ...m,
          format: matchFormat,
          status: matchStatus,
          team1: {
            ...m.team1,
            name: t1Name.trim() || "Команда 1",
            tag: t1Tag.trim().toUpperCase(),
            avatar: t1Avatar || DEFAULT_TEAM_AVATAR,
            score: isNaN(Number(s1)) ? null : s1,
            isWinner: winnerSlot === 1,
          },
          team2: {
            ...m.team2,
            name: t2Name.trim() || "Команда 2",
            tag: t2Tag.trim().toUpperCase(),
            avatar: t2Avatar || DEFAULT_TEAM_AVATAR,
            score: isNaN(Number(s2)) ? null : s2,
            isWinner: winnerSlot === 2,
          },
        };
      }
      return m;
    });

    let newBracket: TournamentBracketData = {
      ...currentBracket,
      matches: updatedMatches,
    };

    // If winner is chosen, forward team to next match
    if (winnerSlot !== null) {
      newBracket = setMatchWinner(
        newBracket,
        editingMatch.id,
        winnerSlot,
        isNaN(Number(s1)) ? null : s1,
        isNaN(Number(s2)) ? null : s2
      );
    }

    playSuccessChime();
    setCurrentBracket(newBracket);
    setEditingMatch(null);
    onSaveBracket(newBracket);
    setSaveSuccess("Результат матча сохранен и продвинут по сетке!");
    setTimeout(() => setSaveSuccess(""), 3000);
  };

  // Group Upper Bracket by rounds
  const upperMatches = currentBracket.matches.filter((m) => m.bracketType === "upper");
  const upperRoundsMap: { [round: number]: BracketMatch[] } = {};
  upperMatches.forEach((m) => {
    if (!upperRoundsMap[m.round]) upperRoundsMap[m.round] = [];
    upperRoundsMap[m.round].push(m);
  });

  // Group Lower Bracket by rounds
  const lowerMatches = currentBracket.matches.filter((m) => m.bracketType === "lower");
  const lowerRoundsMap: { [round: number]: BracketMatch[] } = {};
  lowerMatches.forEach((m) => {
    if (!lowerRoundsMap[m.round]) lowerRoundsMap[m.round] = [];
    lowerRoundsMap[m.round].push(m);
  });

  const grandFinalMatch = currentBracket.matches.find((m) => m.bracketType === "grand_final");

  return (
    <div className="space-y-6">
      {/* Hidden file inputs for avatar selection */}
      <input
        type="file"
        ref={fileInputRef1}
        onChange={(e) => handleFileChange(e, 1)}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef2}
        onChange={(e) => handleFileChange(e, 2)}
        accept="image/*"
        className="hidden"
      />

      {/* TOP CONTROLS & SLIDERS (Сверху ползунки для редакции) */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/15 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono-tech tracking-wider uppercase text-neutral-400">
                РЕДАКТОР СОБСТВЕННОЙ ТУРНИРНОЙ СЕТКИ
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Интерактивная сетка турнира
            </h3>
            <p className="text-xs text-neutral-400">
              Настраивайте название, формат, команды, аватарки из галереи и счет каждого матча в реальном времени.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="btn-chrome px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Сохранить сетку</span>
            </button>
          </div>
        </div>

        {/* Sliders and Quick Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Tournament Title */}
          <div>
            <label className="block text-[11px] font-mono-tech uppercase text-neutral-400 mb-1.5">
              Название турнира в сетке
            </label>
            <input
              type="text"
              value={currentBracket.tournamentTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Например: LINEUP CS2 OPEN #1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {/* 2. Toggle Lower Bracket */}
          <div>
            <label className="block text-[11px] font-mono-tech uppercase text-neutral-400 mb-1.5">
              Нижняя сетка (Double Elimination)
            </label>
            <button
              type="button"
              onClick={handleToggleLowerBracket}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold font-mono-tech uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer border ${
                currentBracket.hasLowerBracket
                  ? "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-md shadow-amber-500/10"
                  : "bg-black/50 text-neutral-400 border-white/15 hover:border-white/30"
              }`}
            >
              <span>{currentBracket.hasLowerBracket ? "ВКЛЮЧЕНА (Виннера + Лузера)" : "ОТКЛЮЧЕНА (Single Elim)"}</span>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentBracket.hasLowerBracket ? "bg-amber-400 text-black font-extrabold" : "bg-neutral-700 text-neutral-300"
                }`}
              >
                {currentBracket.hasLowerBracket ? "✓" : "✕"}
              </span>
            </button>
          </div>

          {/* 3. Team Count Slider / Selector */}
          <div>
            <label className="block text-[11px] font-mono-tech uppercase text-neutral-400 mb-1.5">
              Количество команд: <span className="text-white font-bold">{currentBracket.teamCount}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[4, 8, 16].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleChangeTeamCount(cnt as 4 | 8 | 16)}
                  className={`py-2 rounded-lg text-xs font-mono-tech font-bold uppercase transition-all cursor-pointer ${
                    currentBracket.teamCount === cnt
                      ? "bg-white text-black shadow-md"
                      : "bg-black/40 text-neutral-400 border border-white/10 hover:border-white/20"
                  }`}
                >
                  {cnt} команд
                </button>
              ))}
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Filter tabs if Lower Bracket is enabled */}
      {currentBracket.hasLowerBracket && (
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => {
              playTabClick();
              setActiveView("all");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase cursor-pointer ${
              activeView === "all" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            Вся сетка
          </button>
          <button
            type="button"
            onClick={() => {
              playTabClick();
              setActiveView("upper");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase cursor-pointer ${
              activeView === "upper" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            Верхняя сетка (Виннера)
          </button>
          <button
            type="button"
            onClick={() => {
              playTabClick();
              setActiveView("lower");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase cursor-pointer ${
              activeView === "lower" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            Нижняя сетка (Лузера)
          </button>
        </div>
      )}

      {/* VISUAL BRACKET VIEW (Сетка открывается именно в виде сетки!) */}
      <div className="rounded-2xl bg-black border border-white/15 p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[700px] space-y-12">
          {/* SECTION 1: UPPER BRACKET */}
          {(activeView === "all" || activeView === "upper") && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h4 className="font-display text-sm uppercase tracking-wider text-white font-extrabold">
                    {currentBracket.hasLowerBracket ? "ВЕРХНЯЯ СЕТКА (СЕТКА ВИННЕРОВ)" : "ОСНОВНАЯ СЕТКА ТУРНИРА"}
                  </h4>
                </div>
                <span className="text-[11px] font-mono-tech text-neutral-400">
                  Кликните по матчу для редактирования команд, фото и счета
                </span>
              </div>

              <div className="flex items-start gap-8">
                {Object.keys(upperRoundsMap)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((roundStr) => {
                    const roundNum = Number(roundStr);
                    const roundMatches = upperRoundsMap[roundNum];
                    const roundTitle = roundMatches[0]?.roundName || `Раунд ${roundNum}`;

                    return (
                      <div key={`ub-round-${roundNum}`} className="flex-1 min-w-[240px] space-y-4">
                        <div className="text-center py-1.5 px-3 rounded-lg bg-neutral-900 border border-white/10">
                          <span className="text-[11px] font-mono-tech uppercase text-neutral-300 font-bold tracking-wider">
                            {roundTitle}
                          </span>
                        </div>

                        <div className="space-y-6 flex flex-col justify-around h-full">
                          {roundMatches.map((m) => (
                            <MatchCard
                              key={m.id}
                              match={m}
                              onEdit={() => handleOpenEditMatch(m)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SECTION 2: LOWER BRACKET (if enabled) */}
          {currentBracket.hasLowerBracket && (activeView === "all" || activeView === "lower") && (
            <div className="pt-6 border-t border-white/15">
              <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <h4 className="font-display text-sm uppercase tracking-wider text-amber-300 font-extrabold">
                    НИЖНЯЯ СЕТКА (СЕТКА ЛУЗЕРОВ / DOUBLE ELIMINATION)
                  </h4>
                </div>
                <span className="text-[11px] font-mono-tech text-neutral-400">
                  Проигравшие в верхней сетке продолжают борьбу
                </span>
              </div>

              <div className="flex items-start gap-8">
                {Object.keys(lowerRoundsMap)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((roundStr) => {
                    const roundNum = Number(roundStr);
                    const roundMatches = lowerRoundsMap[roundNum];
                    const roundTitle = roundMatches[0]?.roundName || `Раунд ${roundNum}`;

                    return (
                      <div key={`lb-round-${roundNum}`} className="flex-1 min-w-[240px] space-y-4">
                        <div className="text-center py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                          <span className="text-[11px] font-mono-tech uppercase text-amber-300 font-bold tracking-wider">
                            {roundTitle}
                          </span>
                        </div>

                        <div className="space-y-6 flex flex-col justify-around h-full">
                          {roundMatches.map((m) => (
                            <MatchCard
                              key={m.id}
                              match={m}
                              onEdit={() => handleOpenEditMatch(m)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SECTION 3: GRAND FINAL (if Double Elimination) */}
          {currentBracket.hasLowerBracket && grandFinalMatch && activeView === "all" && (
            <div className="pt-6 border-t border-white/15">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-4 h-4 text-amber-400" />
                <h4 className="font-display text-sm uppercase tracking-wider text-white font-extrabold">
                  ГРАНД-ФИНАЛ ЧЕМПИОНАТА
                </h4>
              </div>
              <div className="max-w-md">
                <MatchCard
                  match={grandFinalMatch}
                  onEdit={() => handleOpenEditMatch(grandFinalMatch)}
                  isGrandFinal
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MATCH MODAL (Редактирование команд, аватарки из галереи и счета) */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-neutral-950 border border-white/20 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono-tech uppercase px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                  {editingMatch.roundName} // {editingMatch.id}
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  Редактирование матча
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMatch(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Match status and format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-tech uppercase text-neutral-400 mb-1">
                    Статус матча
                  </label>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none"
                  >
                    <option value="UPCOMING">Ожидается (UPCOMING)</option>
                    <option value="LIVE">В прямом эфире (LIVE)</option>
                    <option value="FINISHED">Завершен (FINISHED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono-tech uppercase text-neutral-400 mb-1">
                    Формат
                  </label>
                  <select
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none"
                  >
                    <option value="BO1">Best of 1 (BO1)</option>
                    <option value="BO3">Best of 3 (BO3)</option>
                    <option value="BO5">Best of 5 (BO5)</option>
                  </select>
                </div>
              </div>

              {/* TEAM 1 */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  winnerSlot === 1
                    ? "bg-amber-500/10 border-amber-400/50"
                    : "bg-neutral-900/70 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono-tech uppercase font-bold text-neutral-300">
                    КОМАНДА 1 (ВЕРХНИЙ СЛОТ)
                  </span>
                  <button
                    type="button"
                    onClick={() => setWinnerSlot(winnerSlot === 1 ? null : 1)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono-tech uppercase flex items-center gap-1.5 cursor-pointer ${
                      winnerSlot === 1
                        ? "bg-amber-400 text-black font-bold"
                        : "bg-white/10 text-neutral-300 hover:bg-white/20"
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{winnerSlot === 1 ? "Победитель ✓" : "Назначить победителем"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Avatar upload */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-950 border border-white/20 shrink-0">
                      <img
                        src={t1Avatar || DEFAULT_TEAM_AVATAR}
                        alt={t1Name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef1.current?.click()}
                      disabled={uploadingSlot === 1}
                      className="btn-chrome-dark px-2.5 py-1.5 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ImagePlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>{uploadingSlot === 1 ? "Загрузка..." : "Из галереи"}</span>
                    </button>
                  </div>

                  {/* Name & Tag */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono-tech uppercase mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      value={t1Name}
                      onChange={(e) => setT1Name(e.target.value)}
                      placeholder="Название команды"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                    />
                  </div>

                  {/* Score */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono-tech uppercase mb-1">
                      Счет
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={t1Score}
                      onChange={(e) => setT1Score(e.target.value)}
                      placeholder="—"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-bold text-center font-mono-tech"
                    />
                  </div>
                </div>
              </div>

              {/* TEAM 2 */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  winnerSlot === 2
                    ? "bg-amber-500/10 border-amber-400/50"
                    : "bg-neutral-900/70 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono-tech uppercase font-bold text-neutral-300">
                    КОМАНДА 2 (НИЖНИЙ СЛОТ)
                  </span>
                  <button
                    type="button"
                    onClick={() => setWinnerSlot(winnerSlot === 2 ? null : 2)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono-tech uppercase flex items-center gap-1.5 cursor-pointer ${
                      winnerSlot === 2
                        ? "bg-amber-400 text-black font-bold"
                        : "bg-white/10 text-neutral-300 hover:bg-white/20"
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{winnerSlot === 2 ? "Победитель ✓" : "Назначить победителем"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Avatar upload */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-950 border border-white/20 shrink-0">
                      <img
                        src={t2Avatar || DEFAULT_TEAM_AVATAR}
                        alt={t2Name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef2.current?.click()}
                      disabled={uploadingSlot === 2}
                      className="btn-chrome-dark px-2.5 py-1.5 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ImagePlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>{uploadingSlot === 2 ? "Загрузка..." : "Из галереи"}</span>
                    </button>
                  </div>

                  {/* Name & Tag */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono-tech uppercase mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      value={t2Name}
                      onChange={(e) => setT2Name(e.target.value)}
                      placeholder="Название команды"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                    />
                  </div>

                  {/* Score */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono-tech uppercase mb-1">
                      Счет
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={t2Score}
                      onChange={(e) => setT2Score(e.target.value)}
                      placeholder="—"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-bold text-center font-mono-tech"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setWinnerSlot(null);
                    setT1Score("");
                    setT2Score("");
                    setMatchStatus("UPCOMING");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono-tech uppercase text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  Очистить счет
                </button>
                <button
                  type="button"
                  onClick={handleSaveMatchModal}
                  className="btn-chrome px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Сохранить результат матча</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MatchCardProps {
  match: BracketMatch;
  onEdit: () => void;
  isGrandFinal?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onEdit, isGrandFinal }) => {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <div
      onClick={onEdit}
      className={`relative rounded-xl border transition-all cursor-pointer group select-none ${
        isGrandFinal
          ? "bg-gradient-to-b from-amber-500/10 via-neutral-900 to-black border-amber-400/40 shadow-xl shadow-amber-500/5 hover:border-amber-400/70"
          : isLive
          ? "bg-neutral-900/90 border-emerald-400/50 shadow-lg shadow-emerald-500/10 hover:border-emerald-400"
          : "bg-neutral-950 border-white/15 hover:border-white/40 shadow-md"
      }`}
    >
      {/* Top micro header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02] text-[10px] font-mono-tech text-neutral-400">
        <span className="uppercase">{match.format}</span>
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          ) : isFinished ? (
            <span className="text-neutral-400">ЗАВЕРШЕН</span>
          ) : (
            <span className="text-neutral-500">СКОРО</span>
          )}
          <Edit3 className="w-3 h-3 text-neutral-500 group-hover:text-amber-400 transition-colors" />
        </div>
      </div>

      {/* Team 1 Row */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-white/5 transition-colors ${
          match.team1.isWinner ? "bg-amber-500/10 font-bold" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-6 h-6 rounded-md overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
            <img
              src={match.team1.avatar || DEFAULT_TEAM_AVATAR}
              alt={match.team1.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
              }}
            />
          </div>
          <span
            className={`text-xs truncate ${
              match.team1.isWinner ? "text-amber-300 font-bold" : "text-neutral-200"
            }`}
          >
            {match.team1.name}
          </span>
          {match.team1.isWinner && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
        </div>
        <span
          className={`font-mono-tech text-xs font-bold px-2 py-0.5 rounded ${
            match.team1.isWinner
              ? "bg-amber-400/20 text-amber-300"
              : match.team1.score !== null
              ? "text-neutral-200"
              : "text-neutral-600"
          }`}
        >
          {match.team1.score !== null && match.team1.score !== undefined ? match.team1.score : "—"}
        </span>
      </div>

      {/* Team 2 Row */}
      <div
        className={`flex items-center justify-between px-3 py-2 transition-colors ${
          match.team2.isWinner ? "bg-amber-500/10 font-bold" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-6 h-6 rounded-md overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
            <img
              src={match.team2.avatar || DEFAULT_TEAM_AVATAR}
              alt={match.team2.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
              }}
            />
          </div>
          <span
            className={`text-xs truncate ${
              match.team2.isWinner ? "text-amber-300 font-bold" : "text-neutral-200"
            }`}
          >
            {match.team2.name}
          </span>
          {match.team2.isWinner && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
        </div>
        <span
          className={`font-mono-tech text-xs font-bold px-2 py-0.5 rounded ${
            match.team2.isWinner
              ? "bg-amber-400/20 text-amber-300"
              : match.team2.score !== null
              ? "text-neutral-200"
              : "text-neutral-600"
          }`}
        >
          {match.team2.score !== null && match.team2.score !== undefined ? match.team2.score : "—"}
        </span>
      </div>
    </div>
  );
};
