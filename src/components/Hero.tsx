import React from "react";
import { SITE_CONFIG, Tournament } from "../config/site";
import { Trophy, Swords, ShieldCheck, ChevronDown, Sparkles } from "lucide-react";

interface HeroProps {
  featuredTournament?: Tournament;
  onJoinClick: () => void;
  onViewBracketClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  featuredTournament,
  onJoinClick,
  onViewBracketClick,
}) => {
  const activeTournament = featuredTournament;
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex flex-col justify-center items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black"
    >
      {/* Subtle Liquid Chrome Ambient Backdrop Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Deep dark radial vignette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] sm:h-[600px] bg-gradient-to-b from-white/[0.04] via-transparent to-transparent rounded-full blur-3xl opacity-70" />
        
        {/* Subtle champagne gold reflection accent (matching the logo's inner gold detail) */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-amber-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

        {/* Polished metal grid lines - ultra subtle */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Top subtle chrome light sweep */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Status Pill */}
        {activeTournament ? (
          <div
            id="hero-status-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950/80 border border-white/15 backdrop-blur-md mb-8 shadow-lg shadow-black/60 hover:border-white/30 transition-all duration-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono-tech text-[11px] tracking-widest text-neutral-300 uppercase">
              СЕЗОН 2026 // {activeTournament.status === "РЕГИСТРАЦИЯ ОТКРЫТА" ? "РЕГИСТРАЦИЯ ОТКРЫТА НА" : activeTournament.status} {activeTournament.title}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono-tech border border-amber-400/20">
              {activeTournament.prizePool}
            </span>
          </div>
        ) : (
          <div
            id="hero-status-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950/80 border border-white/15 backdrop-blur-md mb-8 shadow-lg shadow-black/60 hover:border-white/30 transition-all duration-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-500" />
            </span>
            <span className="font-mono-tech text-[11px] tracking-widest text-neutral-300 uppercase">
              СЕЗОН 2026 // АНОНС СЛЕДУЮЩЕГО ТУРНИРА СКОРО
            </span>
          </div>
        )}

        {/* Official Logo Display Container */}
        <div className="relative mb-6 group select-none">
          {/* Subtle glow layer behind logo */}
          <div className="absolute inset-0 bg-white/[0.03] rounded-full blur-2xl transform scale-90 group-hover:scale-100 transition-transform duration-700" />
          
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center p-2">
            <img
              src={SITE_CONFIG.logo}
              alt="Официальный логотип LINEUP TOURNAMENTS"
              id="hero-official-logo"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_35px_rgba(255,255,255,0.09)] transition-all duration-500 group-hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1
          id="hero-brand-title"
          className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-3"
        >
          <span className="text-chrome">LINEUP</span>{" "}
          <span className="font-light text-neutral-200">TOURNAMENTS</span>
        </h1>

        {/* Subtitle & Slogan */}
        <p
          id="hero-tagline"
          className="text-lg sm:text-xl md:text-2xl text-neutral-400 font-normal tracking-wide max-w-2xl mb-3"
        >
          {SITE_CONFIG.tagline}
        </p>

        <p
          id="hero-slogan"
          className="font-mono-tech text-xs sm:text-sm tracking-[0.35em] text-neutral-300 uppercase mb-10"
        >
          {SITE_CONFIG.slogan}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={onJoinClick}
            id="hero-join-tournament-btn"
            className="w-full sm:w-auto btn-chrome px-8 py-3.5 rounded-xl text-sm font-extrabold tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 cursor-pointer group"
          >
            <Trophy className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-300" />
            <span>УЧАСТВОВАТЬ В ТУРНИРЕ</span>
          </button>

          <button
            onClick={onViewBracketClick}
            id="hero-view-bracket-btn"
            className="w-full sm:w-auto btn-chrome-dark px-8 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Swords className="w-4 h-4 text-neutral-300" />
            <span>СМОТРЕТЬ СЕТКУ</span>
          </button>
        </div>
      </div>

      {/* Down indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-neutral-600 hover:text-neutral-400 transition-colors">
        <a href="#tournaments" aria-label="Перейти к турнирам">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </div>
    </section>
  );
};
