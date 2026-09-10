import React from "react";
import { SITE_CONFIG } from "../config/site";
import { ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

interface RegistrationSectionProps {
  googleFormUrl?: string;
  googleFormEmbedUrl?: string;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  googleFormUrl = SITE_CONFIG.googleFormUrl,
  googleFormEmbedUrl = SITE_CONFIG.googleFormEmbedUrl,
}) => {
  const directFormUrl = googleFormUrl;
  const embedFormUrl = googleFormEmbedUrl;

  return (
    <section id="register" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            РЕГИСТРАЦИЯ <span className="text-chrome">КОМАНДЫ</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 font-medium max-w-xl mx-auto mb-2">
            Готовы к битве?
          </p>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Зарегистрируйте свой состав на следующий турнир LINEUP TOURNAMENTS.
          </p>
        </div>

        {/* Requirements Checklist Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 rounded-xl glass-panel border-white/10">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">5 активных игроков</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">Привязанный SteamID64</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">Telegram капитана</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">Без банов VAC</span>
          </div>
        </div>

        {/* Beautiful Dark Outer Container with Chrome Border & Subtle Shadow */}
        <div
          id="google-form-wrapper"
          className="relative rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-2xl shadow-black/90 p-4 sm:p-6"
        >
          {/* Top Bar for Form Container */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono-tech text-xs tracking-wider text-neutral-300 uppercase">
                ОФИЦИАЛЬНАЯ GOOGLE-ФОРМА РЕГИСТРАЦИИ
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={directFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="open-google-form-external-btn"
                className="btn-chrome px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Открыть форму в новой вкладке</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* THE REAL GOOGLE FORM IFRAME */}
          <div className="w-full bg-neutral-950 rounded-xl overflow-hidden border border-white/10 min-h-[650px] sm:min-h-[750px] md:min-h-[820px] relative">
            <iframe
              src={embedFormUrl}
              id="lineup-google-form-iframe"
              title="Google-форма регистрации команды LINEUP TOURNAMENTS"
              className="w-full h-[650px] sm:h-[750px] md:h-[820px] border-0 bg-neutral-950"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              loading="lazy"
            >
              Загрузка Google-формы…
            </iframe>
          </div>

          {/* Bottom Security Assurance */}
          <div className="mt-4 pt-3 flex items-center justify-center sm:justify-start text-[11px] text-neutral-400 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
              Прямая отправка формы через Google Forms с SSL-шифрованием. Данные моментально поступают организаторам турнира.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
