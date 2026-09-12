import { SITE_CONFIG, Tournament } from "../config/site";

export interface SiteSettings {
  telegramUrl: string;
  telegramHandle: string;
  googleFormUrl: string;
  googleFormEmbedUrl: string;
  bracketUrl: string;
}

const STORAGE_KEYS = {
  TOURNAMENTS: "lineup_tournaments_v1",
  SETTINGS: "lineup_settings_v1",
  REGISTRATIONS: "lineup_registrations_v1",
  ADMIN_AUTH: "lineup_admin_auth_v1",
  ADMIN_PW: "lineup_admin_password_v1",
  DEVICE_AUTHORIZED: "lineup_device_authorized_v1",
};

export const SECRET_ADMIN_KEY = "lineup2026";
const DEFAULT_PASSWORD = "admin";

export const isDeviceAuthorized = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.DEVICE_AUTHORIZED) === "true";
  } catch (e) {
    return false;
  }
};

export const authorizeCurrentDevice = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICE_AUTHORIZED, "true");
  } catch (e) {
    console.error("Failed to authorize device", e);
  }
};

export const deauthorizeCurrentDevice = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DEVICE_AUTHORIZED);
  } catch (e) {
    console.error("Failed to deauthorize device", e);
  }
};

export const getSecretAdminUrl = (): string => {
  if (typeof window === "undefined") return `?admin=${SECRET_ADMIN_KEY}`;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?admin=${SECRET_ADMIN_KEY}`;
};

export const formatGoogleFormEmbedUrl = (url: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.includes("embedded=true")) return trimmed;
  if (trimmed.includes("?")) return `${trimmed}&embedded=true`;
  return `${trimmed}?embedded=true`;
};

export const getStoredTournaments = (): Tournament[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load tournaments from localStorage", e);
  }
  return SITE_CONFIG.tournaments;
};

export const saveStoredTournaments = (tournaments: Tournament[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  } catch (e) {
    console.error("Failed to save tournaments to localStorage", e);
  }
};

export const getStoredSettings = (): SiteSettings => {
  const defaults: SiteSettings = {
    telegramUrl: SITE_CONFIG.telegramUrl,
    telegramHandle: SITE_CONFIG.telegramHandle,
    googleFormUrl: SITE_CONFIG.googleFormUrl,
    googleFormEmbedUrl: SITE_CONFIG.googleFormEmbedUrl,
    bracketUrl: SITE_CONFIG.bracketUrl,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migration: If the user previously saved the old demo form, automatically migrate to the new one
      if (
        !parsed.googleFormUrl ||
        parsed.googleFormUrl.includes("1FAIpQLSeRDk7oKXxGXIGe2FpjeAXNpjdpIZr-xjv3KuTsky6wk3_CLA")
      ) {
        parsed.googleFormUrl = SITE_CONFIG.googleFormUrl;
        parsed.googleFormEmbedUrl = SITE_CONFIG.googleFormEmbedUrl;
      } else if (!parsed.googleFormEmbedUrl || !parsed.googleFormEmbedUrl.includes("embedded=true")) {
        parsed.googleFormEmbedUrl = formatGoogleFormEmbedUrl(parsed.googleFormUrl);
      }
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load settings from localStorage", e);
  }
  return defaults;
};

export const saveStoredSettings = (settings: SiteSettings): void => {
  try {
    const sanitized: SiteSettings = {
      ...settings,
      googleFormEmbedUrl: formatGoogleFormEmbedUrl(settings.googleFormUrl),
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(sanitized));
  } catch (e) {
    console.error("Failed to save settings to localStorage", e);
  }
};

export const getAdminPassword = (): string => {
  try {
    const pw = localStorage.getItem(STORAGE_KEYS.ADMIN_PW);
    if (pw) return pw;
  } catch (e) {
    console.error("Failed to get admin password", e);
  }
  return DEFAULT_PASSWORD;
};

export const setAdminPassword = (newPw: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PW, newPw);
  } catch (e) {
    console.error("Failed to set admin password", e);
  }
};

export interface RegistrationSubmission {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  teamName: string;
  captainNick: string;
  captainContact: string;
  player1: string;
  player2: string;
  player3: string;
  player4: string;
  player5: string;
  substitute?: string;
  steamProfile?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export const getStoredRegistrations = (): RegistrationSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to read registrations from localStorage", e);
  }
  return [];
};

export const saveStoredRegistrations = (list: RegistrationSubmission[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save registrations to localStorage", e);
  }
};

export const addStoredRegistration = (
  data: Omit<RegistrationSubmission, "id" | "submittedAt" | "status">
): RegistrationSubmission => {
  const newSubmission: RegistrationSubmission = {
    ...data,
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    status: "pending",
    submittedAt: new Date().toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const existing = getStoredRegistrations();
  const updated = [newSubmission, ...existing];
  saveStoredRegistrations(updated);
  return newSubmission;
};

export const deleteStoredRegistration = (id: string): RegistrationSubmission[] => {
  const existing = getStoredRegistrations();
  const updated = existing.filter((item) => item.id !== id);
  saveStoredRegistrations(updated);
  return updated;
};

export const updateStoredRegistrationStatus = (
  id: string,
  status: "pending" | "approved" | "rejected"
): RegistrationSubmission[] => {
  const existing = getStoredRegistrations();
  const updated = existing.map((item) => (item.id === id ? { ...item, status } : item));
  saveStoredRegistrations(updated);
  return updated;
};

export const resetToDefaults = (): { tournaments: Tournament[]; settings: SiteSettings } => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOURNAMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_PW);
  } catch (e) {
    console.error("Failed to reset storage", e);
  }
  return {
    tournaments: SITE_CONFIG.tournaments,
    settings: {
      telegramUrl: SITE_CONFIG.telegramUrl,
      telegramHandle: SITE_CONFIG.telegramHandle,
      googleFormUrl: SITE_CONFIG.googleFormUrl,
      googleFormEmbedUrl: SITE_CONFIG.googleFormEmbedUrl,
      bracketUrl: SITE_CONFIG.bracketUrl,
    },
  };
};
