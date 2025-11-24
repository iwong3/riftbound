import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import {
  clearFromCache,
  getFromCache,
  saveInCache,
} from "../../helpers/cache";

export type Player = {
  id: string;
  name: string;
  points: number;
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
  setUpperLimit: (limit: number) => void;
  setLayoutVersion: (version: "v1" | "v2") => void;
  incrementPoints: (playerId: string) => void;
  decrementPoints: (playerId: string) => void;
  resetPoints: () => void;
  resetAll: () => void;
  resetAllSettings: () => void;
};

const getPlayerNameCacheKey = (playerId: string) => {
  return `pointsCounterPlayerName_${playerId}`;
};

const createInitialPlayers = (numPlayers: number): Player[] => {
  const players: Player[] = [];
  for (let i = 0; i < numPlayers; i++) {
    const playerId = `player-${i + 1}`;
    const defaultName = `Player ${i + 1}`;
    const cachedName = getFromCache(getPlayerNameCacheKey(playerId), defaultName);
    players.push({
      id: playerId,
      name: cachedName,
      points: 0,
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

  resetAll: () => {
    // Clear cached player names
    for (let i = 1; i <= 4; i++) {
      clearFromCache(getPlayerNameCacheKey(`player-${i}`));
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

