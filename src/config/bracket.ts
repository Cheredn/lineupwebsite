import { DEFAULT_TEAM_AVATAR } from "./ranking";

export interface BracketTeamSlot {
  id?: string;
  name: string;
  tag?: string;
  avatar: string;
  score: number | null;
  isWinner?: boolean;
}

export interface BracketMatch {
  id: string;
  bracketType: "upper" | "lower" | "grand_final";
  round: number; // 1-indexed
  roundName: string; // e.g., "1/8 финала", "Четвертьфинал", "Полуфинал", "Финал", "Гранд-финал"
  matchNumber: number; // 1-indexed within round
  team1: BracketTeamSlot;
  team2: BracketTeamSlot;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  format: "BO1" | "BO3" | "BO5";
  date?: string;
  time?: string;
  nextMatchId?: string;
  nextMatchSlot?: 1 | 2;
  lowerMatchId?: string;
  lowerMatchSlot?: 1 | 2;
}

export interface TournamentBracketData {
  id: string;
  tournamentTitle: string;
  hasLowerBracket: boolean;
  teamCount: number; // 4, 8, 16
  matches: BracketMatch[];
  lastUpdated?: string;
}

/**
 * Generates an initial CS2 tournament bracket with either Single Elimination or Double Elimination
 */
export function generateDefaultBracket(
  title = "LINEUP CS2 CHAMPIONSHIP #1",
  teamCount: 4 | 8 | 16 = 8,
  hasLowerBracket = false
): TournamentBracketData {
  const matches: BracketMatch[] = [];

  const roundCount = Math.log2(teamCount); // 2, 3, or 4

  const getRoundName = (roundIndex: number, totalRounds: number): string => {
    const roundsFromFinal = totalRounds - roundIndex;
    if (roundsFromFinal === 0) return hasLowerBracket ? "Финал виннеров" : "Гранд-финал";
    if (roundsFromFinal === 1) return "Полуфинал";
    if (roundsFromFinal === 2) return "Четвертьфинал";
    if (roundsFromFinal === 3) return "1/8 финала";
    return `Раунд ${roundIndex}`;
  };

  // Generate Upper Bracket matches
  let currentMatchesCount = teamCount / 2;
  for (let r = 1; r <= roundCount; r++) {
    const roundName = getRoundName(r, roundCount);
    for (let m = 1; m <= currentMatchesCount; m++) {
      const matchId = `UB-R${r}-M${m}`;
      const nextMatchId =
        r < roundCount
          ? `UB-R${r + 1}-M${Math.ceil(m / 2)}`
          : hasLowerBracket
          ? "GF-M1"
          : undefined;
      const nextSlot: 1 | 2 = m % 2 === 1 ? 1 : 2;

      // Lower bracket drop destination if Double Elimination
      let lowerMatchId: string | undefined;
      let lowerMatchSlot: 1 | 2 | undefined;
      if (hasLowerBracket) {
        if (r === 1) {
          lowerMatchId = `LB-R1-M${Math.ceil(m / 2)}`;
          lowerMatchSlot = m % 2 === 1 ? 1 : 2;
        } else if (r === 2) {
          lowerMatchId = `LB-R2-M${m}`;
          lowerMatchSlot = 2;
        } else if (r === roundCount) {
          lowerMatchId = `LB-Final`;
          lowerMatchSlot = 2;
        }
      }

      // Initial seeds for Round 1
      const isRound1 = r === 1;
      const t1Name = isRound1 ? `Команда ${m * 2 - 1}` : "Ожидает победителя";
      const t2Name = isRound1 ? `Команда ${m * 2}` : "Ожидает победителя";

      matches.push({
        id: matchId,
        bracketType: "upper",
        round: r,
        roundName,
        matchNumber: m,
        team1: {
          name: t1Name,
          tag: isRound1 ? `T${m * 2 - 1}` : "",
          avatar: DEFAULT_TEAM_AVATAR,
          score: null,
          isWinner: false,
        },
        team2: {
          name: t2Name,
          tag: isRound1 ? `T${m * 2}` : "",
          avatar: DEFAULT_TEAM_AVATAR,
          score: null,
          isWinner: false,
        },
        status: "UPCOMING",
        format: r === roundCount ? "BO3" : "BO1",
        nextMatchId,
        nextMatchSlot: nextSlot,
        lowerMatchId,
        lowerMatchSlot,
      });
    }
    currentMatchesCount = currentMatchesCount / 2;
  }

  // Generate Lower Bracket matches if enabled
  if (hasLowerBracket) {
    if (teamCount === 8) {
      // 8 teams Double Elimination:
      // LB Round 1: 2 matches (losers of UB R1)
      matches.push({
        id: "LB-R1-M1",
        bracketType: "lower",
        round: 1,
        roundName: "Нижняя сетка — Раунд 1",
        matchNumber: 1,
        team1: { name: "Проигравший UB R1-M1", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Проигравший UB R1-M2", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO1",
        nextMatchId: "LB-R2-M1",
        nextMatchSlot: 1,
      });
      matches.push({
        id: "LB-R1-M2",
        bracketType: "lower",
        round: 1,
        roundName: "Нижняя сетка — Раунд 1",
        matchNumber: 2,
        team1: { name: "Проигравший UB R1-M3", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Проигравший UB R1-M4", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO1",
        nextMatchId: "LB-R2-M2",
        nextMatchSlot: 1,
      });

      // LB Round 2: 2 matches (winners of LB R1 vs losers of UB Semi)
      matches.push({
        id: "LB-R2-M1",
        bracketType: "lower",
        round: 2,
        roundName: "Нижняя сетка — Раунд 2",
        matchNumber: 1,
        team1: { name: "Победитель LB R1-M1", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Проигравший UB Semi-1", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO1",
        nextMatchId: "LB-Final",
        nextMatchSlot: 1,
      });
      matches.push({
        id: "LB-R2-M2",
        bracketType: "lower",
        round: 2,
        roundName: "Нижняя сетка — Раунд 2",
        matchNumber: 2,
        team1: { name: "Победитель LB R1-M2", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Проигравший UB Semi-2", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO1",
        nextMatchId: "LB-Final",
        nextMatchSlot: 2,
      });

      // LB Final: 1 match -> winner goes to Grand Final
      matches.push({
        id: "LB-Final",
        bracketType: "lower",
        round: 3,
        roundName: "Финал нижней сетки",
        matchNumber: 1,
        team1: { name: "Победитель LB R2-M1", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Победитель LB R2-M2", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO3",
        nextMatchId: "GF-M1",
        nextMatchSlot: 2,
      });
    } else if (teamCount === 4) {
      matches.push({
        id: "LB-Final",
        bracketType: "lower",
        round: 1,
        roundName: "Финал нижней сетки",
        matchNumber: 1,
        team1: { name: "Проигравший UB R1-M1", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Проигравший UB R1-M2", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO3",
        nextMatchId: "GF-M1",
        nextMatchSlot: 2,
      });
    } else {
      // 16 teams Double Elimination
      matches.push({
        id: "LB-R1-M1",
        bracketType: "lower",
        round: 1,
        roundName: "Нижняя сетка — Раунд 1",
        matchNumber: 1,
        team1: { name: "Проигравший 1/8", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Проигравший 1/8", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO1",
        nextMatchId: "LB-Final",
        nextMatchSlot: 1,
      });
      matches.push({
        id: "LB-Final",
        bracketType: "lower",
        round: 2,
        roundName: "Финал нижней сетки",
        matchNumber: 1,
        team1: { name: "Победитель сетки лузеров", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        team2: { name: "Проигравший финала виннеров", tag: "", avatar: DEFAULT_TEAM_AVATAR, score: null },
        status: "UPCOMING",
        format: "BO3",
        nextMatchId: "GF-M1",
        nextMatchSlot: 2,
      });
    }

    // Grand Final
    matches.push({
      id: "GF-M1",
      bracketType: "grand_final",
      round: 1,
      roundName: "ГРАНД-ФИНАЛ",
      matchNumber: 1,
      team1: { name: "Победитель сетки виннеров", tag: "UB", avatar: DEFAULT_TEAM_AVATAR, score: null },
      team2: { name: "Победитель сетки лузеров", tag: "LB", avatar: DEFAULT_TEAM_AVATAR, score: null },
      status: "UPCOMING",
      format: "BO3",
    });
  }

  return {
    id: `bracket-${Date.now()}`,
    tournamentTitle: title,
    hasLowerBracket,
    teamCount,
    matches,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Updates a match and optionally advances winner to the next round
 */
export function setMatchWinner(
  bracket: TournamentBracketData,
  matchId: string,
  winnerSlot: 1 | 2 | null,
  score1: number | null,
  score2: number | null
): TournamentBracketData {
  const matches = bracket.matches.map((m) => ({ ...m }));
  const matchIndex = matches.findIndex((m) => m.id === matchId);
  if (matchIndex === -1) return bracket;

  const match = { ...matches[matchIndex] };
  match.team1 = {
    ...match.team1,
    score: score1,
    isWinner: winnerSlot === 1,
  };
  match.team2 = {
    ...match.team2,
    score: score2,
    isWinner: winnerSlot === 2,
  };

  if (winnerSlot !== null) {
    match.status = "FINISHED";
    const winningTeam = winnerSlot === 1 ? match.team1 : match.team2;
    const losingTeam = winnerSlot === 1 ? match.team2 : match.team1;

    // Advance winner to nextMatchId
    if (match.nextMatchId && match.nextMatchSlot) {
      const nextIdx = matches.findIndex((m) => m.id === match.nextMatchId);
      if (nextIdx !== -1) {
        const nextMatch = { ...matches[nextIdx] };
        if (match.nextMatchSlot === 1) {
          nextMatch.team1 = {
            ...nextMatch.team1,
            name: winningTeam.name,
            tag: winningTeam.tag || "",
            avatar: winningTeam.avatar,
            id: winningTeam.id,
          };
        } else {
          nextMatch.team2 = {
            ...nextMatch.team2,
            name: winningTeam.name,
            tag: winningTeam.tag || "",
            avatar: winningTeam.avatar,
            id: winningTeam.id,
          };
        }
        matches[nextIdx] = nextMatch;
      }
    }

    // Drop loser to lowerMatchId if present
    if (match.lowerMatchId && match.lowerMatchSlot) {
      const lowerIdx = matches.findIndex((m) => m.id === match.lowerMatchId);
      if (lowerIdx !== -1) {
        const lowerMatch = { ...matches[lowerIdx] };
        if (match.lowerMatchSlot === 1) {
          lowerMatch.team1 = {
            ...lowerMatch.team1,
            name: losingTeam.name,
            tag: losingTeam.tag || "",
            avatar: losingTeam.avatar,
            id: losingTeam.id,
          };
        } else {
          lowerMatch.team2 = {
            ...lowerMatch.team2,
            name: losingTeam.name,
            tag: losingTeam.tag || "",
            avatar: losingTeam.avatar,
            id: losingTeam.id,
          };
        }
        matches[lowerIdx] = lowerMatch;
      }
    }
  } else {
    // Reset winner
    match.status = "UPCOMING";
  }

  matches[matchIndex] = match;
  return {
    ...bracket,
    matches,
    lastUpdated: new Date().toISOString(),
  };
}
