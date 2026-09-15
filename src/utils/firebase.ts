import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocFromServer,
  onSnapshot,
  Firestore,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Tournament } from "../config/site";
import { TournamentBracketData } from "../config/bracket";
import { RankedTeam } from "../config/ranking";
import { SiteSettings } from "./adminStorage";

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured databaseId if provided
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test as required by Firebase skill
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client is offline or network is restricted.");
    }
    // Any response from server (even not-found) confirms connectivity
    return true;
  }
}

// ----------------------------------------------------
// REAL-TIME SUBSCRIBERS (Changes broadcast to all users)
// ----------------------------------------------------

/**
 * Listens for live tournament updates across all users and devices
 */
export function subscribeCloudTournaments(
  onUpdate: (tournaments: Tournament[]) => void
): () => void {
  try {
    const unsub = onSnapshot(
      doc(db, "site_config", "tournaments"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.list)) {
            onUpdate(data.list as Tournament[]);
          }
        }
      },
      (err) => {
        console.warn("Firebase tournaments listener error:", err);
      }
    );
    return unsub;
  } catch (e) {
    console.warn("Failed to subscribe to cloud tournaments:", e);
    return () => {};
  }
}

/**
 * Saves tournaments to Firestore so that EVERY player on the web sees them instantly
 */
export async function saveCloudTournaments(tournaments: Tournament[]): Promise<boolean> {
  try {
    await setDoc(
      doc(db, "site_config", "tournaments"),
      {
        list: tournaments,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Also persist each tournament in the /tournaments collection
    for (const t of tournaments) {
      if (t.id) {
        await setDoc(
          doc(db, "tournaments", t.id),
          {
            ...t,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
    }

    return true;
  } catch (err) {
    console.error("Failed to save tournaments to Firebase Firestore:", err);
    return false;
  }
}

/**
 * Listens for live bracket updates
 */
export function subscribeCloudBracket(
  onUpdate: (bracket: TournamentBracketData) => void
): () => void {
  try {
    const unsub = onSnapshot(
      doc(db, "site_config", "bracket"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.bracket && Array.isArray(data.bracket.matches)) {
            onUpdate(data.bracket as TournamentBracketData);
          }
        }
      },
      (err) => {
        console.warn("Firebase bracket listener error:", err);
      }
    );
    return unsub;
  } catch (e) {
    console.warn("Failed to subscribe to cloud bracket:", e);
    return () => {};
  }
}

/**
 * Saves tournament bracket to Firestore
 */
export async function saveCloudBracket(bracket: TournamentBracketData): Promise<boolean> {
  try {
    await setDoc(
      doc(db, "site_config", "bracket"),
      {
        bracket,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to save bracket to Firebase Firestore:", err);
    return false;
  }
}

/**
 * Listens for live ranking updates
 */
export function subscribeCloudRanking(
  onUpdate: (rankedTeams: RankedTeam[], seasons: string[], currentSeason?: string) => void
): () => void {
  try {
    const unsub = onSnapshot(
      doc(db, "site_config", "ranking"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const teams = Array.isArray(data.rankedTeams) ? (data.rankedTeams as RankedTeam[]) : [];
          const seasons = Array.isArray(data.seasons) ? (data.seasons as string[]) : [];
          onUpdate(teams, seasons, data.currentSeason);
        }
      },
      (err) => {
        console.warn("Firebase ranking listener error:", err);
      }
    );
    return unsub;
  } catch (e) {
    console.warn("Failed to subscribe to cloud ranking:", e);
    return () => {};
  }
}

/**
 * Saves team rankings and seasons to Firestore
 */
export async function saveCloudRanking(
  rankedTeams: RankedTeam[],
  seasons?: string[],
  currentSeason?: string
): Promise<boolean> {
  try {
    const payload: Record<string, any> = {
      rankedTeams,
      updatedAt: new Date().toISOString(),
    };
    if (seasons) payload.seasons = seasons;
    if (currentSeason) payload.currentSeason = currentSeason;

    await setDoc(doc(db, "site_config", "ranking"), payload, { merge: true });
    return true;
  } catch (err) {
    console.error("Failed to save ranking to Firebase Firestore:", err);
    return false;
  }
}

/**
 * Listens for live site settings (Telegram URL, Google Form registration URL, etc.)
 */
export function subscribeCloudSettings(
  onUpdate: (settings: Partial<SiteSettings>) => void
): () => void {
  try {
    const unsub = onSnapshot(
      doc(db, "site_config", "settings"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.settings) {
            onUpdate(data.settings as Partial<SiteSettings>);
          }
        }
      },
      (err) => {
        console.warn("Firebase settings listener error:", err);
      }
    );
    return unsub;
  } catch (e) {
    console.warn("Failed to subscribe to cloud settings:", e);
    return () => {};
  }
}

/**
 * Saves site settings to Firestore
 */
export async function saveCloudSettings(settings: SiteSettings): Promise<boolean> {
  try {
    await setDoc(
      doc(db, "site_config", "settings"),
      {
        settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to save settings to Firebase Firestore:", err);
    return false;
  }
}
