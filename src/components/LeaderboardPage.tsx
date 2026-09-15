import React, { useState, useMemo } from "react";
import { RankedTeam, DEFAULT_TEAM_AVATAR } from "../config/ranking";
import {
  Trophy,
  Medal,
  Crown,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Layers,
  Flame,
  ArrowLeft,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { playTactileClick, playTabClick } from "../utils/audio";

interface LeaderboardPageProps {
  teams: RankedTeam[];
  seasons: string[];
  onBackToHome?: () => void;
  onBackToMain?: () => void;
  onOpenRegister?: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  teams,
  seasons,
  onBackToHome,
  onBackToMain,
  onOpenRegister,
}) => {
  const handleBack = onBackToHome || onBackToMain || (() => {});
  // Current active season filter
  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasons[0] || "Сезон 1 (2026)"
  );

  // Display limit: 10, 15, or all
  const [displayLimit, setDisplayLimit] = useState<number | "all">(10);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter and auto-sort teams by points descending
  const seasonTeams = useMemo(() => {
    return teams
      .filter((t) => t.season === selectedSeason)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [teams, selectedSeason]);

  // Filtered by search
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return seasonTeams;
    const query = searchQuery.toLowerCase().trim();
    return seasonTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        (t.tag && t.tag.toLowerCase().includes(query))
    );
  }, [seasonTeams, searchQuery]);

  // Displayed teams based on limit
  const displayedTeams = useMemo(() => {
    if (displayLimit === "all") return filteredTeams;
    return filteredTeams.slice(0, displayLimit);
  }, [filteredTeams, displayLimit]);

  // Top 3 for podium (from the current season's overall sorted list)
  const top1 = seasonTeams[0] || null;
  const top2 = seasonTeams[1] || null;
  const top3 = seasonTeams[2] || null;

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            handleBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer self-start group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Вернуться к турнирам и сетке</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono-tech text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Официальный рейтинг CS2</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-300">Обновляется автоматически</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-tech text-neutral-300 uppercase mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Лидерборд команд // Сезон 2026</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          РЕЙТИНГ <span className="text-chrome">КОМАНД</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-400">
          Официальная таблица лидеров LINEUP TOURNAMENTS. Позиции команд рассчитываются
          автоматически на основе набранных очков за матчи и кубковые победы.
        </p>
      </div>

      {/* Controls Bar: Seasons & Limit Switcher */}
      <div className="bg-neutral-950/80 rounded-2xl border border-white/10 p-4 sm:p-5 mb-10 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Season Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-tech text-neutral-400 uppercase flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Сезон:</span>
            </span>

            {seasons.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => {
                  playTabClick();
                  setSelectedSeason(season);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech uppercase tracking-wider transition-all cursor-pointer ${
                  selectedSeason === season
                    ? "bg-white text-black font-bold shadow-lg shadow-white/10"
                    : "bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {season}
              </button>
            ))}
          </div>

          {/* Right side: Top 10 / Top 15 filter & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Top 10 / Top 15 toggle */}
            <div className="flex items-center bg-black rounded-lg p-1 border border-white/10 text-xs font-mono-tech">
              <button
                type="button"
                onClick={() => {
                  playTabClick();
                  setDisplayLimit(10);
                }}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer uppercase ${
                  displayLimit === 10
                    ? "bg-white/15 text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Топ-10
              </button>
              <button
                type="button"
                onClick={() => {
                  playTabClick();
                  setDisplayLimit(15);
                }}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer uppercase ${
                  displayLimit === 15
                    ? "bg-white/15 text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Топ-15
              </button>
              <button
                type="button"
                onClick={() => {
                  playTabClick();
                  setDisplayLimit("all");
                }}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer uppercase ${
                  displayLimit === "all"
                    ? "bg-white/15 text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Все ({seasonTeams.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск команды..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 font-mono-tech"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM SECTION (Медали и пьедестал почета) */}
      {!searchQuery && seasonTeams.length >= 1 && (
        <div className="mb-14">
          <div className="text-center mb-6">
            <h3 className="text-xs font-mono-tech uppercase tracking-[0.2em] text-neutral-400 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Лидеры сезона // Пьедестал почёта</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end max-w-4xl mx-auto">
            {/* 2nd Place - Silver 🥈 */}
            {top2 && (
              <div className="order-2 md:order-1 flex flex-col items-center">
                {/* Team Card */}
                <div className="w-full rounded-2xl bg-neutral-900/90 border border-slate-400/40 p-5 flex flex-col items-center text-center shadow-xl shadow-slate-900/30 hover:border-slate-300 transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-400/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Medal Icon Badge */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 text-black font-extrabold flex items-center justify-center shadow-lg shadow-slate-400/20 mb-3 border-2 border-white text-base">
                    🥈
                  </div>

                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-slate-300 mb-2 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-600/40">
                    2-Е МЕСТО • СЕРЕБРО
                  </span>

                  {/* Team Avatar */}
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden border-2 border-slate-300 shadow-lg mb-3 bg-neutral-950">
                    <img
                      src={top2.avatar}
                      alt={top2.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                      }}
                    />
                  </div>

                  <h4 className="font-display font-bold text-white text-lg tracking-wide group-hover:text-slate-200 transition-colors">
                    {top2.name}
                  </h4>
                  {top2.tag && (
                    <span className="text-xs font-mono-tech text-slate-400 mb-2">
                      [{top2.tag}]
                    </span>
                  )}

                  {/* Points */}
                  <div className="mt-2 pt-2 border-t border-white/10 w-full flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono-tech">Очки:</span>
                    <span className="font-mono-tech font-extrabold text-slate-200 text-base">
                      {top2.points.toLocaleString()} PTS
                    </span>
                  </div>
                </div>

                {/* Pedestal Base */}
                <div className="w-full h-16 sm:h-20 bg-gradient-to-b from-slate-800 to-neutral-950 rounded-b-2xl border-x border-b border-slate-600/40 flex items-center justify-center font-display font-extrabold text-2xl text-slate-400/50">
                  #2
                </div>
              </div>
            )}

            {/* 1st Place - Gold 🥇 (Highest center pedestal) */}
            {top1 && (
              <div className="order-1 md:order-2 flex flex-col items-center -mt-4 sm:-mt-6">
                {/* Team Card */}
                <div className="w-full rounded-2xl bg-gradient-to-b from-amber-950/40 via-neutral-900 to-black border-2 border-amber-400/80 p-6 flex flex-col items-center text-center shadow-2xl shadow-amber-500/20 hover:border-amber-300 transition-all relative overflow-hidden group">
                  {/* Glowing background */}
                  <div className="absolute top-0 inset-x-0 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Crown & Medal */}
                  <div className="relative mb-2">
                    <Crown className="w-7 h-7 text-amber-300 mx-auto animate-bounce duration-1000" />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 text-black font-extrabold flex items-center justify-center shadow-xl shadow-amber-500/40 border-2 border-yellow-200 text-xl mt-1">
                      🥇
                    </div>
                  </div>

                  <span className="text-[11px] font-mono-tech uppercase tracking-widest text-amber-300 font-bold mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    ЧЕМПИОН РЕЙТИНГА
                  </span>

                  {/* Team Avatar */}
                  <div className="relative w-22 h-22 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/30 mb-3 bg-neutral-950 ring-4 ring-amber-400/20">
                    <img
                      src={top1.avatar}
                      alt={top1.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                      }}
                    />
                  </div>

                  <h4 className="font-display font-extrabold text-white text-xl sm:text-2xl tracking-wide group-hover:text-amber-200 transition-colors">
                    {top1.name}
                  </h4>
                  {top1.tag && (
                    <span className="text-xs font-mono-tech text-amber-300/80 mb-2">
                      [{top1.tag}]
                    </span>
                  )}

                  {/* Points */}
                  <div className="mt-3 pt-3 border-t border-amber-400/30 w-full flex items-center justify-between text-xs">
                    <span className="text-amber-200/70 font-mono-tech uppercase">Очки рейтинга:</span>
                    <span className="font-mono-tech font-black text-amber-300 text-xl tracking-tight">
                      {top1.points.toLocaleString()} PTS
                    </span>
                  </div>
                </div>

                {/* Pedestal Base */}
                <div className="w-full h-24 sm:h-28 bg-gradient-to-b from-amber-900/60 via-amber-950/80 to-black rounded-b-2xl border-x-2 border-b-2 border-amber-400/60 flex flex-col items-center justify-center">
                  <span className="font-display font-black text-3xl text-amber-400/80">
                    #1
                  </span>
                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-amber-400/60">
                    GOLD WINNER
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place - Bronze 🥉 */}
            {top3 && (
              <div className="order-3 flex flex-col items-center">
                {/* Team Card */}
                <div className="w-full rounded-2xl bg-neutral-900/90 border border-amber-700/40 p-5 flex flex-col items-center text-center shadow-xl shadow-amber-950/30 hover:border-amber-600 transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-700/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Medal Icon Badge */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-600 to-amber-800 text-white font-extrabold flex items-center justify-center shadow-lg shadow-amber-700/20 mb-3 border-2 border-amber-400 text-base">
                    🥉
                  </div>

                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-amber-500 mb-2 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-700/40">
                    3-Е МЕСТО • БРОНЗА
                  </span>

                  {/* Team Avatar */}
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden border-2 border-amber-700 shadow-lg mb-3 bg-neutral-950">
                    <img
                      src={top3.avatar}
                      alt={top3.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                      }}
                    />
                  </div>

                  <h4 className="font-display font-bold text-white text-lg tracking-wide group-hover:text-amber-300 transition-colors">
                    {top3.name}
                  </h4>
                  {top3.tag && (
                    <span className="text-xs font-mono-tech text-amber-500/80 mb-2">
                      [{top3.tag}]
                    </span>
                  )}

                  {/* Points */}
                  <div className="mt-2 pt-2 border-t border-white/10 w-full flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono-tech">Очки:</span>
                    <span className="font-mono-tech font-extrabold text-amber-500 text-base">
                      {top3.points.toLocaleString()} PTS
                    </span>
                  </div>
                </div>

                {/* Pedestal Base */}
                <div className="w-full h-12 sm:h-16 bg-gradient-to-b from-amber-950/80 to-neutral-950 rounded-b-2xl border-x border-b border-amber-800/40 flex items-center justify-center font-display font-extrabold text-2xl text-amber-700/50">
                  #3
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED LEADERBOARD TABLE */}
      <div className="rounded-2xl bg-neutral-950 border border-white/15 overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/50">
          <div>
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Таблица рейтинга — {selectedSeason}</span>
            </h3>
            <p className="text-xs text-neutral-400 font-mono-tech mt-0.5">
              Показано {displayedTeams.length} из {seasonTeams.length} команд сезона
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-tech text-neutral-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              Сортировка: <strong className="text-white">По очкам (MAX ↓)</strong>
            </span>
          </div>
        </div>

        {displayedTeams.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-white font-bold mb-1">Команды не найдены</h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {searchQuery
                ? "По запросу ничего не найдено. Попробуйте другой поиск."
                : "В этом сезоне пока нет команд в рейтинге."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 font-mono-tech uppercase text-[11px] bg-black/40">
                  <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Место</th>
                  <th className="py-3.5 px-4 sm:px-6">Команда</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Матчи / Winrate</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Тренд</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Очки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono-tech">
                {displayedTeams.map((team, index) => {
                  // The actual rank in this season
                  const rank = index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-white/[0.04] transition-colors ${
                        isTop1
                          ? "bg-amber-500/[0.06]"
                          : isTop2
                          ? "bg-slate-300/[0.03]"
                          : isTop3
                          ? "bg-amber-700/[0.03]"
                          : ""
                      }`}
                    >
                      {/* Rank / Place */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center">
                          {isTop1 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center shadow-lg shadow-amber-400/20 text-xs">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="w-7 h-7 rounded-full bg-slate-300 text-black font-extrabold flex items-center justify-center shadow-lg shadow-slate-300/20 text-xs">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-extrabold flex items-center justify-center shadow-lg shadow-amber-700/20 text-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-bold text-sm">
                              #{rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Logo & Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-neutral-900 flex-shrink-0">
                            <img
                              src={team.avatar}
                              alt={team.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                              }}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-white text-sm sm:text-base">
                                {team.name}
                              </span>
                              {team.tag && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono-tech">
                                  {team.tag}
                                </span>
                              )}
                              {isTop1 && (
                                <span className="hidden sm:inline-flex text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-bold">
                                  Лидер
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500 block">
                              {team.season}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Matches / Winrate */}
                      <td className="py-4 px-4 sm:px-6 text-center text-neutral-300">
                        <span className="font-bold">{team.matchesPlayed ?? 8} матчей</span>
                        <span className="text-neutral-500 text-xs block">
                          Винрейт: {team.winRate ?? "60%"}
                        </span>
                      </td>

                      {/* Trend */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        {team.trend === "up" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Вверх</span>
                          </span>
                        ) : team.trend === "down" ? (
                          <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold bg-red-500/10 px-2 py-0.5 rounded">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>Вниз</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-neutral-400 text-xs bg-white/5 px-2 py-0.5 rounded">
                            <Minus className="w-3.5 h-3.5" />
                            <span>Стабильно</span>
                          </span>
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-display font-black text-base sm:text-lg ${
                              isTop1
                                ? "text-amber-400"
                                : isTop2
                                ? "text-slate-300"
                                : isTop3
                                ? "text-amber-500"
                                : "text-white"
                            }`}
                          >
                            {team.points.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
                            POINTS
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom CTA to Register */}
      <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-b from-neutral-900 to-black border border-white/15">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
          ХОТИТЕ ВОРВАТЬСЯ В ТОП РЕЙТИНГА?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mb-6">
          Зарегистрируйте свою команду на ближайший турнир LINEUP, побеждайте соперников и
          забирайте рейтинговые очки и призовые фонды!
        </p>

        <button
          type="button"
          onClick={onOpenRegister}
          className="btn-chrome px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-white/10"
        >
          <Trophy className="w-4 h-4" />
          <span>Подать заявку на турнир</span>
        </button>
      </div>
    </div>
  );
};
