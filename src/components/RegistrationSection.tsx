import React, { useState } from "react";
import { SITE_CONFIG } from "../config/site";
import { formatGoogleFormEmbedUrl } from "../utils/adminStorage";
import { ExternalLink, ShieldCheck, RefreshCw, Sparkles, HelpCircle } from "lucide-react";

interface RegistrationSectionProps {
  googleFormUrl?: string;
  googleFormEmbedUrl?: string;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  googleFormUrl,
  googleFormEmbedUrl,
}) => {
  const directFormUrl = googleFormUrl || SITE_CONFIG.googleFormUrl;
  const embedFormUrl =
    googleFormEmbedUrl && googleFormEmbedUrl.includes("embedded=true")
      ? googleFormEmbedUrl
      : formatGoogleFormEmbedUrl(directFormUrl);

  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <section id="register" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono-tech text-neutral-300 uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Сезон 2026 // Официальная регистрация</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            РЕГИСТРАЦИЯ <span className="text-chrome">КОМАНДЫ</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Официальная Google-форма регистрации участников турнира LINEUP. Заполните данные капитана и состава команды ниже.
          </p>
        </div>

        {/* Outer Card with Google Form */}
        <div
          id="registration-wrapper"
          className="relative rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-2xl shadow-black/90 p-4 sm:p-6"
        >
          {/* Top Bar with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-wider text-neutral-300">Google Форма регистрации</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRefresh}
                title="Перезагрузить форму"
                className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <a
                href={directFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="open-google-form-external-btn"
                className="btn-chrome px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Открыть в новой вкладке</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Embedded Google Form Frame */}
          <div className="relative w-full bg-neutral-950 rounded-xl overflow-hidden border border-white/10 min-h-[750px] sm:min-h-[850px] md:min-h-[920px]">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-10 pointer-events-none">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                <span className="font-mono-tech text-xs text-neutral-400">Загрузка Google-формы…</span>
              </div>
            )}

            <iframe
              key={`${embedFormUrl}-${iframeKey}`}
              src={embedFormUrl}
              id="lineup-google-form-iframe"
              title="Google-форма регистрации команды LINEUP TOURNAMENTS"
              className="w-full h-[750px] sm:h-[850px] md:h-[920px] border-0 bg-neutral-950"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              allow="storage-access *; clipboard-write; web-share"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
            >
              Загрузка Google-формы…
            </iframe>
          </div>

          {/* Bottom Security Note */}
          <div className="mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
              Все ответы мгновенно передаются в официальную таблицу организаторов LINEUP.
            </span>
            <a
              href={directFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white underline transition-colors"
            >
              Прямая ссылка на форму
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
