import React from "react";
import { Tournament } from "../config/site";
import { X, Trophy, Calendar, Users, Shield, MapPin, Clock, Server, CheckCircle2 } from "lucide-react";

interface TournamentModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onRegister: (tournament: Tournament) => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  tournament,
  onClose,
  onRegister,
}) => {
  if (!tournament) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-neutral-900/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-tech text-[10px] tracking-wider text-neutral-400 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {tournament.game}
              </span>
              <span className="font-mono-tech text-[10px] text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {tournament.status}
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">
              {tournament.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Закрыть окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Prize Pool Highlight */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-neutral-900 via-black to-neutral-900 border border-amber-400/30 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-mono-tech text-xs text-amber-400/80 uppercase">
                  ОБЩИЙ ПРИЗОВОЙ ФОНД
                </span>
                <span className="font-display text-2xl font-extrabold text-amber-300">
                  {tournament.prizePool}
                </span>
              </div>
            </div>

            <div className="text-right text-xs font-mono-tech space-y-1">
              <div className="text-neutral-300">1 МЕСТО: <span className="text-white font-bold">{tournament.firstPlacePrize}</span></div>
              <div className="text-neutral-400">2 МЕСТО: <span className="text-neutral-300">{tournament.secondPlacePrize}</span></div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5">
              <span className="block font-mono-tech text-[10px] text-neutral-400 uppercase">ДАТА И ВРЕМЯ</span>
              <span className="font-semibold text-white mt-0.5 block">{tournament.date} • {tournament.time}</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5">
              <span className="block font-mono-tech text-[10px] text-neutral-400 uppercase">ФОРМАТ</span>
              <span className="font-semibold text-white mt-0.5 block">{tournament.format}</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5">
              <span className="block font-mono-tech text-[10px] text-neutral-400 uppercase">РЕГИОН / СЕРВЕРЫ</span>
              <span className="font-semibold text-white mt-0.5 block">{tournament.region}</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5">
              <span className="block font-mono-tech text-[10px] text-neutral-400 uppercase">РАЗМЕР СЕТКИ</span>
              <span className="font-semibold text-white mt-0.5 block">{tournament.teamCount} Команд</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5">
              <span className="block font-mono-tech text-[10px] text-neutral-400 uppercase">ВЗНОС</span>
              <span className="font-semibold text-emerald-400 mt-0.5 block">{tournament.entryFee}</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5">
              <span className="block font-mono-tech text-[10px] text-neutral-400 uppercase">ДЕДЛАЙН</span>
              <span className="font-semibold text-neutral-300 mt-0.5 block">{tournament.registrationDeadline}</span>
            </div>
          </div>

          {/* Active Duty Maps */}
          <div>
            <h4 className="font-mono-tech text-xs tracking-wider text-neutral-400 uppercase mb-2.5">
              ТУРНИРНЫЙ МАППУЛ (ACTIVE DUTY)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tournament.maps.map((map) => (
                <div
                  key={map}
                  className="p-2.5 rounded-lg bg-black border border-white/10 text-center font-display text-xs font-semibold text-neutral-200"
                >
                  {map}
                </div>
              ))}
            </div>
          </div>

          {/* Server & Anti-cheat details */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <Server className="w-4 h-4 text-neutral-400 shrink-0" />
              <span><strong>Серверы:</strong> {tournament.serverLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <Shield className="w-4 h-4 text-neutral-400 shrink-0" />
              <span><strong>Античит:</strong> {tournament.antiCheat}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-neutral-900/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-chrome-dark px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase cursor-pointer"
          >
            Закрыть
          </button>
          <button
            onClick={() => {
              onClose();
              onRegister(tournament);
            }}
            className="btn-chrome px-6 py-2.5 rounded-lg text-xs font-extrabold tracking-wider uppercase cursor-pointer flex items-center gap-2"
          >
            <span>Зарегистрировать команду</span>
          </button>
        </div>
      </div>
    </div>
  );
};
