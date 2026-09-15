import React, { useState } from "react";
import { TournamentBracketData, BracketMatch } from "../config/bracket";
import { DEFAULT_TEAM_AVATAR } from "../config/ranking";
import {
  Trophy,
  Swords,
  Crown,
  Flame,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { playTabClick, playTactileClick } from "../utils/audio";

interface TournamentBracketProps {
  bracket: TournamentBracketData;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ bracket }) => {
  const [activeTab, setActiveTab] = useState<"all" | "upper" | "lower">("all");
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);

  // Fallback safe data
  const safeBracket: TournamentBracketData = bracket || {
    id: "default-bracket",
    tournamentTitle: "LINEUP CS2 CHAMPIONSHIP",
    hasLowerBracket: false,
    teamCount: 8,
    matches: [],
  };

  const matches = safeBracket.matches || [];

  // Group Upper Bracket by rounds
  const upperMatches = matches.filter((m) => m.bracketType === "upper");
  const upperRoundsMap: { [round: number]: BracketMatch[] } = {};
  upperMatches.forEach((m) => {
    if (!upperRoundsMap[m.round]) upperRoundsMap[m.round] = [];
    upperRoundsMap[m.round].push(m);
  });

  // Group Lower Bracket by rounds
  const lowerMatches = matches.filter((m) => m.bracketType === "lower");
  const lowerRoundsMap: { [round: number]: BracketMatch[] } = {};
  lowerMatches.forEach((m) => {
    if (!lowerRoundsMap[m.round]) lowerRoundsMap[m.round] = [];
    lowerRoundsMap[m.round].push(m);
  });

  const grandFinalMatch = matches.find((m) => m.bracketType === "grand_final");

  return (
    <section id="bracket" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase">
                {safeBracket.hasLowerBracket
                  ? `СЕТКА НА ${safeBracket.teamCount} КОМАНД (DOUBLE ELIMINATION)`
                  : `СЕТКА НА ${safeBracket.teamCount} КОМАНД (SINGLE ELIMINATION)`}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              ТУРНИРНАЯ <span className="text-chrome">СЕТКА</span>
            </h2>
          </div>

          {/* Tournament Title Badge */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-neutral-900/80 border border-white/10 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                {safeBracket.tournamentTitle || "LINEUP CS2 CHAMPIONSHIP"}
              </span>
            </div>
          </div>
        </div>

        {/* View mode buttons if Lower Bracket is enabled */}
        {safeBracket.hasLowerBracket && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => {
                playTabClick();
                setActiveTab("all");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono-tech uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "bg-neutral-900 text-neutral-400 border border-white/10 hover:text-white"
              }`}
            >
              Вся сетка
            </button>
            <button
              type="button"
              onClick={() => {
                playTabClick();
                setActiveTab("upper");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono-tech uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "upper"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "bg-neutral-900 text-neutral-400 border border-white/10 hover:text-white"
              }`}
            >
              Сетка виннеров
            </button>
            <button
              type="button"
              onClick={() => {
                playTabClick();
                setActiveTab("lower");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono-tech uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "lower"
                  ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/10"
                  : "bg-neutral-900 text-neutral-400 border border-white/10 hover:text-white"
              }`}
            >
              Сетка лузеров (Double Elim)
            </button>
          </div>
        )}

        {/* BRACKET MAIN CONTAINER */}
        <div className="relative rounded-2xl glass-panel border border-white/15 shadow-2xl shadow-black/90 p-4 sm:p-8 overflow-hidden">
          {matches.length === 0 ? (
            <div className="py-20 text-center">
              <Trophy className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-white font-bold mb-1">Сетка формируется</h4>
              <p className="text-xs text-neutral-400">
                Организаторы формируют посев команд. Скоро здесь появится расписание матчей.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="min-w-[780px] space-y-12">
                {/* 1. UPPER BRACKET */}
                {(activeTab === "all" || activeTab === "upper") && (
                  <div>
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h4 className="font-display text-xs uppercase tracking-widest text-white font-extrabold">
                        {safeBracket.hasLowerBracket
                          ? "ВЕРХНЯЯ СЕТКА // СЕТКА ВИННЕРОВ"
                          : "ОСНОВНАЯ ТУРНИРНАЯ СЕТКА"}
                      </h4>
                    </div>

                    <div className="flex items-stretch gap-6 sm:gap-10">
                      {Object.keys(upperRoundsMap)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((roundStr) => {
                          const roundNum = Number(roundStr);
                          const roundMatches = upperRoundsMap[roundNum];
                          const roundTitle = roundMatches[0]?.roundName || `Раунд ${roundNum}`;

                          return (
                            <div key={`pub-ub-${roundNum}`} className="flex-1 min-w-[240px] flex flex-col">
                              {/* Round Header */}
                              <div className="text-center py-2 px-3 rounded-xl bg-neutral-900/90 border border-white/10 mb-6 shadow-sm">
                                <span className="text-xs font-mono-tech uppercase font-bold text-neutral-200 tracking-wider">
                                  {roundTitle}
                                </span>
                              </div>

                              {/* Round Matches */}
                              <div className="flex-1 flex flex-col justify-around gap-6">
                                {roundMatches.map((m) => (
                                  <PublicMatchCard
                                    key={m.id}
                                    match={m}
                                    onSelect={() => setSelectedMatch(m)}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 2. LOWER BRACKET (if enabled) */}
                {safeBracket.hasLowerBracket && (activeTab === "all" || activeTab === "lower") && (
                  <div className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h4 className="font-display text-xs uppercase tracking-widest text-amber-300 font-extrabold">
                        НИЖНЯЯ СЕТКА // СЕТКА ЛУЗЕРОВ (DOUBLE ELIMINATION)
                      </h4>
                    </div>

                    <div className="flex items-stretch gap-6 sm:gap-10">
                      {Object.keys(lowerRoundsMap)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((roundStr) => {
                          const roundNum = Number(roundStr);
                          const roundMatches = lowerRoundsMap[roundNum];
                          const roundTitle = roundMatches[0]?.roundName || `Раунд ${roundNum}`;

                          return (
                            <div key={`pub-lb-${roundNum}`} className="flex-1 min-w-[240px] flex flex-col">
                              {/* Round Header */}
                              <div className="text-center py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-400/20 mb-6 shadow-sm">
                                <span className="text-xs font-mono-tech uppercase font-bold text-amber-300 tracking-wider">
                                  {roundTitle}
                                </span>
                              </div>

                              {/* Round Matches */}
                              <div className="flex-1 flex flex-col justify-around gap-6">
                                {roundMatches.map((m) => (
                                  <PublicMatchCard
                                    key={m.id}
                                    match={m}
                                    onSelect={() => setSelectedMatch(m)}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 3. GRAND FINAL (if Double Elimination) */}
                {safeBracket.hasLowerBracket && grandFinalMatch && activeTab === "all" && (
                  <div className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <h4 className="font-display text-xs uppercase tracking-widest text-white font-extrabold">
                        ГРАНД-ФИНАЛ
                      </h4>
                    </div>
                    <div className="max-w-sm">
                      <PublicMatchCard
                        match={grandFinalMatch}
                        onSelect={() => setSelectedMatch(grandFinalMatch)}
                        isGrandFinal
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Details Popup Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-neutral-950 border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono-tech uppercase text-neutral-400">
                  {selectedMatch.roundName}
                </span>
                <h3 className="font-display text-base font-bold text-white">
                  Матч: {selectedMatch.team1.name} vs {selectedMatch.team2.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setSelectedMatch(null);
                }}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Teams & Score Card */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 space-y-3">
                {/* Team 1 */}
                <div
                  className={`flex items-center justify-between p-2.5 rounded-lg ${
                    selectedMatch.team1.isWinner ? "bg-amber-500/10 border border-amber-400/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-800 border border-white/15 shrink-0">
                      <img
                        src={selectedMatch.team1.avatar || DEFAULT_TEAM_AVATAR}
                        alt={selectedMatch.team1.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedMatch.team1.name}</h4>
                      {selectedMatch.team1.tag && (
                        <span className="text-[10px] font-mono-tech text-neutral-400">
                          [{selectedMatch.team1.tag}]
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`font-mono-tech text-base font-extrabold ${
                      selectedMatch.team1.isWinner ? "text-amber-400" : "text-neutral-300"
                    }`}
                  >
                    {selectedMatch.team1.score !== null ? selectedMatch.team1.score : "—"}
                  </span>
                </div>

                {/* Team 2 */}
                <div
                  className={`flex items-center justify-between p-2.5 rounded-lg ${
                    selectedMatch.team2.isWinner ? "bg-amber-500/10 border border-amber-400/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-800 border border-white/15 shrink-0">
                      <img
                        src={selectedMatch.team2.avatar || DEFAULT_TEAM_AVATAR}
                        alt={selectedMatch.team2.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_TEAM_AVATAR;
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedMatch.team2.name}</h4>
                      {selectedMatch.team2.tag && (
                        <span className="text-[10px] font-mono-tech text-neutral-400">
                          [{selectedMatch.team2.tag}]
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`font-mono-tech text-base font-extrabold ${
                      selectedMatch.team2.isWinner ? "text-amber-400" : "text-neutral-300"
                    }`}
                  >
                    {selectedMatch.team2.score !== null ? selectedMatch.team2.score : "—"}
                  </span>
                </div>
              </div>

              {/* Status and format info */}
              <div className="flex items-center justify-between text-xs font-mono-tech text-neutral-400 px-1">
                <span>Формат: {selectedMatch.format}</span>
                <span>
                  Статус:{" "}
                  {selectedMatch.status === "LIVE"
                    ? "В прямом эфире"
                    : selectedMatch.status === "FINISHED"
                    ? "Завершен"
                    : "Ожидается"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="w-full btn-chrome py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

interface PublicMatchCardProps {
  match: BracketMatch;
  onSelect: () => void;
  isGrandFinal?: boolean;
}

const PublicMatchCard: React.FC<PublicMatchCardProps> = ({ match, onSelect, isGrandFinal }) => {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <div
      onClick={() => {
        playTactileClick();
        onSelect();
      }}
      className={`relative rounded-xl border transition-all cursor-pointer group select-none ${
        isGrandFinal
          ? "bg-gradient-to-b from-amber-500/10 via-neutral-900 to-black border-amber-400/40 shadow-xl shadow-amber-500/5 hover:border-amber-400/70"
          : isLive
          ? "bg-neutral-900/90 border-emerald-400/50 shadow-lg shadow-emerald-500/10 hover:border-emerald-400"
          : "bg-neutral-950/80 border-white/10 hover:border-white/30 shadow-md"
      }`}
    >
      {/* Top micro bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02] text-[10px] font-mono-tech text-neutral-400">
        <span className="uppercase font-bold tracking-wider">{match.format}</span>
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </span>
        ) : isFinished ? (
          <span className="text-neutral-400">ФИНАЛ</span>
        ) : (
          <span className="text-neutral-500">СКОРО</span>
        )}
      </div>

      {/* Team 1 */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-white/5 transition-colors ${
          match.team1.isWinner ? "bg-amber-500/10" : ""
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
            className={`text-xs truncate font-medium ${
              match.team1.isWinner ? "text-amber-300 font-bold" : "text-neutral-200"
            }`}
          >
            {match.team1.name}
          </span>
          {match.team1.isWinner && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
        </div>
        <span
          className={`font-mono-tech text-xs font-extrabold px-2 py-0.5 rounded ${
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

      {/* Team 2 */}
      <div
        className={`flex items-center justify-between px-3 py-2 transition-colors ${
          match.team2.isWinner ? "bg-amber-500/10" : ""
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
            className={`text-xs truncate font-medium ${
              match.team2.isWinner ? "text-amber-300 font-bold" : "text-neutral-200"
            }`}
          >
            {match.team2.name}
          </span>
          {match.team2.isWinner && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
        </div>
        <span
          className={`font-mono-tech text-xs font-extrabold px-2 py-0.5 rounded ${
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
