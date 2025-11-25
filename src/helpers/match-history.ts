import { getFromCache, saveInCache } from "./cache";
import { LegendName } from "./legends";

export type MatchResult = {
  id: string;
  players: {
    id: string;
    name: string;
    legend: LegendName | null;
    points: number;
    turnOrder?: number; // Turn order (1 or 2)
  }[];
  finishedAt: string; // ISO datetime string
  seriesId?: string; // Unique ID for the series
  gameNumber?: number; // Game number in the series (1-indexed)
  seriesWins?: Record<string, number>; // Player ID -> number of wins at the time of this match
  bestOf?: number; // Best of X games for this series (1, 3, or 5)
};

const MATCH_HISTORY_CACHE_KEY = "pointsCounterMatchHistory";

export const getMatchHistory = (): MatchResult[] => {
  const cached = getFromCache(MATCH_HISTORY_CACHE_KEY, "[]");
  try {
    return JSON.parse(cached);
  } catch {
    return [];
  }
};

export const saveMatchToHistory = (match: MatchResult): void => {
  const history = getMatchHistory();
  history.push(match);
  saveInCache(MATCH_HISTORY_CACHE_KEY, JSON.stringify(history));
};

export const updateMatchInHistory = (
  matchId: string,
  updatedMatch: MatchResult
): void => {
  const history = getMatchHistory();
  const index = history.findIndex((m) => m.id === matchId);
  if (index !== -1) {
    history[index] = updatedMatch;
    saveInCache(MATCH_HISTORY_CACHE_KEY, JSON.stringify(history));
  }
};

export const deleteMatchFromHistory = (matchId: string): void => {
  const history = getMatchHistory();
  const filtered = history.filter((m) => m.id !== matchId);
  saveInCache(MATCH_HISTORY_CACHE_KEY, JSON.stringify(filtered));
};

export const clearMatchHistory = (): void => {
  saveInCache(MATCH_HISTORY_CACHE_KEY, "[]");
};

export const updateMatchesInSeries = (
  seriesId: string,
  newBestOf: number
): void => {
  const history = getMatchHistory();
  const updated = history.map((match) => {
    if (match.seriesId === seriesId) {
      // Only update the bestOf field, preserve all other data (including scores)
      return { ...match, bestOf: newBestOf };
    }
    return match;
  });
  saveInCache(MATCH_HISTORY_CACHE_KEY, JSON.stringify(updated));
};

export const recalculateSeriesWins = (seriesId: string): void => {
  const history = getMatchHistory();
  const seriesMatches = history
    .filter((m) => m.seriesId === seriesId)
    .sort((a, b) => (a.gameNumber || 1) - (b.gameNumber || 1));

  if (seriesMatches.length === 0) return;

  // Recalculate cumulative wins for each match
  const seriesWins: Record<string, number> = {};
  const updatedMatches = seriesMatches.map((match) => {
    // Determine winner of this match
    const p1 = match.players[0];
    const p2 = match.players[1] || match.players[0];
    const p1Won = p1.points > p2.points;
    const p2Won = p2.points > p1.points;

    // Update cumulative wins
    if (p1Won) {
      seriesWins[p1.id] = (seriesWins[p1.id] || 0) + 1;
    } else if (p2Won) {
      seriesWins[p2.id] = (seriesWins[p2.id] || 0) + 1;
    }

    // Return match with updated seriesWins
    return {
      ...match,
      seriesWins: { ...seriesWins },
    };
  });

  // Update all matches in the series
  const updatedHistory = history.map((match) => {
    if (match.seriesId === seriesId) {
      const updatedMatch = updatedMatches.find((m) => m.id === match.id);
      return updatedMatch || match;
    }
    return match;
  });

  saveInCache(MATCH_HISTORY_CACHE_KEY, JSON.stringify(updatedHistory));
};
