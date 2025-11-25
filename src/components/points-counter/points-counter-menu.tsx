import { Box, IconButton } from "@mui/material";
import {
  IconDice3,
  IconLayoutList,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import riftboundLogo from "../../images/riftbound-logo.svg";
import { BLUE_COLOR, GOLD_COLOR } from "./constants";
import { MatchHistoryDialog } from "./match-history-dialog";
import { NextGameDialog } from "./next-game-dialog";
import { PointsCounterSettings } from "./points-counter-settings";
import { usePointsCounterStore } from "./points-counter-store";

export const PointsCounterMenu = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [matchHistoryOpen, setMatchHistoryOpen] = useState(false);
  const [nextGameDialogOpen, setNextGameDialogOpen] = useState(false);
  const { nextGame, nextGameInSeries, rollDiceForAll, bestOf } =
    usePointsCounterStore(
      useShallow((state) => ({
        nextGame: state.nextGame,
        nextGameInSeries: state.nextGameInSeries,
        rollDiceForAll: state.rollDiceForAll,
        bestOf: state.bestOf,
      }))
    );

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleMatchHistory = () => {
    setMatchHistoryOpen(true);
  };

  const handleNextGame = () => {
    if (bestOf === 1) {
      // For BO1, proceed directly
      nextGameInSeries();
    } else {
      // For BO3+, show dialog
      setNextGameDialogOpen(true);
    }
  };

  const handleRollDiceForAll = () => {
    rollDiceForAll();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: 1,
        boxSizing: "border-box",
        background: `linear-gradient(to right, ${BLUE_COLOR} 0%, ${BLUE_COLOR} 15%, ${GOLD_COLOR} 60%, ${GOLD_COLOR} 100%)`,
      }}
    >
      {/* Left Side - Logo */}
      <Box
        component="img"
        src={riftboundLogo}
        alt="Riftbound"
        sx={{
          width: 24,
          height: 24,
          padding: 1,
        }}
      />

      {/* Right Side Menu */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
        }}
      >
        {/* Roll Dice for All */}
        <IconButton
          onClick={handleRollDiceForAll}
          sx={{
            color: "#000",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
          }}
          title="Roll Dice for All Players"
        >
          <IconDice3 size={24} />
        </IconButton>

        {/* Next Game */}
        <IconButton
          onClick={handleNextGame}
          sx={{
            color: "#000",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
          }}
          title="Next Game"
        >
          <IconPlus size={24} />
        </IconButton>

        {/* Match History */}
        <IconButton
          onClick={handleMatchHistory}
          sx={{
            color: "#000",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
          }}
          title="Match History"
        >
          <IconLayoutList size={24} />
        </IconButton>

        {/* Settings */}
        <IconButton
          onClick={handleSettings}
          sx={{
            color: "#000",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <IconSettings size={24} />
        </IconButton>
      </Box>

      {/* Settings Dialog */}
      <PointsCounterSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Match History Dialog */}
      <MatchHistoryDialog
        open={matchHistoryOpen}
        onClose={() => setMatchHistoryOpen(false)}
      />

      {/* Next Game Dialog */}
      <NextGameDialog
        open={nextGameDialogOpen}
        onClose={() => setNextGameDialogOpen(false)}
      />
    </Box>
  );
};
