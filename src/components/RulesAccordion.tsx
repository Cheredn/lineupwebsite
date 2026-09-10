import React, { useState } from "react";
import { SITE_CONFIG } from "../config/site";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ChevronDown, ShieldAlert, Check } from "lucide-react";

export const RulesAccordion: React.FC = () => {
  // Default first rule open
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleSection = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="rules" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-neutral-300" />
            <span className="font-mono-tech text-[11px] tracking-wider text-neutral-300 uppercase">
              ОФИЦИАЛЬНЫЙ РЕГЛАМЕНТ
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            ПРАВИЛА <span className="text-chrome">ТУРНИРА</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Все участвующие команды и игроки обязаны строго соблюдать официальный кодекс честной игры и правила турниров LINEUP TOURNAMENTS.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-3">
          {SITE_CONFIG.rules.map((section, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={section.number}
                id={`rules-accordion-${section.number}`}
                className={`rounded-xl overflow-hidden glass-panel border transition-all duration-300 ${
                  isOpen ? "border-white/30 bg-neutral-900/90 shadow-xl shadow-black/80" : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Header button */}
                <button
                  onClick={() => toggleSection(idx)}
                  className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between text-left cursor-pointer group select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono-tech text-xs sm:text-sm font-bold tracking-widest text-neutral-400 group-hover:text-white transition-colors">
                      {section.number}
                    </span>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-neutral-100 transition-colors">
                        {section.title}
                      </h3>
                      {!isOpen && (
                        <p className="text-xs text-neutral-400 hidden sm:block mt-0.5 line-clamp-1">
                          {section.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-all duration-300 ${
                      isOpen ? "rotate-180 bg-white/10 text-white" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Chrome divider when open */}
                {isOpen && (
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}

                {/* Animated content disclosure */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pt-3 pb-6">
                        <p className="text-xs text-neutral-400 mb-4 font-mono-tech">
                          {section.summary}
                        </p>

                        <div className="space-y-3">
                          {section.rules.map((rule, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mt-2" />
                              <span>{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Rule dispute note */}
        <div className="mt-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-neutral-400" />
          <span>Нужно уточнить правила или подать апелляцию? Обратитесь к судейской коллегии в Telegram: <a href="https://t.me/LineUpT" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-bold">@LineUpT</a>.</span>
        </div>
      </div>
    </section>
  );
};
