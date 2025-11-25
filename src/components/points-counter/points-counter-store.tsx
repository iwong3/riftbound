import { create } from "zustand";

import { clearFromCache, getFromCache, saveInCache } from "../../helpers/cache";
import { LegendName } from "../../helpers/legends";
import { MatchResult, saveMatchToHistory } from "../../helpers/match-history";

export type Player = {
  id: string;
  name: string;
  points: number;
  legend: LegendName | null;
  diceResult: number | null;
  diceRollCount: number; // Track number of rolls to force animation even for same value
  teamId?: string; // For future team support
};

type PointsCounterState = {
  players: Player[];
  numPlayers: number; // 2, 3, or 4
  gameMode: "1v1" | "2v2" | "1v1v1v1"; // For future team support
  upperLimit: number; // Maximum points allowed
  bestOf: number; // Best of X games (1, 3, or 5)
  currentGame: number; // Current game number in the series (1-indexed)
  seriesWins: Record<string, number>; // Player ID -> number of wins in current series
  seriesId: string; // Unique ID for the current series
};

type PointsCounterActions = {
  setNumPlayers: (num: number) => void;
  setPlayerName: (playerId: string, name: string) => void;
  setPlayerLegend: (playerId: string, legend: LegendName | null) => void;
  setUpperLimit: (limit: number) => void;
  setBestOf: (bestOf: number) => void;
  incrementPoints: (playerId: string) => void;
  decrementPoints: (playerId: string) => void;
  setPoints: (playerId: string, points: number) => void;
  rollDice: (playerId: string) => void;
  rollDiceForAll: () => void;
  clearDice: (playerId: string) => void;
  resetPoints: () => void;
  nextGame: () => void;
  nextGameInSeries: () => void;
  newSeries: () => void;
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
    const cachedName = getFromCache(
      getPlayerNameCacheKey(playerId),
      defaultName
    );
    const cachedLegend = getFromCache(
      getPlayerLegendCacheKey(playerId),
      ""
    ) as LegendName | null;
    players.push({
      id: playerId,
      name: cachedName,
      points: 0,
      legend: cachedLegend || null,
      diceResult: null,
      diceRollCount: 0,
    });
  }
  return players;
};

const UPPER_LIMIT_CACHE_KEY = "pointsCounterUpperLimit";
const BEST_OF_CACHE_KEY = "pointsCounterBestOf";

const getInitialUpperLimit = (): number => {
  const cached = parseInt(getFromCache(UPPER_LIMIT_CACHE_KEY, "8"), 10) || 8;
  // Enforce min (8) and max (13) limits
  return Math.max(8, Math.min(13, cached));
};

const getInitialBestOf = (): number => {
  const cached = parseInt(getFromCache(BEST_OF_CACHE_KEY, "1"), 10) || 1;
  // Enforce min (1) and max (5) limits, must be odd
  const clamped = Math.max(1, Math.min(5, cached));
  // Ensure it's odd
  return clamped % 2 === 0 ? clamped - 1 : clamped;
};

const generateSeriesId = (): string => {
  // Generate UUID for backend logic (uniqueness, grouping)
  // Display name is generated on frontend from match data
  return `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const initialState: PointsCounterState = {
  players: createInitialPlayers(2),
  numPlayers: 2,
  gameMode: "1v1",
  upperLimit: getInitialUpperLimit(),
  bestOf: getInitialBestOf(),
  currentGame: 1,
  seriesWins: {},
  seriesId: generateSeriesId(),
};

export const usePointsCounterStore = create<
  PointsCounterState & PointsCounterActions
>((set) => ({
  ...initialState,

  setNumPlayers: (num: number) => {
    set(() => ({
      numPlayers: num,
      players: createInitialPlayers(num),
      gameMode: num === 2 ? "1v1" : num === 4 ? "2v2" : "1v1v1v1",
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

  setBestOf: (bestOf: number) => {
    // Ensure it's odd, between 1 and 5
    const clamped = Math.max(1, Math.min(5, bestOf));
    const oddValue = clamped % 2 === 0 ? clamped - 1 : clamped;
    set(() => ({ bestOf: oddValue }));
    saveInCache(BEST_OF_CACHE_KEY, oddValue.toString());
  },

  incrementPoints: (playerId: string) => {
    set((state) => {
      // Check if any other player already has max points
      const hasOtherPlayerAtMax = state.players.some(
        (p) => p.id !== playerId && p.points >= state.upperLimit
      );

      // If another player has max points, prevent this player from reaching max
      const maxAllowedPoints = hasOtherPlayerAtMax
        ? state.upperLimit - 1
        : state.upperLimit;

      return {
        players: state.players.map((player) =>
          player.id === playerId
            ? {
                ...player,
                points: Math.min(maxAllowedPoints, player.points + 1),
              }
            : player
        ),
      };
    });
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

  setPoints: (playerId: string, points: number) => {
    set((state) => {
      // Check if any other player already has max points
      const hasOtherPlayerAtMax = state.players.some(
        (p) => p.id !== playerId && p.points >= state.upperLimit
      );

      // If another player has max points, prevent this player from reaching max
      const maxAllowedPoints = hasOtherPlayerAtMax
        ? state.upperLimit - 1
        : state.upperLimit;

      return {
        players: state.players.map((player) =>
          player.id === playerId
            ? {
                ...player,
                points: Math.max(0, Math.min(maxAllowedPoints, points)),
              }
            : player
        ),
      };
    });
  },

  rollDice: (playerId: string) => {
    const result = Math.floor(Math.random() * 6) + 1; // 1-6
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              diceResult: result,
              diceRollCount: (player.diceRollCount || 0) + 1,
            }
          : player
      ),
    }));
  },

  rollDiceForAll: () => {
    set((state) => ({
      players: state.players.map((player) => ({
        ...player,
        diceResult: Math.floor(Math.random() * 6) + 1,
        diceRollCount: (player.diceRollCount || 0) + 1,
      })),
    }));
  },

  clearDice: (playerId: string) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? { ...player, diceResult: null, diceRollCount: 0 }
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
    // This is called from the menu button
    // For BO1, proceed directly. For BO3+, the dialog will call nextGameInSeries or newSeries
    // The menu component will check bestOf and show dialog if needed
    // This function is kept for backward compatibility but does nothing
    // The actual logic is handled in the menu component
  },

  nextGameInSeries: () => {
    set((state) => {
      // Check if any player has reached the win condition
      const hasWinner = state.players.some(
        (player) => player.points >= state.upperLimit
      );

      // Reset dice results and roll counts
      const resetPlayers = state.players.map((player) => ({
        ...player,
        diceResult: null,
        diceRollCount: 0,
      }));

      let updatedSeriesWins = { ...state.seriesWins };
      let updatedCurrentGame = state.currentGame;
      let updatedSeriesId = state.seriesId;

      if (hasWinner) {
        // Find the winner
        const winner = state.players.find(
          (player) => player.points >= state.upperLimit
        );

        if (winner) {
          // Increment series wins for the winner
          updatedSeriesWins[winner.id] = (updatedSeriesWins[winner.id] || 0) + 1;

          // Save match to history with series info (use updated seriesWins)
          // Only save when there's a winner (someone hit max points)
          const match: MatchResult = {
            id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            players: state.players.map((player) => ({
              id: player.id,
              name: player.name,
              legend: player.legend,
              points: player.points,
            })),
            finishedAt: new Date().toISOString(),
            seriesId: state.seriesId,
            gameNumber: state.currentGame,
            seriesWins: { ...updatedSeriesWins },
            bestOf: state.bestOf,
          };
          saveMatchToHistory(match);
        }
      }
      // Don't save matches without a winner - only save when someone hits max points

      // Move to next game in series
      updatedCurrentGame = state.currentGame + 1;

      // For BO1, reset series wins when moving to next game (to clear circles)
      if (state.bestOf === 1) {
        updatedSeriesWins = {};
      }

      // Reset points to 0 and use resetPlayers (which already has dice cleared)
      return {
        players: resetPlayers.map((player) => ({ ...player, points: 0 })),
        currentGame: updatedCurrentGame,
        seriesWins: updatedSeriesWins,
        seriesId: updatedSeriesId,
      };
    });
  },

  newSeries: () => {
    set((state) => {
      // Check if any player has reached the win condition
      const hasWinner = state.players.some(
        (player) => player.points >= state.upperLimit
      );

      // Reset dice results and roll counts
      const resetPlayers = state.players.map((player) => ({
        ...player,
        diceResult: null,
        diceRollCount: 0,
      }));

      if (hasWinner) {
        // Find the winner
        const winner = state.players.find(
          (player) => player.points >= state.upperLimit
        );

        if (winner) {
          // Save match to history with series info before resetting
          // Only save when there's a winner (someone hit max points)
          const match: MatchResult = {
            id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            players: state.players.map((player) => ({
              id: player.id,
              name: player.name,
              legend: player.legend,
              points: player.points,
            })),
            finishedAt: new Date().toISOString(),
            seriesId: state.seriesId,
            gameNumber: state.currentGame,
            seriesWins: { ...state.seriesWins },
            bestOf: state.bestOf,
          };
          saveMatchToHistory(match);
        }
      }
      // Don't save matches without a winner - only save when someone hits max points

      // Start a new series
      return {
        players: resetPlayers.map((player) => ({ ...player, points: 0 })),
        currentGame: 1,
        seriesWins: {},
        seriesId: generateSeriesId(),
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
        bestOf: 1,
        currentGame: 1,
        seriesWins: {},
        seriesId: generateSeriesId(),
      }));
    saveInCache(UPPER_LIMIT_CACHE_KEY, "8");
    saveInCache(BEST_OF_CACHE_KEY, "1");
  },

  resetAllSettings: () => {
    set(() => ({
      upperLimit: 8,
      bestOf: 1,
      currentGame: 1,
      seriesWins: {},
      seriesId: generateSeriesId(),
    }));
    saveInCache(UPPER_LIMIT_CACHE_KEY, "8");
    saveInCache(BEST_OF_CACHE_KEY, "1");
  },
}));
