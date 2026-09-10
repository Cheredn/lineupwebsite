import React, { useState, useEffect } from "react";
import { Tournament, SITE_CONFIG } from "./config/site";
import {
  getStoredTournaments,
  saveStoredTournaments,
  getStoredSettings,
  saveStoredSettings,
  resetToDefaults,
  SiteSettings,
  authorizeCurrentDevice,
  SECRET_ADMIN_KEY,
} from "./utils/adminStorage";
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

export default function App() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>(() => getStoredTournaments());
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Secret entry detection: URL params, hash, and keyboard shortcut
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleUpdateTournaments = (updated: Tournament[]) => {
    setTournaments(updated);
    saveStoredTournaments(updated);
  };

  const handleUpdateSettings = (updated: SiteSettings) => {
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleResetAll = () => {
    const { tournaments: defTournaments, settings: defSettings } = resetToDefaults();
    setTournaments(defTournaments);
    setSettings(defSettings);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRegisterTournament = (tournament?: Tournament) => {
    handleScrollToSection("register");
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 selection:bg-neutral-800 selection:text-white flex flex-col font-sans">
      {/* Sticky Navbar with official logo */}
      <Navbar
        onOpenRegister={() => handleScrollToSection("register")}
      />

      {/* Main Content Area */}
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

        {/* Google Form Real Registration Section */}
        <RegistrationSection
          googleFormUrl={settings.googleFormUrl}
          googleFormEmbedUrl={settings.googleFormEmbedUrl}
        />

        {/* Tournament Bracket (GoodGame Integration) */}
        <TournamentBracket bracketUrl={settings.bracketUrl} />

        {/* Rules Accordion Section */}
        <RulesAccordion />

        {/* Telegram Channel & Community Section */}
        <TelegramSection
          telegramUrl={settings.telegramUrl}
          telegramHandle={settings.telegramHandle}
        />
      </main>

      {/* Official Footer */}
      <Footer />

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
        settings={settings}
        onSaveSettings={handleUpdateSettings}
        onResetAll={handleResetAll}
      />
    </div>
  );
}

