import React from "react";
import { SITE_CONFIG } from "../config/site";
import { Send, ExternalLink, Bell, Headphones, Swords, MessageCircle } from "lucide-react";

interface TelegramSectionProps {
  telegramUrl?: string;
  telegramHandle?: string;
}

export const TelegramSection: React.FC<TelegramSectionProps> = ({
  telegramUrl = SITE_CONFIG.telegramUrl,
  telegramHandle = SITE_CONFIG.telegramHandle,
}) => {
  const handleJoinTelegram = () => {
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="telegram" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
      {/* Subtle radial ambient reflection */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-80 bg-sky-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="rounded-3xl glass-panel border border-white/20 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl shadow-black/90">
          {/* Top chrome shine line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Telegram Icon Badge */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-900 border border-white/20 flex items-center justify-center text-white mb-6 shadow-xl shadow-black/50 group">
            <Send className="w-8 h-8 text-neutral-200 -rotate-12 translate-x-0.5" />
          </div>

          <span className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase block mb-2">
            ОФИЦИАЛЬНЫЙ ТЕЛЕГРАМ-КАНАЛ
          </span>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            ПРИСОЕДИНЯЙТЕСЬ К <span className="text-chrome">TELEGRAM</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto mb-2 font-normal">
            Будьте в курсе турниров, анонсов, сеток и новостей.
          </p>
          <p className="text-xs font-mono-tech text-sky-400 mb-8 tracking-wider">
            {SITE_CONFIG.telegramHandle}
          </p>

          {/* Value props badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs text-neutral-300 font-medium">Мгновенные анонсы турниров и сетки</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-xs text-neutral-300 font-medium">Прямая связь с судейской коллегией</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 shrink-0">
                <Swords className="w-4 h-4" />
              </div>
              <span className="text-xs text-neutral-300 font-medium">Поиск игроков в состав и пракки</span>
            </div>
          </div>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleJoinTelegram}
              id="join-telegram-cta-btn"
              className="w-full sm:w-auto btn-chrome px-8 py-3.5 rounded-xl text-sm font-extrabold tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 cursor-pointer group"
            >
              <Send className="w-4 h-4 text-black -rotate-12" />
              <span>ПОДПИСАТЬСЯ НА TELEGRAM</span>
              <ExternalLink className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
