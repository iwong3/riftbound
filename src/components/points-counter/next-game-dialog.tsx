import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useShallow } from "zustand/react/shallow";

import { BLUE_COLOR, GOLD_COLOR } from "./constants";
import { usePointsCounterStore } from "./points-counter-store";

type NextGameDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const NextGameDialog = ({ open, onClose }: NextGameDialogProps) => {
  const {
    bestOf,
    currentGame,
    nextGameInSeries,
    newSeries,
    resetPoints,
    players,
    upperLimit,
    seriesWins,
  } = usePointsCounterStore(
    useShallow((state) => ({
      bestOf: state.bestOf,
      currentGame: state.currentGame,
      nextGameInSeries: state.nextGameInSeries,
      newSeries: state.newSeries,
      resetPoints: state.resetPoints,
      players: state.players,
      upperLimit: state.upperLimit,
      seriesWins: state.seriesWins,
    }))
  );

  const hasWinner = players.some((player) => player.points >= upperLimit);
  const currentGameWinner = hasWinner
    ? players.find((player) => player.points >= upperLimit)
    : null;

  // Check if any player has already won the series
  // For BO3, need 2 wins. For BO5, need 3 wins. Formula: Math.ceil(bestOf / 2)
  const winsRequired = Math.ceil(bestOf / 2);
  
  // Check if series is already won from previous games
  const hasSeriesWinnerFromPrevious = players.some(
    (player) => (seriesWins[player.id] || 0) >= winsRequired
  );
  
  // Check if current game winner would win the series
  const currentGameWinnerWouldWinSeries =
    currentGameWinner &&
    (seriesWins[currentGameWinner.id] || 0) + 1 >= winsRequired;
  
  const hasSeriesWinner = hasSeriesWinnerFromPrevious || currentGameWinnerWouldWinSeries;

  const handleNextGame = () => {
    if (hasWinner) {
      nextGameInSeries();
    } else {
      // Reset current game if no winner
      resetPoints();
    }
    onClose();
  };

  const handleNewSeries = () => {
    newSeries();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: BLUE_COLOR,
          border: `2px solid ${GOLD_COLOR}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingX: 2,
          paddingY: 1,
          color: GOLD_COLOR,
          fontWeight: "bold",
        }}
      >
        Next Game
        <IconButton
          onClick={onClose}
          sx={{
            color: GOLD_COLOR,
            padding: 0,
            "&:hover": {
              backgroundColor: "rgba(188, 154, 83, 0.1)",
            },
          }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ paddingX: 2, paddingBottom: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              color: GOLD_COLOR,
              textAlign: "center",
              marginBottom: 1,
            }}
          >
            Game {currentGame} of Best of {bestOf}
          </Typography>

          {hasWinner && (
            <Typography
              sx={{
                fontSize: 14,
                color: GOLD_COLOR,
                textAlign: "center",
                marginBottom: 2,
              }}
            >
              Current game will be saved to match history.
            </Typography>
          )}

          {hasSeriesWinner && (
            <Typography
              sx={{
                fontSize: 14,
                color: GOLD_COLOR,
                textAlign: "center",
                marginBottom: 2,
                fontWeight: "bold",
              }}
            >
              Series has been won! Start a new series to continue.
            </Typography>
          )}

          {!hasSeriesWinner && (
            <Button
              onClick={handleNextGame}
              fullWidth
              sx={{
                backgroundColor: GOLD_COLOR,
                color: "#000",
                fontWeight: "bold",
                paddingY: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(188, 154, 83, 0.8)",
                },
              }}
            >
              {hasWinner ? "Next Game" : "Reset Game"}
            </Button>
          )}

          <Button
            onClick={handleNewSeries}
            fullWidth
            sx={{
              backgroundColor: "transparent",
              color: GOLD_COLOR,
              fontWeight: "bold",
              border: `2px solid ${GOLD_COLOR}`,
              paddingY: 1.5,
              "&:hover": {
                backgroundColor: "rgba(188, 154, 83, 0.1)",
              },
            }}
          >
            New Series
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

