import { SITE_CONFIG, Tournament } from "../config/site";
import { RankedTeam, INITIAL_RANKED_TEAMS, DEFAULT_SEASONS } from "../config/ranking";
import { TournamentBracketData, generateDefaultBracket } from "../config/bracket";

export interface SiteSettings {
  telegramUrl: string;
  telegramHandle: string;
  googleFormUrl: string;
  googleFormEmbedUrl: string;
  bracketUrl: string;
}

const STORAGE_KEYS = {
  TOURNAMENTS: "lineup_tournaments_v1",
  BRACKET: "lineup_bracket_v1",
  SETTINGS: "lineup_settings_v1",
  RANKED_TEAMS: "lineup_ranked_teams_v1",
  SEASONS: "lineup_seasons_v1",
  ADMIN_AUTH: "lineup_admin_auth_v1",
  ADMIN_PW: "lineup_admin_password_v1",
  DEVICE_AUTHORIZED: "lineup_device_authorized_v1",
};

export const SECRET_ADMIN_KEY = "lineup2026";
const DEFAULT_PASSWORD = "admin";

// ==========================================
// SERVER API SYNCHRONIZATION
// ==========================================
export interface ServerSiteData {
  tournaments: Tournament[];
  bracket: TournamentBracketData;
  rankedTeams: RankedTeam[];
  seasons: string[];
  settings: SiteSettings;
  lastUpdated: string;
}

export async function fetchServerState(): Promise<ServerSiteData | null> {
  try {
    const res = await fetch("/api/state", {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as ServerSiteData;
  } catch (err) {
    console.warn("Could not fetch server state (offline/development):", err);
    return null;
  }
}

export async function saveServerTournaments(tournaments: Tournament[]): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/tournaments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournaments }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync tournaments with server:", err);
    return false;
  }
}

export async function saveServerBracket(bracket: TournamentBracketData): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/bracket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bracket }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync bracket with server:", err);
    return false;
  }
}

export async function saveServerRankedTeams(rankedTeams: RankedTeam[]): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/ranking", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rankedTeams }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync ranking with server:", err);
    return false;
  }
}

export async function saveServerSeasons(seasons: string[]): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/seasons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seasons }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync seasons with server:", err);
    return false;
  }
}

export async function saveServerSettings(
  settings: SiteSettings,
  newPassword?: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, newPassword }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync settings with server:", err);
    return false;
  }
}

export async function resetServerState(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to reset server state:", err);
    return false;
  }
}

export async function serverAdminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Ошибка авторизации" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Сервер недоступен" };
  }
}

// ==========================================
// LOCAL STORAGE BACKUP / CACHE
// ==========================================
export const getStoredBracket = (): TournamentBracketData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRACKET);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.matches)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load bracket from localStorage", e);
  }
  return generateDefaultBracket("LINEUP CS2 OPEN #1", 8, false);
};

export const saveStoredBracket = (bracket: TournamentBracketData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BRACKET, JSON.stringify(bracket));
  } catch (e) {
    console.error("Failed to save bracket to localStorage", e);
  }
};

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

const DEMO_TOURNAMENT_IDS = new Set([
  "lineup-open-1",
  "lineup-weekly-2",
  "lineup-invitational",
]);

export const getStoredTournaments = (): Tournament[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Automatically purge initial demo tournaments so user starts with a clean slate
        const realTournaments = parsed.filter((t) => !DEMO_TOURNAMENT_IDS.has(t.id));
        if (realTournaments.length !== parsed.length) {
          saveStoredTournaments(realTournaments);
        }
        return realTournaments;
      }
    }
  } catch (e) {
    console.error("Failed to load tournaments from localStorage", e);
  }
  return [];
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

// Demo team IDs that should be cleaned out if present from previous version
const DEMO_TEAM_IDS = new Set([
  "team-1", "team-2", "team-3", "team-4", "team-5",
  "team-6", "team-7", "team-8", "team-9", "team-10",
  "team-11", "team-12", "team-13", "team-14", "team-15"
]);

export const getStoredRankedTeams = (): RankedTeam[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RANKED_TEAMS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy demo mock teams if they were previously saved
        const realTeams = parsed.filter((t) => !DEMO_TEAM_IDS.has(t.id));
        if (realTeams.length !== parsed.length) {
          saveStoredRankedTeams(realTeams);
        }
        return realTeams.sort((a, b) => (b.points || 0) - (a.points || 0));
      }
    }
  } catch (e) {
    console.error("Failed to load ranked teams from localStorage", e);
  }
  return [];
};

export const saveStoredRankedTeams = (teams: RankedTeam[]): void => {
  try {
    // Always sort descending before saving
    const sorted = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
    localStorage.setItem(STORAGE_KEYS.RANKED_TEAMS, JSON.stringify(sorted));
  } catch (e) {
    console.error("Failed to save ranked teams to localStorage", e);
  }
};

export const addStoredRankedTeam = (
  team: Omit<RankedTeam, "id">
): RankedTeam[] => {
  const existing = getStoredRankedTeams();
  const newTeam: RankedTeam = {
    ...team,
    id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  };
  const updated = [newTeam, ...existing].sort((a, b) => (b.points || 0) - (a.points || 0));
  saveStoredRankedTeams(updated);
  return updated;
};

export const updateStoredRankedTeam = (
  id: string,
  updates: Partial<RankedTeam>
): RankedTeam[] => {
  const existing = getStoredRankedTeams();
  const updated = existing
    .map((t) => (t.id === id ? { ...t, ...updates } : t))
    .sort((a, b) => (b.points || 0) - (a.points || 0));
  saveStoredRankedTeams(updated);
  return updated;
};

export const deleteStoredRankedTeam = (id: string): RankedTeam[] => {
  const existing = getStoredRankedTeams();
  const updated = existing.filter((t) => t.id !== id);
  saveStoredRankedTeams(updated);
  return updated;
};

export const getStoredSeasons = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEASONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load seasons from localStorage", e);
  }
  return DEFAULT_SEASONS;
};

export const saveStoredSeasons = (seasons: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(seasons));
  } catch (e) {
    console.error("Failed to save seasons to localStorage", e);
  }
};

export const addStoredSeason = (newSeason: string): string[] => {
  const trimmed = newSeason.trim();
  if (!trimmed) return getStoredSeasons();
  const existing = getStoredSeasons();
  if (!existing.includes(trimmed)) {
    const updated = [...existing, trimmed];
    saveStoredSeasons(updated);
    return updated;
  }
  return existing;
};

export const resetToDefaults = (): {
  tournaments: Tournament[];
  settings: SiteSettings;
  rankedTeams: RankedTeam[];
  seasons: string[];
} => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOURNAMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_PW);
    localStorage.removeItem(STORAGE_KEYS.RANKED_TEAMS);
    localStorage.removeItem(STORAGE_KEYS.SEASONS);
  } catch (e) {
    console.error("Failed to reset storage", e);
  }
  return {
    tournaments: [],
    settings: {
      telegramUrl: SITE_CONFIG.telegramUrl,
      telegramHandle: SITE_CONFIG.telegramHandle,
      googleFormUrl: SITE_CONFIG.googleFormUrl,
      googleFormEmbedUrl: SITE_CONFIG.googleFormEmbedUrl,
      bracketUrl: SITE_CONFIG.bracketUrl,
    },
    rankedTeams: [],
    seasons: DEFAULT_SEASONS,
  };
};
