import React from "react";
import { SITE_CONFIG, Tournament } from "../config/site";
import { Trophy, Calendar, Users, Shield, ArrowUpRight, Flame, Sparkles } from "lucide-react";

interface UpcomingTournamentsProps {
  tournaments?: Tournament[];
  onSelectTournament: (tournament: Tournament) => void;
  onRegisterClick: (tournament: Tournament) => void;
}

export const UpcomingTournaments: React.FC<UpcomingTournamentsProps> = ({
  tournaments,
  onSelectTournament,
  onRegisterClick,
}) => {
  const displayTournaments = tournaments || SITE_CONFIG.tournaments;
  return (
    <section id="tournaments" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      {/* Background divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase">
                РАСПИСАНИЕ СЕЗОНА
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              БЛИЖАЙШИЕ <span className="text-chrome">ТУРНИРЫ</span>
            </h2>
          </div>
          <p className="mt-3 md:mt-0 text-sm text-neutral-400 max-w-md">
            Турниры на выделенных серверах, с надежным античитом и быстрой выплатой призовых.
          </p>
        </div>

        {/* Tournament Cards Grid */}
        {displayTournaments.length === 0 ? (
          <div className="py-16 text-center rounded-2xl glass-panel border border-white/10 p-8">
            <Trophy className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-white mb-2">
              Анонсы новых турниров формируются
            </h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Следите за обновлениями в нашем Telegram-канале @LineUpT.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTournaments.map((t, idx) => {
              const isFeatured = idx === 0;

            return (
              <div
                key={t.id}
                id={`tournament-card-${t.id}`}
                className={`group relative rounded-2xl overflow-hidden glass-panel-interactive flex flex-col justify-between p-6 sm:p-7 ${
                  isFeatured
                    ? "border-white/25 shadow-2xl shadow-black/80 ring-1 ring-white/10"
                    : "border-white/10"
                }`}
              >
                {/* Subtle metallic shine sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Badge & Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="font-mono-tech text-[10px] tracking-wider text-neutral-300 uppercase px-2.5 py-1 rounded bg-white/5 border border-white/10">
                      {t.game.toUpperCase()} • {t.format.split(" ")[0]}
                    </span>

                    <span
                      className={`font-mono-tech text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        t.status === "РЕГИСТРАЦИЯ ОТКРЫТА"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                      }`}
                    >
                      {t.status === "РЕГИСТРАЦИЯ ОТКРЫТА" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {t.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight group-hover:text-neutral-100 transition-colors mb-1">
                    {t.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-6">{t.subtitle}</p>

                  {/* Key Stats Pill Row */}
                  <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/5 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center border border-white/5 text-neutral-300">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 uppercase">
                          СЕТКА
                        </span>
                        <span className="text-xs font-bold text-neutral-200">
                          {t.teamCount} КОМАНД
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center border border-white/5 text-neutral-300">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono-tech text-neutral-400 uppercase">
                          ДАТА
                        </span>
                        <span className="text-xs font-bold text-neutral-200">
                          {t.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prize Pool Display */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900/90 to-black border border-white/10 mb-6 flex items-center justify-between">
                    <div>
                      <span className="block font-mono-tech text-[10px] tracking-wider text-amber-400/80 uppercase">
                        ПРИЗОВОЙ ФОНД
                      </span>
                      <span className="font-display text-2xl font-extrabold text-amber-300">
                        {t.prizePool}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-neutral-400 font-mono-tech">
                        1 МЕСТО: {t.firstPlacePrize}
                      </span>
                      <span className="block text-[10px] text-neutral-400 font-mono-tech">
                        2 МЕСТО: {t.secondPlacePrize}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => onSelectTournament(t)}
                    id={`view-tournament-btn-${t.id}`}
                    className="btn-chrome-dark py-2.5 px-3 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>ПОДРОБНЕЕ</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRegisterClick(t)}
                    id={`register-tournament-btn-${t.id}`}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
                      t.status === "РЕГИСТРАЦИЯ ОТКРЫТА"
                        ? "btn-chrome shadow-md shadow-white/5"
                        : "bg-neutral-800/80 text-neutral-500 cursor-not-allowed border border-neutral-700"
                    }`}
                    disabled={t.status !== "РЕГИСТРАЦИЯ ОТКРЫТА"}
                  >
                    <span>{t.status === "РЕГИСТРАЦИЯ ОТКРЫТА" ? "РЕГИСТРАЦИЯ" : "СКОРО"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};
