import React, { useState, useEffect, useCallback } from "react";
import { Tournament, SITE_CONFIG } from "./config/site";
import { RankedTeam } from "./config/ranking";
import { TournamentBracketData } from "./config/bracket";
import {
  getStoredTournaments,
  saveStoredTournaments,
  getStoredSettings,
  saveStoredSettings,
  getStoredRankedTeams,
  saveStoredRankedTeams,
  getStoredSeasons,
  saveStoredSeasons,
  getStoredBracket,
  saveStoredBracket,
  resetToDefaults,
  SiteSettings,
  authorizeCurrentDevice,
  SECRET_ADMIN_KEY,
  fetchServerState,
  saveServerTournaments,
  saveServerBracket,
  saveServerRankedTeams,
  saveServerSeasons,
  saveServerSettings,
  resetServerState,
} from "./utils/adminStorage";
import {
  testFirebaseConnection,
  subscribeCloudTournaments,
  saveCloudTournaments,
  subscribeCloudBracket,
  saveCloudBracket,
  fetchCloudBracket,
  subscribeCloudRanking,
  saveCloudRanking,
  subscribeCloudSettings,
  saveCloudSettings,
} from "./utils/firebase";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { UpcomingTournaments } from "./components/UpcomingTournaments";
import { RegistrationSection } from "./components/RegistrationSection";
import { TournamentBracket } from "./components/TournamentBracket";
import { RulesAccordion } from "./components/RulesAccordion";
import { TelegramSection } from "./components/TelegramSection";
import { Footer } from "./components/Footer";
import { TournamentModal } from "./components/TournamentModal";
import { AdminModal } from "./components/AdminModal";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { Award, ChevronRight, Trophy } from "lucide-react";
import { playTactileClick } from "./utils/audio";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "leaderboard">(() => {
    if (typeof window !== "undefined" && window.location.hash === "#leaderboard") {
      return "leaderboard";
    }
    return "home";
  });

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>(() => getStoredTournaments());
  const [bracket, setBracket] = useState<TournamentBracketData>(() => getStoredBracket());
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [rankedTeams, setRankedTeams] = useState<RankedTeam[]>(() => getStoredRankedTeams());
  const [seasons, setSeasons] = useState<string[]>(() => getStoredSeasons());
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Sync state with server so all visitors see the latest tournaments & bracket
  const syncWithServer = useCallback(async () => {
    const serverData = await fetchServerState();
    if (serverData) {
      if (Array.isArray(serverData.tournaments)) {
        setTournaments(serverData.tournaments);
        saveStoredTournaments(serverData.tournaments);
      }
      if (serverData.bracket && Array.isArray(serverData.bracket.matches)) {
        setBracket(serverData.bracket);
        saveStoredBracket(serverData.bracket);
      }
      if (Array.isArray(serverData.rankedTeams)) {
        setRankedTeams(serverData.rankedTeams);
        saveStoredRankedTeams(serverData.rankedTeams);
      }
      if (Array.isArray(serverData.seasons) && serverData.seasons.length > 0) {
        setSeasons(serverData.seasons);
        saveStoredSeasons(serverData.seasons);
      }
      if (serverData.settings) {
        setSettings(serverData.settings);
        saveStoredSettings(serverData.settings);
      }
    }
  }, []);

  // Test Firebase connection on mount
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  // Real-time Firebase Cloud synchronization across all users and devices
  useEffect(() => {
    // 1. Instant direct fetch of cloud bracket for initial load
    fetchCloudBracket().then((cloudBracket) => {
      if (cloudBracket && Array.isArray(cloudBracket.matches) && cloudBracket.matches.length > 0) {
        setBracket(cloudBracket);
        saveStoredBracket(cloudBracket);
      }
    });

    // 2. Real-time onSnapshot listeners
    const unsubTournaments = subscribeCloudTournaments((cloudTournaments) => {
      if (Array.isArray(cloudTournaments)) {
        setTournaments(cloudTournaments);
        saveStoredTournaments(cloudTournaments);
      }
    });

    const unsubBracket = subscribeCloudBracket((cloudBracket) => {
      if (cloudBracket && Array.isArray(cloudBracket.matches) && cloudBracket.matches.length > 0) {
        setBracket(cloudBracket);
        saveStoredBracket(cloudBracket);
      }
    });

    const unsubRanking = subscribeCloudRanking((cloudTeams, cloudSeasons) => {
      if (Array.isArray(cloudTeams) && cloudTeams.length > 0) {
        setRankedTeams(cloudTeams);
        saveStoredRankedTeams(cloudTeams);
      }
      if (Array.isArray(cloudSeasons) && cloudSeasons.length > 0) {
        setSeasons(cloudSeasons);
        saveStoredSeasons(cloudSeasons);
      }
    });

    const unsubSettings = subscribeCloudSettings((cloudSettings) => {
      if (cloudSettings) {
        setSettings((prev) => ({ ...prev, ...cloudSettings }));
      }
    });

    return () => {
      unsubTournaments();
      unsubBracket();
      unsubRanking();
      unsubSettings();
    };
  }, []);

  // Initial fetch and background sync (every 20 seconds or when user focuses window)
  useEffect(() => {
    syncWithServer();

    const interval = setInterval(syncWithServer, 20000);
    const handleFocus = () => syncWithServer();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [syncWithServer]);

  // Secret entry detection & hash synchronization
  useEffect(() => {
    // 1. Check for secret organizer URL (?admin=lineup2026 or ?secret=lineup2026 or #lineup2026)
    const urlParams = new URLSearchParams(window.location.search);
    const adminKey = urlParams.get("admin") || urlParams.get("secret");
    if (adminKey === SECRET_ADMIN_KEY || window.location.hash.includes(SECRET_ADMIN_KEY)) {
      authorizeCurrentDevice();
      setIsAdminOpen(true);
      // Clean query param silently from address bar so it's not exposed
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (window.location.hash === "#admin") {
      setIsAdminOpen(true);
    }

    // 2. Keyboard shortcut for PC organizers: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a" || e.code === "KeyA")) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    const handleHashChange = () => {
      if (window.location.hash === "#admin" || window.location.hash.includes(SECRET_ADMIN_KEY)) {
        setIsAdminOpen(true);
      } else if (window.location.hash === "#leaderboard") {
        setCurrentPage("leaderboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleNavigate = (page: "home" | "leaderboard") => {
    setCurrentPage(page);
    if (page === "leaderboard") {
      window.location.hash = "#leaderboard";
    } else {
      if (window.location.hash === "#leaderboard") {
        history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }
  };

  const handleUpdateTournaments = (updated: Tournament[]) => {
    setTournaments(updated);
    saveStoredTournaments(updated);
    saveServerTournaments(updated);
    saveCloudTournaments(updated);
  };

  const handleUpdateBracket = (updated: TournamentBracketData) => {
    setBracket(updated);
    saveStoredBracket(updated);
    saveServerBracket(updated);
    saveCloudBracket(updated);
  };

  const handleUpdateSettings = (updated: SiteSettings) => {
    setSettings(updated);
    saveStoredSettings(updated);
    saveServerSettings(updated);
    saveCloudSettings(updated);
  };

  const handleUpdateRankedTeams = (updated: RankedTeam[]) => {
    setRankedTeams(updated);
    saveStoredRankedTeams(updated);
    saveServerRankedTeams(updated);
    saveCloudRanking(updated, seasons);
  };

  const handleUpdateSeasons = (updated: string[]) => {
    setSeasons(updated);
    saveStoredSeasons(updated);
    saveServerSeasons(updated);
    saveCloudRanking(rankedTeams, updated);
  };

  const handleResetAll = () => {
    const {
      tournaments: defTournaments,
      settings: defSettings,
      rankedTeams: defTeams,
      seasons: defSeasons,
    } = resetToDefaults();
    setTournaments(defTournaments);
    setSettings(defSettings);
    setRankedTeams(defTeams);
    setSeasons(defSeasons);
    resetServerState();
    saveCloudTournaments(defTournaments);
    saveCloudSettings(defSettings);
    saveCloudRanking(defTeams, defSeasons);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentPage !== "home") {
      handleNavigate("home");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRegisterTournament = (tournament?: Tournament) => {
    if (tournament) {
      setSelectedTournament(tournament);
    }
    handleScrollToSection("register");
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 selection:bg-neutral-800 selection:text-white flex flex-col font-sans">
      {/* Sticky Navbar with official logo & leaderboard page navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenRegister={() => handleScrollToSection("register")}
      />

      {/* Main Content Area: switches between Home and Leaderboard page */}
      {currentPage === "leaderboard" ? (
        <LeaderboardPage
          teams={rankedTeams}
          seasons={seasons}
          onBackToHome={() => handleNavigate("home")}
        />
      ) : (
        <main className="flex-1 w-full">
          {/* Hero Section */}
          <Hero
            featuredTournament={tournaments[0]}
            onJoinClick={() => handleScrollToSection("register")}
            onViewBracketClick={() => handleScrollToSection("bracket")}
          />

          {/* Upcoming Tournaments Section */}
          <UpcomingTournaments
            tournaments={tournaments}
            onSelectTournament={(t) => setSelectedTournament(t)}
            onRegisterClick={(t) => handleRegisterTournament(t)}
          />

          {/* Leaderboard Teaser Banner */}
          <section className="py-10 bg-gradient-to-b from-black via-neutral-950 to-black border-y border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/5">
                    <Award className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono-tech uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        ТАБЛИЦА РЕЙТИНГА
                      </span>
                      <span className="text-xs text-neutral-400 font-mono-tech">
                        • ТОП-15 КОМАНД ЛИГИ
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                      Рейтинг лучших киберспортивных команд
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                      Следите за положением команд в текущем сезоне, набранными очками и претендентами на чемпионские медали.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    handleNavigate("leaderboard");
                  }}
                  className="btn-chrome px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer shadow-xl hover:shadow-amber-500/10"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Открыть рейтинг команд</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Google Form Registration Section */}
          <RegistrationSection
            googleFormUrl={settings.googleFormUrl}
            googleFormEmbedUrl={settings.googleFormEmbedUrl}
          />

          {/* Tournament Bracket (Native Custom Interactive CS2 Grid) */}
          <TournamentBracket bracket={bracket} />

          {/* Rules Accordion Section */}
          <RulesAccordion />

          {/* Telegram Channel & Community Section */}
          <TelegramSection
            telegramUrl={settings.telegramUrl}
            telegramHandle={settings.telegramHandle}
          />
        </main>
      )}

      {/* Official Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Tournament Details Modal */}
      <TournamentModal
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
        onRegister={(t) => handleRegisterTournament(t)}
      />

      {/* Secret Admin Management Panel */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.hash.includes("admin")) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
          }
        }}
        tournaments={tournaments}
        onSaveTournaments={handleUpdateTournaments}
        bracket={bracket}
        onSaveBracket={handleUpdateBracket}
        settings={settings}
        onSaveSettings={handleUpdateSettings}
        rankedTeams={rankedTeams}
        onSaveRankedTeams={handleUpdateRankedTeams}
        seasons={seasons}
        onSaveSeasons={handleUpdateSeasons}
        onResetAll={handleResetAll}
      />
    </div>
  );
}


