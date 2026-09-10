import React from "react";
import { SITE_CONFIG } from "../config/site";
import { ArrowUp } from "lucide-react";

export const Footer: React.FC = () => {
  const navLinks = [
    { label: "ГЛАВНАЯ", href: "#hero" },
    { label: "ТУРНИРЫ", href: "#tournaments" },
    { label: "РЕГИСТРАЦИЯ", href: "#register" },
    { label: "СЕТКА", href: "#bracket" },
    { label: "ПРАВИЛА", href: "#rules" },
    { label: "TELEGRAM", href: "#telegram" },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="bg-black border-t border-white/10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-2 flex flex-col items-start">
            <a
              href="#hero"
              onClick={(e) => handleScrollTo(e, "#hero")}
              className="flex items-center gap-3.5 mb-4 group select-none"
            >
              <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-black overflow-hidden border border-white/15 group-hover:border-white/35 transition-all">
                <img
                  src={SITE_CONFIG.logo}
                  alt="LINEUP TOURNAMENTS Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <span className="font-display font-extrabold text-lg tracking-wider text-white block">
                  LINEUP
                </span>
                <span className="font-mono-tech text-[11px] tracking-[0.2em] text-neutral-400">
                  TOURNAMENTS
                </span>
              </div>
            </a>

            <p className="text-sm text-neutral-400 max-w-sm mb-4 leading-relaxed">
              Профессиональные турниры по CS2 с честным регламентом и гарантированными выплатами.
            </p>

            <span className="font-mono-tech text-xs tracking-widest text-neutral-300 uppercase">
              Играй. Соревнуйся. Побеждай.
            </span>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase mb-4">
              НАВИГАЦИЯ
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleScrollTo(e, link.href)}
                    className="text-xs font-semibold tracking-wider text-neutral-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions & Navigation Column */}
          <div className="flex flex-col justify-between items-start md:items-end">
            <div>
              <h4 className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase mb-4 md:text-right">
                КОНТАКТЫ
              </h4>
              <p className="text-xs text-neutral-400 font-mono-tech mb-2 md:text-right">
                Официальный канал: <a href={SITE_CONFIG.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">@LineUpT</a>
              </p>
              <p className="text-[11px] text-neutral-300 md:text-right">
                Регламент 5х5 • GoodGame Cup Engine
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3">
              <button
                onClick={scrollToTop}
                id="footer-scroll-top-btn"
                className="inline-flex items-center gap-2 text-xs font-mono-tech text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <span>НАВЕРХ</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p className="font-mono-tech">
            © 2026 LINEUP TOURNAMENTS. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
          </p>

          <p className="text-[11px] text-neutral-400 text-center sm:text-right max-w-lg">
            Counter-Strike является зарегистрированным товарным знаком Valve Corporation. LINEUP TOURNAMENTS является независимой киберспортивной платформой.
          </p>
        </div>
      </div>
    </footer>
  );
};
