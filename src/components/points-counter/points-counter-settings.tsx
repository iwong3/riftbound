import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { IconMinus, IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { LegendName } from "../../helpers/legends";
import { BLUE_COLOR, GOLD_COLOR, MAX_LIMIT, MIN_LIMIT } from "./constants";
import { LegendSelectionGrid } from "./legend-selection-grid";
import { usePointsCounterStore } from "./points-counter-store";
import { SettingsSection, SettingsSectionTitle } from "./settings-section";

type PointsCounterSettingsProps = {
  open: boolean;
  onClose: () => void;
};

export const PointsCounterSettings = ({
  open,
  onClose,
}: PointsCounterSettingsProps) => {
  const { upperLimit, setUpperLimit, players, setPlayerName, setPlayerLegend } =
    usePointsCounterStore(
      useShallow((state) => ({
        upperLimit: state.upperLimit,
        setUpperLimit: state.setUpperLimit,
        players: state.players,
        setPlayerName: state.setPlayerName,
        setPlayerLegend: state.setPlayerLegend,
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
          maxHeight: "75vh",
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
        Settings
        <IconButton
          onClick={handleClose}
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
          <SettingsSection>
            <SettingsSectionTitle title="Max Points" />
            <Typography
              sx={{
                fontSize: 14,
                color: GOLD_COLOR,
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
                marginBottom: 2,
              }}
            >
              <IconButton
                onClick={handleDecrement}
                disabled={upperLimit <= MIN_LIMIT}
                sx={{
                  color: GOLD_COLOR,
                  border: `2px solid ${GOLD_COLOR}`,
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
                  color: GOLD_COLOR,
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
                  color: GOLD_COLOR,
                  border: `2px solid ${GOLD_COLOR}`,
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
          </SettingsSection>

          {/* Players Section */}
          <SettingsSection showBottomBorder={false}>
            <SettingsSectionTitle title="Players" />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {players.map((player, index) => (
                <Box key={player.id}>
                  {/* Player Name */}
                  <Typography
                    sx={{
                      marginBottom: 2,
                      fontSize: 14,
                      fontWeight: "bold",
                      color: GOLD_COLOR,
                    }}
                  >
                    Player {index + 1}
                  </Typography>
                  <TextField
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
                    fullWidth
                    sx={{
                      marginBottom: 2,
                      "& .MuiOutlinedInput-root": {
                        color: GOLD_COLOR,
                        "& fieldset": {
                          borderColor: GOLD_COLOR,
                        },
                        "&:hover fieldset": {
                          borderColor: GOLD_COLOR,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: GOLD_COLOR,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: GOLD_COLOR,
                        "&.Mui-focused": {
                          color: GOLD_COLOR,
                        },
                      },
                    }}
                  />
                  {/* Player Legend */}
                  <Typography
                    sx={{
                      marginBottom: 1,
                      fontSize: 14,
                      fontWeight: "bold",
                      color: GOLD_COLOR,
                    }}
                  >
                    Player {index + 1} Legend
                  </Typography>
                  <LegendSelectionGrid
                    selectedLegend={player.legend}
                    onSelectLegend={(legend: LegendName | null) =>
                      setPlayerLegend(player.id, legend)
                    }
                    iconSize={60}
                    maxHeight="250px"
                  />
                </Box>
              ))}
            </Box>
          </SettingsSection>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
