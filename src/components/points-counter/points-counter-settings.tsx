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
import { IconMinus, IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { LegendName } from "../../helpers/legends";
import {
  clearMatchHistory,
  MatchResult,
  saveMatchToHistory,
} from "../../helpers/match-history";
import { BLUE_COLOR, GOLD_COLOR, MAX_LIMIT, MIN_LIMIT } from "./constants";
import { LegendSelectionGrid } from "./legend-selection-grid";
import { usePointsCounterStore } from "./points-counter-store";
import { SeriesResetDialog } from "./series-reset-dialog";
import { SettingsSection, SettingsSectionTitle } from "./settings-section";

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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
    bestOf,
    setBestOf,
    players,
    setPlayerName,
    setPlayerLegend,
    currentGame,
    seriesWins,
    seriesId,
    newSeries,
    resetPoints,
  } = usePointsCounterStore(
    useShallow((state) => ({
      upperLimit: state.upperLimit,
      setUpperLimit: state.setUpperLimit,
      bestOf: state.bestOf,
      setBestOf: state.setBestOf,
      players: state.players,
      setPlayerName: state.setPlayerName,
      setPlayerLegend: state.setPlayerLegend,
      currentGame: state.currentGame,
      seriesWins: state.seriesWins,
      seriesId: state.seriesId,
      newSeries: state.newSeries,
      resetPoints: state.resetPoints,
    }))
  );

  // Local state for player names to allow controlled inputs
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [pendingBestOf, setPendingBestOf] = useState<number | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

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

  // Detect iOS
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      setIsIOS(isIOSDevice);

      if (isStandalone) {
        setIsInstalled(true);
      }
    };

    checkIOS();
    window.addEventListener("load", checkIOS);

    return () => {
      window.removeEventListener("load", checkIOS);
    };
  }, []);

  // Listen for the beforeinstallprompt event (not supported on iOS)
  useEffect(() => {
    if (isIOS) return; // Skip on iOS as it doesn't support this event

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      const promptEvent = e as BeforeInstallPromptEvent;
      installPromptRef.current = promptEvent;
      setInstallPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        // App is already installed
        setIsInstalled(true);
        setInstallPrompt(null);
      } else {
        setIsInstalled(false);
      }
    };
    checkIfInstalled();

    // Also check on window load
    window.addEventListener("load", checkIfInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("load", checkIfInstalled);
    };
  }, [isIOS]);

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

  const handleBestOfChange = (newBestOf: number) => {
    // If bestOf is changing, always create a new series
    // This simplifies the logic and prevents confusion
    if (newBestOf === bestOf) {
      return; // No change
    }

    // Check if we're in the middle of a series (at least 1 completed game)
    const hasCompletedGames =
      currentGame > 1 || Object.keys(seriesWins).length > 0;

    if (hasCompletedGames) {
      // Show confirmation dialog
      setPendingBestOf(newBestOf);
      setResetDialogOpen(true);
      return;
    }

    // No completed games, proceed directly
    proceedWithBestOfChange(newBestOf);
  };

  const proceedWithBestOfChange = (newBestOf: number) => {
    // Save current game with OLD bestOf if there's a winner, then start new series
    const hasWinner = players.some((p) => p.points >= upperLimit);
    if (hasWinner) {
      // Manually save the current game with old bestOf before resetting
      const winner = players.find((p) => p.points >= upperLimit);
      if (winner && seriesId) {
        const updatedSeriesWins = { ...seriesWins };
        updatedSeriesWins[winner.id] = (updatedSeriesWins[winner.id] || 0) + 1;

        const match: MatchResult = {
          id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          players: players.map((player) => ({
            id: player.id,
            name: player.name,
            legend: player.legend,
            points: player.points,
            turnOrder: player.turnOrder,
          })),
          finishedAt: new Date().toISOString(),
          seriesId: seriesId,
          gameNumber: currentGame,
          seriesWins: updatedSeriesWins,
          bestOf: bestOf, // Save with OLD bestOf
        };
        saveMatchToHistory(match);
      }

      // Reset points so newSeries() won't try to save again
      resetPoints();
    }

    // Start a new series (this will reset everything else)
    newSeries();

    // Update bestOf after starting new series
    setBestOf(newBestOf);
  };

  const handleResetConfirm = () => {
    if (pendingBestOf === null) return;
    proceedWithBestOfChange(pendingBestOf);
    setResetDialogOpen(false);
    setPendingBestOf(null);
  };

  const handleResetCancel = () => {
    setResetDialogOpen(false);
    setPendingBestOf(null);
  };

  const handleBestOfDecrement = () => {
    if (bestOf > 1) {
      handleBestOfChange(bestOf - 2); // Decrement by 2 to keep it odd
    }
  };

  const handleBestOfIncrement = () => {
    if (bestOf < 5) {
      handleBestOfChange(bestOf + 2); // Increment by 2 to keep it odd
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

          <SettingsSection>
            <SettingsSectionTitle title="Best of" />
            <Typography
              sx={{
                fontSize: 14,
                color: GOLD_COLOR,
                marginBottom: 2,
              }}
            >
              Best of X games (max 5)
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
                onClick={handleBestOfDecrement}
                disabled={bestOf <= 1}
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
                {bestOf}
              </Typography>
              <IconButton
                onClick={handleBestOfIncrement}
                disabled={bestOf >= 5}
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
          <SettingsSection>
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

          <SettingsSection>
            <SettingsSectionTitle title="Match History" />
            <Typography
              sx={{
                fontSize: 14,
                color: GOLD_COLOR,
                marginBottom: 2,
              }}
            >
              Clear all match history. This action cannot be undone.
            </Typography>
            <Button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all match history? This cannot be undone."
                  )
                ) {
                  clearMatchHistory();
                }
              }}
              fullWidth
              sx={{
                color: GOLD_COLOR,
                border: `2px solid ${GOLD_COLOR}`,
                paddingY: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(188, 154, 83, 0.1)",
                },
              }}
            >
              Clear Match History
            </Button>
          </SettingsSection>

          {/* Install App Section */}
          <SettingsSection showBottomBorder={false}>
            <SettingsSectionTitle title="Install App" />
            {isInstalled ? (
              <Typography
                sx={{
                  fontSize: 14,
                  color: GOLD_COLOR,
                  marginBottom: 2,
                }}
              >
                This app is already installed on your device.
              </Typography>
            ) : isIOS ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    color: GOLD_COLOR,
                  }}
                >
                  To install this app on iOS:
                </Typography>
                <Box
                  component="ol"
                  sx={{
                    fontSize: 14,
                    color: GOLD_COLOR,
                    paddingLeft: 3,
                    margin: 0,
                    "& li": {
                      marginBottom: 1,
                    },
                  }}
                >
                  <li>
                    Tap the Share button (square with arrow) at the bottom of
                    the screen
                  </li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: GOLD_COLOR,
                    opacity: 0.8,
                    fontStyle: "italic",
                  }}
                >
                  Note: Use Safari browser for the best experience. Chrome on
                  iOS uses Safari's engine and may not show the install option.
                </Typography>
              </Box>
            ) : installPrompt ? (
              <>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: GOLD_COLOR,
                    marginBottom: 2,
                  }}
                >
                  Install this app on your device for offline access and a
                  better experience.
                </Typography>
                <Button
                  onClick={async () => {
                    if (installPromptRef.current) {
                      // Show the install prompt
                      await installPromptRef.current.prompt();
                      // Wait for the user to respond
                      const choiceResult = await installPromptRef.current
                        .userChoice;
                      if (choiceResult.outcome === "accepted") {
                        // User accepted the install prompt
                        setInstallPrompt(null);
                        installPromptRef.current = null;
                        setIsInstalled(true);
                      }
                    }
                  }}
                  fullWidth
                  sx={{
                    color: GOLD_COLOR,
                    border: `2px solid ${GOLD_COLOR}`,
                    paddingY: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(188, 154, 83, 0.1)",
                    },
                  }}
                >
                  Install App
                </Button>
              </>
            ) : (
              <Typography
                sx={{
                  fontSize: 14,
                  color: GOLD_COLOR,
                  marginBottom: 2,
                }}
              >
                Install prompt not available. Make sure you're using a supported
                browser (Chrome, Edge, Safari) and the app is served over HTTPS
                or localhost.
              </Typography>
            )}
          </SettingsSection>
        </Box>
      </DialogContent>

      {/* Series Reset Dialog */}
      {pendingBestOf !== null && (
        <SeriesResetDialog
          open={resetDialogOpen}
          onClose={handleResetCancel}
          onConfirm={handleResetConfirm}
          oldBestOf={bestOf}
          newBestOf={pendingBestOf}
        />
      )}
    </Dialog>
  );
};
