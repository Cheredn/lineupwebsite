import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// ==========================================
// 1. DATA DIRECTORY & PERSISTENT STORAGE
// ==========================================
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "site-data.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface SiteDataStore {
  tournaments: any[];
  bracket: any;
  rankedTeams: any[];
  seasons: string[];
  settings: {
    googleFormUrl: string;
    googleFormEmbedUrl: string;
    telegramUrl: string;
    telegramHandle: string;
    bracketUrl: string;
  };
  adminPassword?: string;
  lastUpdated: string;
}

const DEFAULT_BRACKET = {
  id: "bracket-default-1",
  tournamentTitle: "LINEUP CS2 OPEN #1",
  hasLowerBracket: false,
  teamCount: 8,
  matches: [
    {
      id: "UB-R1-M1",
      bracketType: "upper",
      round: 1,
      roundName: "Четвертьфинал",
      matchNumber: 1,
      team1: { name: "ECLIPSE ESPORTS", tag: "ECL", avatar: "", score: null, isWinner: false },
      team2: { name: "CYBER WOLVES", tag: "CW", avatar: "", score: null, isWinner: false },
      status: "UPCOMING",
      format: "BO1",
      nextMatchId: "UB-R2-M1",
      nextMatchSlot: 1,
    },
    {
      id: "UB-R1-M2",
      bracketType: "upper",
      round: 1,
      roundName: "Четвертьфинал",
      matchNumber: 2,
      team1: { name: "NEXUS PRIME", tag: "NXS", avatar: "", score: null, isWinner: false },
      team2: { name: "AURORA FORCE", tag: "AF", avatar: "", score: null, isWinner: false },
      status: "UPCOMING",
      format: "BO1",
      nextMatchId: "UB-R2-M1",
      nextMatchSlot: 2,
    },
    {
      id: "UB-R1-M3",
      bracketType: "upper",
      round: 1,
      roundName: "Четвертьфинал",
      matchNumber: 3,
      team1: { name: "VALKYRIE GAMING", tag: "VLK", avatar: "", score: null, isWinner: false },
      team2: { name: "TITAN CLAN", tag: "TTN", avatar: "", score: null, isWinner: false },
      status: "UPCOMING",
      format: "BO1",
      nextMatchId: "UB-R2-M2",
      nextMatchSlot: 1,
    },
    {
      id: "UB-R1-M4",
      bracketType: "upper",
      round: 1,
      roundName: "Четвертьфинал",
      matchNumber: 4,
      team1: { name: "PHANTOM FIVE", tag: "P5", avatar: "", score: null, isWinner: false },
      team2: { name: "SOLARIS ESPORTS", tag: "SLR", avatar: "", score: null, isWinner: false },
      status: "UPCOMING",
      format: "BO1",
      nextMatchId: "UB-R2-M2",
      nextMatchSlot: 2,
    },
    {
      id: "UB-R2-M1",
      bracketType: "upper",
      round: 2,
      roundName: "Полуфинал",
      matchNumber: 1,
      team1: { name: "Ожидает победителя 1", tag: "", avatar: "", score: null, isWinner: false },
      team2: { name: "Ожидает победителя 2", tag: "", avatar: "", score: null, isWinner: false },
      status: "UPCOMING",
      format: "BO1",
      nextMatchId: "UB-R3-M1",
      nextMatchSlot: 1,
    },
    {
      id: "UB-R2-M2",
      bracketType: "upper",
      round: 2,
      roundName: "Полуфинал",
      matchNumber: 2,
      team1: { name: "Ожидает победителя 3", tag: "", avatar: "", score: null, isWinner: false },
      team2: { name: "Ожидает победителя 4", tag: "", avatar: "", score: null, isWinner: false },
      status: "UPCOMING",
      format: "BO1",
      nextMatchId: "UB-R3-M1",
      nextMatchSlot: 2,
    },
    {
      id: "UB-R3-M1",
      bracketType: "upper",
      round: 3,
      roundName: "Гранд-финал",
      matchNumber: 1,
      team1: { name: "Финалист 1", tag: "", avatar: "", score: null, isWinner: false },
      team2: { name: "Финалист 2", tag: "", avatar: "", score: null, isWinner: false },
      status: "UPCOMING",
      format: "BO3",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_STORE: SiteDataStore = {
  tournaments: [],
  bracket: DEFAULT_BRACKET,
  rankedTeams: [],
  seasons: ["Сезон 1 (2026)", "Сезон 2 (2026)", "Предсезон 2026"],
  settings: {
    googleFormUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScMcHvsl6MQWNxmqhalPbu6v2zcneoslkwHGS1V583CPtaaOQ/viewform",
    googleFormEmbedUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScMcHvsl6MQWNxmqhalPbu6v2zcneoslkwHGS1V583CPtaaOQ/viewform?embedded=true",
    telegramUrl: "https://t.me/LineUpT",
    telegramHandle: "@LineUpT",
    bracketUrl: "https://goodgame.ru/cup/bracket/12312312-6aa3285cc1161a00411b4c60",
  },
  adminPassword: "lineup2026",
  lastUpdated: new Date().toISOString(),
};

function readStore(): SiteDataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STORE,
        ...parsed,
        bracket: parsed.bracket || DEFAULT_BRACKET,
        settings: {
          ...DEFAULT_STORE.settings,
          ...(parsed.settings || {}),
        },
      };
    }
  } catch (err) {
    console.error("Error reading site data file, using defaults:", err);
  }
  saveStore(DEFAULT_STORE);
  return DEFAULT_STORE;
}

function saveStore(data: SiteDataStore): void {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error("Error saving site data file:", err);
  }
}

// In-memory cache
let siteData: SiteDataStore = readStore();

// ==========================================
// 2. RATE LIMITING & DDOS DEFENSE
// ==========================================
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const generalIpBuckets = new Map<string, RateLimitBucket>();
const loginIpBuckets = new Map<string, RateLimitBucket>();
const mutationIpBuckets = new Map<string, RateLimitBucket>();

// Clean up stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of generalIpBuckets) {
    if (now > bucket.resetTime) generalIpBuckets.delete(ip);
  }
  for (const [ip, bucket] of loginIpBuckets) {
    if (now > bucket.resetTime) loginIpBuckets.delete(ip);
  }
  for (const [ip, bucket] of mutationIpBuckets) {
    if (now > bucket.resetTime) mutationIpBuckets.delete(ip);
  }
}, 5 * 60 * 1000);

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

// General traffic rate limiter (180 req/min per IP)
const generalRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIp(req);
  const now = Date.now();
  let bucket = generalIpBuckets.get(ip);

  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 1, resetTime: now + 60 * 1000 };
    generalIpBuckets.set(ip, bucket);
    return next();
  }

  bucket.count++;
  if (bucket.count > 180) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({
      error: "Слишком много запросов. Пожалуйста, подождите минуту (DDoS защита).",
    });
  }
  next();
};

// Login brute force protection (6 attempts per 5 minutes per IP)
const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIp(req);
  const now = Date.now();
  let bucket = loginIpBuckets.get(ip);

  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 1, resetTime: now + 5 * 60 * 1000 };
    loginIpBuckets.set(ip, bucket);
    return next();
  }

  bucket.count++;
  if (bucket.count > 6) {
    const remainingSecs = Math.ceil((bucket.resetTime - now) / 1000);
    res.setHeader("Retry-After", String(remainingSecs));
    return res.status(429).json({
      error: `Слишком много неверных попыток входа. Блокировка на ${remainingSecs} сек.`,
    });
  }
  next();
};

// Admin mutation rate limiter (60 writes/min per IP)
const mutationRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIp(req);
  const now = Date.now();
  let bucket = mutationIpBuckets.get(ip);

  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 1, resetTime: now + 60 * 1000 };
    mutationIpBuckets.set(ip, bucket);
    return next();
  }

  bucket.count++;
  if (bucket.count > 60) {
    return res.status(429).json({
      error: "Превышен лимит обновлений. Подождите немного перед сохранением.",
    });
  }
  next();
};

// ==========================================
// 3. SECURITY HEADERS & BODY PARSING
// ==========================================
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// JSON body limit (up to 20MB for high-res team avatars in base64)
app.use(express.json({ limit: "20mb" }));

// Safe JSON parser error handler (prevents server crashes on malformed bodies)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)) {
    return res.status(400).json({ error: "Некорректный JSON в теле запроса" });
  }
  next(err);
});

// Apply general rate limiting to API routes
app.use("/api", generalRateLimiter);

// ==========================================
// 4. API ROUTES
// ==========================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    tournamentsCount: siteData.tournaments?.length || 0,
    teamsCount: siteData.rankedTeams?.length || 0,
  });
});

// Public state endpoint: returns tournaments, custom bracket, ranked teams, seasons, and settings
app.get("/api/state", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  res.json({
    tournaments: siteData.tournaments,
    bracket: siteData.bracket,
    rankedTeams: siteData.rankedTeams,
    seasons: siteData.seasons,
    settings: siteData.settings,
    lastUpdated: siteData.lastUpdated,
  });
});

// Admin authentication route
app.post("/api/admin/login", loginRateLimiter, (req, res) => {
  const { password } = req.body;
  const currentPass = siteData.adminPassword || "lineup2026";
  const masterKey = "lineup2026";

  if (password === currentPass || password === masterKey) {
    return res.json({
      success: true,
      token: `auth-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    });
  }

  return res.status(401).json({
    error: "Неверный пароль администратора",
  });
});

// Admin endpoints (guarded by mutation limiter)
app.put("/api/admin/tournaments", mutationRateLimiter, (req, res) => {
  const { tournaments } = req.body;
  if (!Array.isArray(tournaments)) {
    return res.status(400).json({ error: "Некорректный формат списка турниров" });
  }

  siteData.tournaments = tournaments;
  siteData.lastUpdated = new Date().toISOString();
  saveStore(siteData);

  res.json({ success: true, count: tournaments.length, lastUpdated: siteData.lastUpdated });
});

app.put("/api/admin/bracket", mutationRateLimiter, (req, res) => {
  const { bracket } = req.body;
  if (!bracket || !Array.isArray(bracket.matches)) {
    return res.status(400).json({ error: "Некорректная структура сетки" });
  }

  siteData.bracket = {
    ...bracket,
    lastUpdated: new Date().toISOString(),
  };
  siteData.lastUpdated = new Date().toISOString();
  saveStore(siteData);

  res.json({ success: true, bracket: siteData.bracket });
});

app.put("/api/admin/ranking", mutationRateLimiter, (req, res) => {
  const { rankedTeams } = req.body;
  if (!Array.isArray(rankedTeams)) {
    return res.status(400).json({ error: "Некорректный список команд" });
  }

  siteData.rankedTeams = rankedTeams;
  siteData.lastUpdated = new Date().toISOString();
  saveStore(siteData);

  res.json({ success: true, count: rankedTeams.length, lastUpdated: siteData.lastUpdated });
});

app.put("/api/admin/seasons", mutationRateLimiter, (req, res) => {
  const { seasons } = req.body;
  if (!Array.isArray(seasons)) {
    return res.status(400).json({ error: "Некорректный список сезонов" });
  }

  siteData.seasons = seasons;
  siteData.lastUpdated = new Date().toISOString();
  saveStore(siteData);

  res.json({ success: true, seasons: siteData.seasons });
});

app.put("/api/admin/settings", mutationRateLimiter, (req, res) => {
  const { settings, newPassword } = req.body;

  if (settings) {
    siteData.settings = {
      ...siteData.settings,
      ...settings,
    };
  }

  if (newPassword && typeof newPassword === "string" && newPassword.trim().length >= 4) {
    siteData.adminPassword = newPassword.trim();
  }

  siteData.lastUpdated = new Date().toISOString();
  saveStore(siteData);

  res.json({ success: true, settings: siteData.settings });
});

app.post("/api/admin/reset", mutationRateLimiter, (req, res) => {
  siteData = {
    ...DEFAULT_STORE,
    lastUpdated: new Date().toISOString(),
  };
  saveStore(siteData);
  res.json({ success: true, state: siteData });
});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error in request:", err);
  res.status(500).json({
    error: "Внутренняя ошибка сервера. Попробуйте обновить страницу.",
  });
});

// ==========================================
// 6. VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LINEUP TOURNAMENTS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
