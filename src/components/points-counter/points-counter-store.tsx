import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import {
  clearFromCache,
  getFromCache,
  saveInCache,
} from "../../helpers/cache";
import { LegendName } from "../../helpers/legends";
import {
  MatchResult,
  saveMatchToHistory,
} from "../../helpers/match-history";

export type Player = {
  id: string;
  name: string;
  points: number;
  legend: LegendName | null;
  teamId?: string; // For future team support
};

type PointsCounterState = {
  players: Player[];
  numPlayers: number; // 2, 3, or 4
  gameMode: "1v1" | "2v2" | "1v1v1v1"; // For future team support
  upperLimit: number; // Maximum points allowed
  layoutVersion: "v1" | "v2"; // Layout version
};

type PointsCounterActions = {
  setNumPlayers: (num: number) => void;
  setPlayerName: (playerId: string, name: string) => void;
  setPlayerLegend: (playerId: string, legend: LegendName | null) => void;
  setUpperLimit: (limit: number) => void;
  setLayoutVersion: (version: "v1" | "v2") => void;
  incrementPoints: (playerId: string) => void;
  decrementPoints: (playerId: string) => void;
  resetPoints: () => void;
  nextGame: () => void;
  resetAll: () => void;
  resetAllSettings: () => void;
};

const getPlayerNameCacheKey = (playerId: string) => {
  return `pointsCounterPlayerName_${playerId}`;
};

const getPlayerLegendCacheKey = (playerId: string) => {
  return `pointsCounterPlayerLegend_${playerId}`;
};

const createInitialPlayers = (numPlayers: number): Player[] => {
  const players: Player[] = [];
  for (let i = 0; i < numPlayers; i++) {
    const playerId = `player-${i + 1}`;
    const defaultName = `Player ${i + 1}`;
    const cachedName = getFromCache(getPlayerNameCacheKey(playerId), defaultName);
    const cachedLegend = getFromCache(getPlayerLegendCacheKey(playerId), "") as LegendName | null;
    players.push({
      id: playerId,
      name: cachedName,
      points: 0,
      legend: cachedLegend || null,
    });
  }
  return players;
};

const UPPER_LIMIT_CACHE_KEY = "pointsCounterUpperLimit";
const LAYOUT_VERSION_CACHE_KEY = "pointsCounterLayoutVersion";

const getInitialUpperLimit = (): number => {
  const cached = parseInt(getFromCache(UPPER_LIMIT_CACHE_KEY, "8"), 10) || 8;
  // Enforce min (8) and max (13) limits
  return Math.max(8, Math.min(13, cached));
};

const getInitialLayoutVersion = (): "v1" | "v2" => {
  const cached = getFromCache(LAYOUT_VERSION_CACHE_KEY, "v2");
  return cached === "v1" ? "v1" : "v2";
};

const initialState: PointsCounterState = {
  players: createInitialPlayers(2),
  numPlayers: 2,
  gameMode: "1v1",
  upperLimit: getInitialUpperLimit(),
  layoutVersion: getInitialLayoutVersion(),
};

export const usePointsCounterStore = create<
  PointsCounterState & PointsCounterActions
>((set) => ({
  ...initialState,

  setNumPlayers: (num: number) => {
    set(() => ({
      numPlayers: num,
      players: createInitialPlayers(num),
      gameMode:
        num === 2
          ? "1v1"
          : num === 4
          ? "2v2"
          : "1v1v1v1",
    }));
  },

  setPlayerName: (playerId: string, name: string) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, name } : player
      ),
    }));
    // Save to cache
    saveInCache(getPlayerNameCacheKey(playerId), name);
  },

  setPlayerLegend: (playerId: string, legend: LegendName | null) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, legend } : player
      ),
    }));
    // Save to cache
    saveInCache(getPlayerLegendCacheKey(playerId), legend || "");
  },

  setUpperLimit: (limit: number) => {
    // Enforce min (8) and max (13) limits
    const clampedLimit = Math.max(8, Math.min(13, limit));
    set(() => ({ upperLimit: clampedLimit }));
    saveInCache(UPPER_LIMIT_CACHE_KEY, clampedLimit.toString());
  },

  setLayoutVersion: (version: "v1" | "v2") => {
    set(() => ({ layoutVersion: version }));
    saveInCache(LAYOUT_VERSION_CACHE_KEY, version);
  },

  incrementPoints: (playerId: string) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? { ...player, points: Math.min(state.upperLimit, player.points + 1) }
          : player
      ),
    }));
  },

  decrementPoints: (playerId: string) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? { ...player, points: Math.max(0, player.points - 1) }
          : player
      ),
    }));
  },

  resetPoints: () => {
    set((state) => ({
      players: state.players.map((player) => ({ ...player, points: 0 })),
    }));
  },

  nextGame: () => {
    set((state) => {
      // Check if any player has reached the win condition
      const hasWinner = state.players.some(
        (player) => player.points >= state.upperLimit
      );

      if (hasWinner) {
        // Save match to history
        const match: MatchResult = {
          id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          players: state.players.map((player) => ({
            id: player.id,
            name: player.name,
            legend: player.legend,
            points: player.points,
          })),
          finishedAt: new Date().toISOString(),
        };
        saveMatchToHistory(match);
      }

      // Reset points to 0
      return {
        players: state.players.map((player) => ({ ...player, points: 0 })),
      };
    });
  },

  resetAll: () => {
    // Clear cached player names and legends
    for (let i = 1; i <= 4; i++) {
      clearFromCache(getPlayerNameCacheKey(`player-${i}`));
      clearFromCache(getPlayerLegendCacheKey(`player-${i}`));
    }
    set(() => ({
      ...initialState,
      players: createInitialPlayers(2),
      upperLimit: 8,
    }));
    saveInCache(UPPER_LIMIT_CACHE_KEY, "8");
  },

  resetAllSettings: () => {
    set(() => ({
      upperLimit: 8,
      layoutVersion: "v2",
    }));
    saveInCache(UPPER_LIMIT_CACHE_KEY, "8");
    saveInCache(LAYOUT_VERSION_CACHE_KEY, "v2");
  },
}));

