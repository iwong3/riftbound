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
import {
  IconDice1,
  IconDice2,
  IconDice3,
  IconDice4,
  IconDice5,
  IconDice6,
} from "@tabler/icons-react";
import confetti from "canvas-confetti";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { LegendName } from "../../helpers/legends";
import {
  BLUE_COLOR,
  GOLD_COLOR,
  GOLD_COLOR_DARK,
  GREEN_COLOR,
  RED_COLOR,
} from "./constants";
import { LegendIcon } from "./legend-icon";
import { LegendSelectorDialog } from "./legend-selector-dialog";
import { NextGameDialog } from "./next-game-dialog";
import { Player, usePointsCounterStore } from "./points-counter-store";
import { PointsIndicatorHorizontal } from "./points-indicator-horizontal";

// Constants - Sizes
const FONT_SIZE_PLAYER_NAME = 18;
const FONT_SIZE_BUTTON_SYMBOL = 48;
const FONT_SIZE_CENTER_SCORE = 48;
const FONT_SIZE_CENTER_NAME = 14;
const FONT_SIZE_DICE_RESULT = 18;

const CENTER_SCORE_SIZE = 64;
const CENTER_SCORE_BORDER_WIDTH = 3;
const BUTTON_BORDER_WIDTH = 1;
const BUTTON_ASPECT_RATIO = "1.5";

// Constants - Spacing
const SPACING_PADDING_X = 2;
const SPACING_PADDING_Y_SMALL = 1;
const SPACING_PADDING_Y_MEDIUM = 2;
const SPACING_GAP_SMALL = 1;
const SPACING_GAP_MEDIUM = 2;
const SPACING_GAP_LARGE = 3;
const SPACING_MARGIN_SECTION = 4;

type PointsCounterV2Props = {
  players: Player[];
};

type PlayerControlsProps = {
  player: Player;
  isMirrored?: boolean;
};

type CenterScoreDisplayProps = {
  player: Player;
  isRotated?: boolean;
};

const CenterScoreDisplay = ({
  player,
  isRotated = false,
}: CenterScoreDisplayProps) => {
  const [legendDialogOpen, setLegendDialogOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const { setPlayerLegend, clearDice, upperLimit, bestOf, seriesWins } =
    usePointsCounterStore(
      useShallow((state) => ({
        setPlayerLegend: state.setPlayerLegend,
        clearDice: state.clearDice,
        upperLimit: state.upperLimit,
        bestOf: state.bestOf,
        seriesWins: state.seriesWins,
      }))
    );

  // Subscribe only to other players' points for winner/loser calculation
  // Use a selector that extracts just the points we need
  const otherPlayersMaxPoints = usePointsCounterStore(
    useShallow((state) => {
      const otherPlayers = state.players.filter((p) => p.id !== player.id);
      return Math.max(...otherPlayers.map((p) => p.points), 0);
    })
  );

  // Memoize winner/loser calculation
  const { isWinner, isLoser, displayColor } = useMemo(() => {
    const isWinner = player.points >= upperLimit;
    const hasWinner = isWinner || otherPlayersMaxPoints >= upperLimit;
    const isLoser = hasWinner && !isWinner && player.points < upperLimit;

    const displayColor = isWinner
      ? GREEN_COLOR
      : isLoser
      ? RED_COLOR
      : GOLD_COLOR;

    return { isWinner, isLoser, displayColor };
  }, [player.points, upperLimit, otherPlayersMaxPoints]);

  // Trigger animation when diceResult changes
  useEffect(() => {
    if (player.diceResult !== null) {
      setIsRolling(true);
      const timer = setTimeout(() => {
        setIsRolling(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [player.diceResult]);

  // Trigger confetti when player wins
  useEffect(() => {
    if (isWinner) {
      // Confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isWinner]);

  const handleLegendClick = () => {
    setLegendDialogOpen(true);
  };

  const handleSelectLegend = (legend: LegendName | null) => {
    setPlayerLegend(player.id, legend);
  };

  const handleDiceResultClick = () => {
    // Clear dice result when clicked
    clearDice(player.id);
  };

  // Calculate number of circles to show (wins needed, not total games)
  // BO1 = 1 win needed, BO3 = 2 wins needed, BO5 = 3 wins needed
  const numCircles = Math.ceil(bestOf / 2);
  const playerWins = seriesWins[player.id] || 0;

  // If player has reached max points in current game, count it as a win for display
  // (but don't save until next game is pressed)
  const currentGameWin = isWinner ? 1 : 0;
  const totalWinsForDisplay = playerWins + currentGameWin;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: SPACING_GAP_SMALL,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING_GAP_SMALL,
            ...(isRotated && { transform: "rotate(180deg)" }),
          }}
        >
          {/* Victory Circles - Show for all bestOf values */}
          {numCircles > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                marginRight: 1,
              }}
            >
              {Array.from({ length: numCircles }, (_, index) => {
                const circleIndex = numCircles - 1 - index; // Reverse order (bottom to top)
                const isFilled = circleIndex < totalWinsForDisplay;
                return (
                  <Box
                    key={circleIndex}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: isFilled ? GREEN_COLOR : "transparent",
                      border: `2px solid ${
                        isFilled ? GREEN_COLOR : GOLD_COLOR
                      }`,
                    }}
                  />
                );
              })}
            </Box>
          )}

          {/* Legend Icon - Always displayed, clickable */}
          <LegendIcon
            legend={player.legend}
            size={CENTER_SCORE_SIZE}
            onClick={handleLegendClick}
            showPlaceholder={true}
            borderColor={displayColor}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: CENTER_SCORE_SIZE,
              height: CENTER_SCORE_SIZE,
              minWidth: CENTER_SCORE_SIZE,
              minHeight: CENTER_SCORE_SIZE,
              borderRadius: 1,
              backgroundColor: "transparent",
              border: `${CENTER_SCORE_BORDER_WIDTH}px double ${displayColor}`,
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <Typography
              sx={{
                fontSize: FONT_SIZE_CENTER_SCORE,
                fontWeight: "bold",
                color: displayColor,
                textAlign: "center",
                lineHeight: 1,
                transition: "color 0.3s ease-in-out",
                textDecoration:
                  player.points === 6 || player.points === 9
                    ? "underline"
                    : "none",
              }}
            >
              {player.points}
            </Typography>
          </Box>
        </Box>
      </Box>

      <LegendSelectorDialog
        open={legendDialogOpen}
        onClose={() => setLegendDialogOpen(false)}
        selectedLegend={player.legend}
        onSelectLegend={handleSelectLegend}
        playerName={player.name}
      />
    </>
  );
};

const PlayerControls = ({
  player,
  isMirrored = false,
}: PlayerControlsProps) => {
  const {
    incrementPoints,
    decrementPoints,
    setPoints,
    rollDice,
    clearDice,
    upperLimit,
    setPlayerName,
    swapTurnOrder,
  } = usePointsCounterStore(
    useShallow((state) => ({
      incrementPoints: state.incrementPoints,
      decrementPoints: state.decrementPoints,
      setPoints: state.setPoints,
      rollDice: state.rollDice,
      clearDice: state.clearDice,
      upperLimit: state.upperLimit,
      setPlayerName: state.setPlayerName,
      swapTurnOrder: state.swapTurnOrder,
    }))
  );

  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(player.name);

  const handleSaveName = () => {
    if (editedName.trim() !== "") {
      setPlayerName(player.id, editedName.trim());
      setNameDialogOpen(false);
    }
  };

  const handleDecrement = () => {
    decrementPoints(player.id);
  };

  const handleIncrement = () => {
    incrementPoints(player.id);
  };

  const handleDiceClick = () => {
    rollDice(player.id);
  };

  const [isRolling, setIsRolling] = useState(false);

  // Trigger animation whenever diceResult is set (even if same value)
  // Use diceRollCount to ensure animation plays even when result is the same
  useEffect(() => {
    if (player.diceResult !== null) {
      setIsRolling(true);
      const timer = setTimeout(() => {
        setIsRolling(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [player.diceResult, player.diceRollCount]);

  const handleDiceResultClick = () => {
    clearDice(player.id);
  };

  // Subscribe only to other players' max points for winner/loser calculation
  // Use a selector that extracts just the max points we need
  const otherPlayersMaxPoints = usePointsCounterStore(
    useShallow((state) => {
      const otherPlayers = state.players.filter((p) => p.id !== player.id);
      return Math.max(...otherPlayers.map((p) => p.points), 0);
    })
  );

  // Memoize winner/loser calculation
  const { isWinner, isLoser, displayColor } = useMemo(() => {
    const isWinner = player.points >= upperLimit;
    const hasWinner = isWinner || otherPlayersMaxPoints >= upperLimit;
    const isLoser = hasWinner && !isWinner && player.points < upperLimit;

    const displayColor = isWinner
      ? GREEN_COLOR
      : isLoser
      ? RED_COLOR
      : GOLD_COLOR;

    return { isWinner, isLoser, displayColor };
  }, [player.points, upperLimit, otherPlayersMaxPoints]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        transform: isMirrored ? "rotate(180deg)" : "none",
      }}
    >
      {/* Dice Result Display - Always reserve space */}
      <Box
        onClick={player.diceResult !== null ? handleDiceResultClick : undefined}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingX: SPACING_PADDING_X,
          minHeight: 40 + FONT_SIZE_DICE_RESULT * 1.5, // Match height when visible (40px icon + text + padding)
          cursor: player.diceResult !== null ? "pointer" : "default",
        }}
      >
        {player.diceResult !== null && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              "&:hover": {
                opacity: 0.7,
              },
            }}
          >
            <Box
              key={player.diceRollCount || 0}
              sx={{
                animation: isRolling ? "diceRoll 0.5s ease-in-out" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {player.diceResult === 1 && (
                <IconDice1 size={40} color={GOLD_COLOR} />
              )}
              {player.diceResult === 2 && (
                <IconDice2 size={40} color={GOLD_COLOR} />
              )}
              {player.diceResult === 3 && (
                <IconDice3 size={40} color={GOLD_COLOR} />
              )}
              {player.diceResult === 4 && (
                <IconDice4 size={40} color={GOLD_COLOR} />
              )}
              {player.diceResult === 5 && (
                <IconDice5 size={40} color={GOLD_COLOR} />
              )}
              {player.diceResult === 6 && (
                <IconDice6 size={40} color={GOLD_COLOR} />
              )}
            </Box>
            <Typography
              sx={{
                fontSize: FONT_SIZE_DICE_RESULT,
                fontWeight: "bold",
                color: GOLD_COLOR,
                textAlign: "center",
                animation: isRolling ? "diceRoll 0.5s ease-in-out" : "none",
              }}
            >
              {player.diceResult}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Player Name and Dice */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingX: SPACING_PADDING_X,
          paddingBottom: 2,
        }}
      >
        <Typography
          onClick={() => {
            setEditedName(player.name);
            setNameDialogOpen(true);
          }}
          sx={{
            fontSize: FONT_SIZE_PLAYER_NAME,
            fontWeight: "bold",
            color: displayColor,
            cursor: "pointer",
            transition: "color 0.3s ease-in-out",
            "&:hover": {
              opacity: 0.7,
            },
          }}
        >
          {player.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Turn Order Toggle */}
          <IconButton
            onClick={swapTurnOrder}
            sx={{
              color: GOLD_COLOR,
              border: `2px solid ${GOLD_COLOR}`,
              borderRadius: 1,
              width: 24,
              height: 24,
              "&:hover": {
                backgroundColor: "rgba(188, 154, 83, 0.1)",
              },
            }}
            title="Swap Turn Order"
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: "bold",
                color: GOLD_COLOR,
                lineHeight: 1,
              }}
            >
              {player.turnOrder}
            </Typography>
          </IconButton>
          {/* Dice Button */}
          <IconButton
            onClick={handleDiceClick}
            sx={{
              color: GOLD_COLOR,
              padding: 0,
              "&:hover": {
                backgroundColor: "rgba(188, 154, 83, 0.1)",
              },
            }}
            title="Roll Dice"
          >
            <IconDice3 size={27} />
          </IconButton>
        </Box>
      </Box>

      {/* Points Indicator */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          paddingX: SPACING_PADDING_X,
          paddingBottom: SPACING_PADDING_Y_MEDIUM,
        }}
      >
        <PointsIndicatorHorizontal
          currentPoints={player.points}
          upperLimit={upperLimit}
          onPointClick={(points) => setPoints(player.id, points)}
        />
      </Box>

      {/* Plus/Minus Points */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* Decrement Square - Left */}
        <Box
          onClick={handleDecrement}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
            aspectRatio: BUTTON_ASPECT_RATIO,
            backgroundColor: RED_COLOR,
            border: `${BUTTON_BORDER_WIDTH}px solid transparent`,
            cursor: "pointer",
            userSelect: "none",
            "&:hover": {
              backgroundColor: "#a00e1a",
            },
            "&:active": {
              backgroundColor: "#8a0c16",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: FONT_SIZE_BUTTON_SYMBOL,
              fontWeight: "bold",
              color: "white",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            −
          </Typography>
        </Box>

        {/* Increment Square - Right (touching) */}
        <Box
          onClick={handleIncrement}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
            aspectRatio: BUTTON_ASPECT_RATIO,
            border: `${BUTTON_BORDER_WIDTH}px solid transparent`,
            backgroundColor: GREEN_COLOR,
            cursor: "pointer",
            userSelect: "none",
            "&:hover": {
              backgroundColor: "#006600",
            },
            "&:active": {
              backgroundColor: "#004d00",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: FONT_SIZE_BUTTON_SYMBOL,
              fontWeight: "bold",
              color: "white",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </Typography>
        </Box>
      </Box>

      {/* Edit Name Dialog */}
      <Dialog
        open={nameDialogOpen}
        onClose={() => {
          setEditedName(player.name);
          setNameDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: BLUE_COLOR,
            border: `2px solid ${GOLD_COLOR}`,
          },
        }}
      >
        <DialogTitle sx={{ color: GOLD_COLOR, fontWeight: "bold" }}>
          Edit Player Name
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING_GAP_LARGE,
              paddingY: SPACING_PADDING_Y_MEDIUM,
            }}
          >
            <TextField
              label="Player Name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                }
              }}
              fullWidth
              variant="outlined"
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: GOLD_COLOR,
                  },
                  "&:hover fieldset": {
                    borderColor: GOLD_COLOR,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: GOLD_COLOR,
                  },
                  "& input": {
                    color: GOLD_COLOR,
                  },
                },
                "& .MuiInputLabel-root": {
                  color: GOLD_COLOR,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: GOLD_COLOR,
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                gap: SPACING_GAP_MEDIUM,
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => {
                  setEditedName(player.name);
                  setNameDialogOpen(false);
                }}
                variant="outlined"
                sx={{
                  borderColor: GOLD_COLOR,
                  color: GOLD_COLOR,
                  "&:hover": {
                    borderColor: GOLD_COLOR,
                    backgroundColor: "rgba(188, 154, 83, 0.1)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveName}
                variant="contained"
                sx={{
                  backgroundColor: GOLD_COLOR,
                  color: "#000",
                  "&:hover": {
                    backgroundColor: GOLD_COLOR_DARK,
                  },
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export const PointsCounterV2 = ({ players }: PointsCounterV2Props) => {
  const { showWinDialog, setShowWinDialog } = usePointsCounterStore(
    useShallow((state) => ({
      showWinDialog: state.showWinDialog,
      setShowWinDialog: state.setShowWinDialog,
    }))
  );

  // For mirrored layout: top players are opponents, bottom players are "me"
  // With 2 players: Player 2 (top/opponent), Player 1 (bottom/me)
  // Reverse order so bottom player is player 1
  const bottomPlayers = players.slice(0, Math.ceil(players.length / 2));
  const topPlayers = players.slice(Math.ceil(players.length / 2));

  // Get the first player from each group for the center score display
  const topPlayer = topPlayers[0];
  const bottomPlayer = bottomPlayers[0];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
        minHeight: "100vh",
      }}
    >
      {/* Top Player Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginBottom: SPACING_MARGIN_SECTION,
        }}
      >
        {topPlayers.map((player) => (
          <PlayerControls key={player.id} player={player} isMirrored={true} />
        ))}
      </Box>

      {/* Center Score Display */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: SPACING_GAP_MEDIUM,
          height: "10vh",
        }}
      >
        {/* Bottom Player Score - Left */}
        {bottomPlayer && (
          <CenterScoreDisplay player={bottomPlayer} isRotated={false} />
        )}

        {/* Top Player Score - Right */}
        {topPlayer && (
          <CenterScoreDisplay player={topPlayer} isRotated={true} />
        )}
      </Box>

      {/* Bottom Player Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginTop: SPACING_MARGIN_SECTION,
        }}
      >
        {bottomPlayers.map((player) => (
          <PlayerControls key={player.id} player={player} isMirrored={false} />
        ))}
      </Box>

      {/* Win Dialog - Shows automatically when someone wins */}
      <NextGameDialog
        open={showWinDialog}
        onClose={() => setShowWinDialog(false)}
      />
    </Box>
  );
};
