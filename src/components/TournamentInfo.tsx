import React from "react";
import { SITE_CONFIG } from "../config/site";
import { Gamepad2, Users, Trophy, Globe2, ShieldCheck, Ticket, Server, MapPin } from "lucide-react";

export const TournamentInfo: React.FC = () => {
  const getIcon = (label: string) => {
    switch (label) {
      case "ИГРА":
        return <Gamepad2 className="w-5 h-5 text-neutral-300" />;
      case "ФОРМАТ":
        return <Users className="w-5 h-5 text-neutral-300" />;
      case "КОМАНДЫ":
        return <Users className="w-5 h-5 text-neutral-300" />;
      case "РЕГИОН":
        return <Globe2 className="w-5 h-5 text-neutral-300" />;
      case "ВЗНОС":
        return <Ticket className="w-5 h-5 text-neutral-300" />;
      case "ПРИЗОВОЙ ФОНД":
        return <Trophy className="w-5 h-5 text-amber-300" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-neutral-300" />;
    }
  };

  return (
    <section id="info" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
              <span className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase">
                ФОРМАТ И РЕГЛАМЕНТ
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              ИНФОРМАЦИЯ О <span className="text-chrome">ТУРНИРАХ</span>
            </h2>
          </div>
          <p className="mt-3 md:mt-0 text-sm text-neutral-400 max-w-md">
            Создано для бескомпромиссной честной игры. Строгий регламент составов, нулевая терпимость к читерству и выделенные серверы с минимальным пингом.
          </p>
        </div>

        {/* 6 Key Parameter Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {SITE_CONFIG.infoCards.map((card, idx) => {
            const isPrize = card.label === "ПРИЗОВОЙ ФОНД";

            return (
              <div
                key={card.label}
                id={`info-card-${idx}`}
                className={`group rounded-2xl glass-panel-interactive p-6 flex flex-col justify-between relative overflow-hidden border ${
                  isPrize ? "border-amber-400/25 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950" : "border-white/10"
                }`}
              >
                {/* Top Subtle Metallic Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/40 transition-colors" />

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900/90 border border-white/15 flex items-center justify-center group-hover:border-white/30 transition-colors shadow-inner">
                    {getIcon(card.label)}
                  </div>

                  <span
                    className={`font-mono-tech text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border ${
                      isPrize
                        ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                        : "bg-white/5 text-neutral-300 border-white/10"
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div>
                  <span className="block font-mono-tech text-xs tracking-wider text-neutral-400 uppercase mb-1">
                    {card.label}
                  </span>
                  <div
                    className={`font-display text-xl sm:text-2xl font-bold tracking-tight mb-1 ${
                      isPrize ? "text-amber-300" : "text-white"
                    }`}
                  >
                    {card.value}
                  </div>
                  <p className="text-xs text-neutral-400">{card.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Technical Spec Banner */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Server className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
            <div>
              <span className="block font-display text-sm font-bold text-white mb-0.5">
                ВЫДЕЛЕННЫЕ СЕРВЕРЫ (128-TICK ЭКВИВАЛЕНТ)
              </span>
              <p className="text-xs text-neutral-400">
                Серверы с минимальным джиттером в ведущих европейских дата-центрах (Франкфурт и Стокгольм).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
            <div>
              <span className="block font-display text-sm font-bold text-white mb-0.5">
                МНОГОУРОВНЕВЫЙ АНТИЧИТ
              </span>
              <p className="text-xs text-neutral-400">
                Мониторинг VACnet, клиентский аудит целостности и автоматическое сохранение демок каждого матча.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
            <div>
              <span className="block font-display text-sm font-bold text-white mb-0.5">
                ОФИЦИАЛЬНЫЙ МАППУЛ ACTIVE DUTY
              </span>
              <p className="text-xs text-neutral-400">
                Mirage, Inferno, Nuke, Anubis, Ancient, Dust II и Train с соревновательным протоколом вето.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
