import React, { useState, useEffect } from "react";
import { SITE_CONFIG } from "../config/site";
import { Menu, X, Shield, ExternalLink, Trophy, Award, Flame } from "lucide-react";
import { playTactileClick, playTabClick } from "../utils/audio";

interface NavbarProps {
  currentPage: "home" | "leaderboard";
  onNavigate: (page: "home" | "leaderboard") => void;
  onOpenRegister?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenRegister }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId?: string) => {
    playTabClick();
    setMobileMenuOpen(false);
    if (currentPage !== "home") {
      onNavigate("home");
      setTimeout(() => {
        if (sectionId) {
          const target = document.getElementById(sectionId);
          if (target) target.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } else {
      if (sectionId) {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleGoToLeaderboard = () => {
    playTactileClick();
    setMobileMenuOpen(false);
    onNavigate("leaderboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJoinClick = () => {
    playTactileClick();
    setMobileMenuOpen(false);
    if (currentPage !== "home") {
      onNavigate("home");
      setTimeout(() => {
        if (onOpenRegister) {
          onOpenRegister();
        } else {
          const regSection = document.getElementById("register");
          if (regSection) regSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      if (onOpenRegister) {
        onOpenRegister();
      } else {
        const regSection = document.getElementById("register");
        if (regSection) regSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3"
          : "bg-black/40 backdrop-blur-md border-b border-white/5 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Official Brand Logo */}
        <button
          type="button"
          onClick={() => handleNavClick()}
          id="navbar-logo-link"
          className="flex items-center gap-3 group select-none cursor-pointer bg-transparent border-0 text-left p-0"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-black overflow-hidden border border-white/10 group-hover:border-white/30 transition-all duration-300">
            <img
              src={SITE_CONFIG.logo}
              alt="LINEUP TOURNAMENTS Official Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
          </div>

          <div className="flex flex-col">
            <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-white group-hover:text-neutral-200 transition-colors">
              LINEUP
            </span>
            <span className="font-mono-tech text-[10px] tracking-[0.2em] text-neutral-400 group-hover:text-neutral-300">
              TOURNAMENTS
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav id="desktop-nav-links" className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            type="button"
            onClick={() => handleNavClick()}
            className={`px-3.5 py-1.5 text-xs font-semibold tracking-wider rounded-md transition-all duration-200 cursor-pointer ${
              currentPage === "home"
                ? "text-white bg-white/10"
                : "text-neutral-300 hover:text-white hover:bg-white/5"
            }`}
          >
            ГЛАВНАЯ
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("tournaments")}
            className="px-3.5 py-1.5 text-xs font-semibold tracking-wider text-neutral-300 hover:text-white rounded-md hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            ТУРНИРЫ
          </button>

          {/* Leaderboard Page Link (Highlighted with Gold/Amber Award) */}
          <button
            type="button"
            onClick={handleGoToLeaderboard}
            id="nav-link-leaderboard"
            className={`px-3.5 py-1.5 text-xs font-bold tracking-wider rounded-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              currentPage === "leaderboard"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-500/10"
                : "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>РЕЙТИНГ КОМАНД</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono-tech">
              ТОП
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("register")}
            className="px-3.5 py-1.5 text-xs font-semibold tracking-wider text-neutral-300 hover:text-white rounded-md hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            РЕГИСТРАЦИЯ
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("bracket")}
            className="px-3.5 py-1.5 text-xs font-semibold tracking-wider text-neutral-300 hover:text-white rounded-md hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            СЕТКА
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("rules")}
            className="px-3.5 py-1.5 text-xs font-semibold tracking-wider text-neutral-300 hover:text-white rounded-md hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            ПРАВИЛА
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("telegram")}
            className="px-3.5 py-1.5 text-xs font-semibold tracking-wider text-neutral-300 hover:text-white rounded-md hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            TELEGRAM
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={handleJoinClick}
            id="nav-join-tournament-btn"
            className="btn-chrome px-5 py-2 rounded-lg text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>УЧАСТВОВАТЬ</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={handleJoinClick}
            id="nav-mobile-join-btn"
            className="sm:hidden btn-chrome px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <span>УЧАСТИЕ</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle-btn"
            aria-label="Открыть меню"
            className="p-2 rounded-lg bg-neutral-900/80 border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-dropdown"
          className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 mt-2 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick()}
              className={`px-4 py-2.5 text-sm font-medium tracking-wide rounded-lg transition-colors flex items-center justify-between text-left ${
                currentPage === "home" ? "bg-white/10 text-white" : "text-neutral-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>ГЛАВНАЯ</span>
              <span className="text-[10px] text-neutral-600 font-mono-tech">01</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("tournaments")}
              className="px-4 py-2.5 text-sm font-medium tracking-wide text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between text-left"
            >
              <span>ТУРНИРЫ</span>
              <span className="text-[10px] text-neutral-600 font-mono-tech">02</span>
            </button>

            {/* Mobile Leaderboard Link */}
            <button
              type="button"
              onClick={handleGoToLeaderboard}
              className={`px-4 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-colors flex items-center justify-between text-left ${
                currentPage === "leaderboard"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                  : "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>РЕЙТИНГ КОМАНД</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono-tech">
                ТОП
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("register")}
              className="px-4 py-2.5 text-sm font-medium tracking-wide text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between text-left"
            >
              <span>РЕГИСТРАЦИЯ</span>
              <span className="text-[10px] text-neutral-600 font-mono-tech">04</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("bracket")}
              className="px-4 py-2.5 text-sm font-medium tracking-wide text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between text-left"
            >
              <span>ТУРНИРНАЯ СЕТКА</span>
              <span className="text-[10px] text-neutral-600 font-mono-tech">05</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("rules")}
              className="px-4 py-2.5 text-sm font-medium tracking-wide text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between text-left"
            >
              <span>ПРАВИЛА И РЕГЛАМЕНТ</span>
              <span className="text-[10px] text-neutral-600 font-mono-tech">06</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("telegram")}
              className="px-4 py-2.5 text-sm font-medium tracking-wide text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between text-left"
            >
              <span>TELEGRAM КАНАЛ</span>
              <span className="text-[10px] text-neutral-600 font-mono-tech">07</span>
            </button>

            <div className="pt-3 border-t border-white/10 mt-2">
              <button
                onClick={handleJoinClick}
                className="w-full btn-chrome py-3 rounded-lg text-sm tracking-wider uppercase font-bold flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>УЧАСТВОВАТЬ В ТУРНИРЕ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
