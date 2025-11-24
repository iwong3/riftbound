import { getFromCache, saveInCache } from "./cache";
import { LegendName } from "./legends";

export type MatchResult = {
  id: string;
  players: {
    id: string;
    name: string;
    legend: LegendName | null;
    points: number;
  }[];
  finishedAt: string; // ISO datetime string
  // Future: seriesId?: string; // For "Best of X" feature
  // Future: gameNumber?: number; // For "Best of X" feature
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

export const updateMatchInHistory = (matchId: string, updatedMatch: MatchResult): void => {
  const history = getMatchHistory();
  const index = history.findIndex((m) => m.id === matchId);
  if (index !== -1) {
    history[index] = updatedMatch;
    saveInCache(MATCH_HISTORY_CACHE_KEY, JSON.stringify(history));
  }
};

export const clearMatchHistory = (): void => {
  saveInCache(MATCH_HISTORY_CACHE_KEY, "[]");
};

