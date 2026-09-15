// Web Audio API tactile sound generator for esports UI
// Lightweight, zero-latency, zero-dependency, works cross-browser & mobile

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Sound enabled preference in localStorage
const SOUND_STORAGE_KEY = "lineup_sound_enabled";

export const isSoundEnabled = (): boolean => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored === null ? true : stored === "true";
};

export const setSoundEnabled = (enabled: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent("lineup-sound-toggle", { detail: enabled }));
};

/**
 * Приятный четкий киберспортивный щелчок (Tactile mechanical switch click)
 * Идеально подходит для основных кнопок, модалок и переключателей
 */
export const playTactileClick = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. High crisp pop (click transient)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(2100, now);
    osc1.frequency.exponentialRampToValueAtTime(450, now + 0.035);

    gain1.gain.setValueAtTime(0.09, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    // 2. Subtle low tactile body (warm punch)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(190, now);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.025);

    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    // Filter to keep it clean and subtle
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(1.2, now);

    osc1.connect(gain1);
    gain1.connect(filter);
    filter.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.04);
    osc2.start(now);
    osc2.stop(now + 0.03);
  } catch {
    // Graceful fallback if audio is blocked by browser policy
  }
};

/**
 * Мягкий щелчок для табов, карточек и чекбоксов карт (Muted tab click)
 */
export const playTabClick = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.025);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch {}
};

/**
 * Звук успешного действия (сохранение турнира, победа в матче, публикация)
 */
export const playSuccessChime = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Note 1: E6 (1318 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.07, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    // Note 2: B6 (1975 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1975.5, now + 0.05);
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.09, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.25);
  } catch {}
};
