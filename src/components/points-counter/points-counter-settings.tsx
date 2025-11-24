import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePointsCounterStore } from "./points-counter-store";

type PointsCounterSettingsProps = {
  open: boolean;
  onClose: () => void;
};

export const PointsCounterSettings = ({
  open,
  onClose,
}: PointsCounterSettingsProps) => {
  const {
    upperLimit,
    setUpperLimit,
    resetAllSettings,
    players,
    setPlayerName,
  } = usePointsCounterStore(
    useShallow((state) => ({
      upperLimit: state.upperLimit,
      setUpperLimit: state.setUpperLimit,
      resetAllSettings: state.resetAllSettings,
      players: state.players,
      setPlayerName: state.setPlayerName,
    }))
  );

  // Local state for player names to allow controlled inputs
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});

  // Initialize player names when dialog opens
  useEffect(() => {
    if (open) {
      const names: Record<string, string> = {};
      players.forEach((player) => {
        names[player.id] = player.name;
      });
      setPlayerNames(names);
    }
  }, [open, players]);

  const MIN_LIMIT = 8;
  const MAX_LIMIT = 13;

  const handleDecrement = () => {
    if (upperLimit > MIN_LIMIT) {
      setUpperLimit(upperLimit - 1);
    }
  };

  const handleIncrement = () => {
    if (upperLimit < MAX_LIMIT) {
      setUpperLimit(upperLimit + 1);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleResetAll = () => {
    resetAllSettings();
  };

  const handlePlayerNameChange = (playerId: string, name: string) => {
    setPlayerNames((prev) => ({ ...prev, [playerId]: name }));
  };

  const handlePlayerNameBlur = (playerId: string) => {
    const name = playerNames[playerId] ?? "";
    const trimmedName = name.trim();
    if (trimmedName) {
      setPlayerName(playerId, trimmedName);
    } else {
      // If empty, restore the original name
      const originalPlayer = players.find((p) => p.id === playerId);
      if (originalPlayer) {
        setPlayerNames((prev) => ({
          ...prev,
          [playerId]: originalPlayer.name,
        }));
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#19425b",
          border: "2px solid #bc9a53",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#bc9a53",
          fontWeight: "bold",
        }}
      >
        Settings
        <IconButton
          onClick={handleResetAll}
          sx={{
            color: "#C1121F",
            "&:hover": {
              backgroundColor: "rgba(193, 18, 31, 0.1)",
            },
          }}
          title="Reset all settings to default"
        >
          <IconRefresh size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            paddingY: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ marginBottom: 1, fontWeight: "bold", color: "#bc9a53" }}
            >
              Max Points
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: "#bc9a53",
                marginBottom: 2,
              }}
            >
              Points needed to win ({MIN_LIMIT}-{MAX_LIMIT})
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <IconButton
                onClick={handleDecrement}
                disabled={upperLimit <= MIN_LIMIT}
                sx={{
                  color: "#bc9a53",
                  border: "2px solid #bc9a53",
                  "&:hover": {
                    backgroundColor: "rgba(188, 154, 83, 0.1)",
                  },
                  "&.Mui-disabled": {
                    borderColor: "rgba(188, 154, 83, 0.3)",
                    color: "rgba(188, 154, 83, 0.3)",
                  },
                }}
              >
                <IconMinus size={24} />
              </IconButton>
              <Typography
                sx={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#bc9a53",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {upperLimit}
              </Typography>
              <IconButton
                onClick={handleIncrement}
                disabled={upperLimit >= MAX_LIMIT}
                sx={{
                  color: "#bc9a53",
                  border: "2px solid #bc9a53",
                  "&:hover": {
                    backgroundColor: "rgba(188, 154, 83, 0.1)",
                  },
                  "&.Mui-disabled": {
                    borderColor: "rgba(188, 154, 83, 0.3)",
                    color: "rgba(188, 154, 83, 0.3)",
                  },
                }}
              >
                <IconPlus size={24} />
              </IconButton>
            </Box>
          </Box>

          {/* Player Names Section */}
          <Box>
            <Typography
              sx={{ marginBottom: 2, fontWeight: "bold", color: "#bc9a53" }}
            >
              Player Names
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {players.map((player, index) => (
                <TextField
                  key={player.id}
                  label={`Player ${index + 1} Name`}
                  value={
                    playerNames[player.id] !== undefined
                      ? playerNames[player.id]
                      : player.name
                  }
                  onChange={(e) =>
                    handlePlayerNameChange(player.id, e.target.value)
                  }
                  onBlur={() => handlePlayerNameBlur(player.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePlayerNameBlur(player.id);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#bc9a53",
                      "& fieldset": {
                        borderColor: "#bc9a53",
                      },
                      "&:hover fieldset": {
                        borderColor: "#bc9a53",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#bc9a53",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#bc9a53",
                      "&.Mui-focused": {
                        color: "#bc9a53",
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleClose}
              variant="contained"
              sx={{
                backgroundColor: "#bc9a53",
                color: "#000",
                "&:hover": {
                  backgroundColor: "#a6894a",
                },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
