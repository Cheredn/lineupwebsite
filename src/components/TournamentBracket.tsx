import React, { useState, useEffect } from "react";
import { SITE_CONFIG } from "../config/site";
import { Trophy, ExternalLink, AlertCircle } from "lucide-react";

interface TournamentBracketProps {
  bracketUrl?: string;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  bracketUrl = SITE_CONFIG.bracketUrl,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenGoodGame = () => {
    window.open(bracketUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="bracket" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase">
              СЕТКА НА 16 КОМАНД (SINGLE ELIMINATION)
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            ТУРНИРНАЯ <span className="text-chrome">СЕТКА</span>
          </h2>
        </div>

        {/* GoodGame Hosting Notice Banner */}
        <div className="mb-6 p-4 rounded-xl glass-panel border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 text-amber-300">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Турнирная сетка размещена на платформе GoodGame.</h4>
              <p className="text-xs text-neutral-400">
                Официальный посев, вето карт в реальном времени и фиксация результатов матчей синхронизируются через GoodGame Cup Engine.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenGoodGame}
            className="btn-chrome-dark px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>ОТКРЫТЬ НА GOODGAME</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* BRACKET MAIN CONTAINER */}
        <div
          id="bracket-container"
          className="relative rounded-2xl overflow-hidden glass-panel border border-white/15 shadow-2xl shadow-black/80 p-3 sm:p-5"
        >
          <div className="relative w-full rounded-xl overflow-hidden bg-neutral-950 border border-white/10 min-h-[600px] h-[750px] sm:h-[850px]">
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center z-10 p-6 text-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-sm font-display text-white mb-1">Подключение к GoodGame…</p>
                <p className="text-xs text-neutral-400 max-w-sm mb-4">
                  Загрузка турнирной сетки на 16 команд.
                </p>
                <button
                  onClick={handleOpenGoodGame}
                  className="btn-chrome-dark px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  <span>Открыть сетку в новой вкладке</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* GoodGame Embedded Iframe */}
            <iframe
              src={bracketUrl}
              title="GoodGame CS2 Tournament Bracket"
              id="goodgame-bracket-iframe"
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIframeError(true);
                setIsLoading(false);
              }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />

            {/* Fallback Overlay if browser blocks iframe */}
            {iframeError && (
              <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                <h3 className="font-display text-xl font-bold text-white mb-2">ТУРНИРНАЯ СЕТКА</h3>
                <p className="text-sm text-neutral-400 max-w-md mb-6">
                  Турнирная сетка размещена на GoodGame. Защита браузера может ограничивать отображение внутри страницы.
                </p>
                <button
                  onClick={handleOpenGoodGame}
                  className="btn-chrome px-6 py-2.5 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ОТКРЫТЬ НА GOODGAME</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
