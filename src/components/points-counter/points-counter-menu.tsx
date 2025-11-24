import { Box, IconButton } from "@mui/material";
import {
  IconLayout2,
  IconLayoutList,
  IconPlus,
  IconRefresh,
  IconSettings,
} from "@tabler/icons-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { GOLD_COLOR } from "./constants";
import { MatchHistoryDialog } from "./match-history-dialog";
import { PointsCounterSettings } from "./points-counter-settings";
import { usePointsCounterStore } from "./points-counter-store";

export const PointsCounterMenu = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [matchHistoryOpen, setMatchHistoryOpen] = useState(false);
  const { nextGame, layoutVersion, setLayoutVersion } = usePointsCounterStore(
    useShallow((state) => ({
      nextGame: state.nextGame,
      layoutVersion: state.layoutVersion,
      setLayoutVersion: state.setLayoutVersion,
    }))
  );

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleMatchHistory = () => {
    setMatchHistoryOpen(true);
  };

  const handleNextGame = () => {
    nextGame();
  };

  const handleToggleLayout = () => {
    setLayoutVersion(layoutVersion === "v1" ? "v2" : "v1");
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
        backgroundColor: GOLD_COLOR,
      }}
    >
      {/* Left Side - Layout Toggle */}
      <IconButton
        onClick={handleToggleLayout}
        sx={{
          color: "#000",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          },
        }}
        title={`Switch to ${layoutVersion === "v1" ? "v2" : "v1"} layout`}
      >
        <IconLayout2 size={24} />
      </IconButton>

      {/* Right Side Menu - Rightmost to Leftmost: Settings, Match History, Reset */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
        }}
      >
        {/* Next Game - Leftmost of right side */}
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

        {/* Settings - Rightmost */}
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
    </Box>
  );
};
