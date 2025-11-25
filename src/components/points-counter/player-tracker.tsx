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

import { Player, usePointsCounterStore } from "./points-counter-store";
import { PointsIndicator } from "./points-indicator";

import {
  BLUE_COLOR,
  GOLD_COLOR,
  GOLD_COLOR_DARK,
  GREEN_COLOR,
  RED_COLOR,
} from "./constants";

// Common styles
const playerNameStyles = {
  fontSize: 16,
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  color: GOLD_COLOR,
  cursor: "pointer" as const,
  "&:hover": {
    opacity: 0.7,
  },
};

const sideIndicatorBoxStyles = {
  position: "absolute" as const,
  marginX: 3,
  pointerEvents: "none" as const,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "background-color 0.1s ease-out",
};

const sideIndicatorTextStyles = {
  fontSize: 48,
  fontWeight: "bold" as const,
};

type PlayerTrackerProps = {
  player: Player;
  isMirrored?: boolean; // If true, this is the opponent (top), if false, this is me (bottom)
};

type PlayerNameProps = {
  name: string;
  onClick: () => void;
  isTop?: boolean;
  onDiceClick?: () => void;
  color?: string;
};

const PlayerName = ({
  name,
  onClick,
  isTop = false,
  onDiceClick,
  color,
}: PlayerNameProps) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginX: 2,
      marginY: 0.5,
    }}
  >
    <Typography
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      sx={{
        ...playerNameStyles,
        color: color || GOLD_COLOR,
        transition: "color 0.3s ease-in-out",
        ...(isTop && { transform: "rotate(180deg)" }),
      }}
    >
      {name}
    </Typography>
    {onDiceClick && (
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDiceClick();
        }}
        sx={{
          color: GOLD_COLOR,
          padding: 0.5,
          ...(isTop && { transform: "rotate(180deg)" }),
          "&:hover": {
            backgroundColor: "rgba(188, 154, 83, 0.1)",
          },
        }}
        title="Roll Dice"
      >
        <IconDice3 size={28} />
      </IconButton>
    )}
  </Box>
);

type SideIndicatorProps = {
  side: "left" | "right";
};

const SideIndicator = ({ side }: SideIndicatorProps) => (
  <Box
    sx={{
      ...sideIndicatorBoxStyles,
      [side]: 0,
    }}
  >
    <Typography
      sx={{
        ...sideIndicatorTextStyles,
        color: side === "left" ? RED_COLOR : GREEN_COLOR,
      }}
    >
      {side === "left" ? "−" : "+"}
    </Typography>
  </Box>
);

export const PlayerTracker = ({
  player,
  isMirrored = false,
}: PlayerTrackerProps) => {
  const {
    incrementPoints,
    decrementPoints,
    setPoints,
    rollDice,
    clearDice,
    upperLimit,
    setPlayerName,
  } = usePointsCounterStore(
    useShallow((state) => ({
      incrementPoints: state.incrementPoints,
      decrementPoints: state.decrementPoints,
      setPoints: state.setPoints,
      rollDice: state.rollDice,
      clearDice: state.clearDice,
      upperLimit: state.upperLimit,
      setPlayerName: state.setPlayerName,
    }))
  );

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

  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const [clickedSide, setClickedSide] = useState<"left" | "right" | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
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

  const getSideFromPosition = (x: number, width: number): "left" | "right" => {
    const midpoint = width / 2;
    const side = x < midpoint ? "left" : "right";
    // When mirrored, swap left and right since the user is viewing from opposite side
    return isMirrored ? (side === "left" ? "right" : "left") : side;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const side = getSideFromPosition(mouseX, rect.width);
    setHoveredSide(side);
  };

  const handleMouseLeave = () => {
    setHoveredSide(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const side = getSideFromPosition(clickX, rect.width);

    setClickedSide(side);

    // Reset clicked side after a brief moment for visual feedback
    setTimeout(() => {
      setClickedSide(null);
    }, 150);

    if (side === "left") {
      decrementPoints(player.id);
    } else {
      incrementPoints(player.id);
    }
  };

  const handleSaveName = () => {
    if (editedName.trim() !== "") {
      setPlayerName(player.id, editedName.trim());
      setNameDialogOpen(false);
    }
  };

  // Calculate height based on viewport - split between players
  // For 2 players, each gets ~40% of viewport height
  const trackerHeight = window.innerHeight * 0.4;
  const minHeight = 200; // Minimum height for usability

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: Math.max(trackerHeight, minHeight),
        border: `4px solid ${GOLD_COLOR}`,
        borderRadius: "10px",
        transform: isMirrored ? "rotate(180deg)" : "none",
      }}
    >
      {/* Dice Result Display - Top - Always reserve space */}
      <Box
        onClick={
          player.diceResult !== null ? () => clearDice(player.id) : undefined
        }
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginX: 2,
          marginY: 0.5,
          minHeight: 40 + 20 + 8, // Match height when visible (40px icon + 20px text + padding)
          cursor: player.diceResult !== null ? "pointer" : "default",
          ...(isMirrored && { transform: "rotate(180deg)" }),
        }}
      >
        {player.diceResult !== null && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
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
                <IconDice1 size={40} stroke={GOLD_COLOR} />
              )}
              {player.diceResult === 2 && (
                <IconDice2 size={40} stroke={GOLD_COLOR} />
              )}
              {player.diceResult === 3 && (
                <IconDice3 size={40} stroke={GOLD_COLOR} />
              )}
              {player.diceResult === 4 && (
                <IconDice4 size={40} stroke={GOLD_COLOR} />
              )}
              {player.diceResult === 5 && (
                <IconDice5 size={40} stroke={GOLD_COLOR} />
              )}
              {player.diceResult === 6 && (
                <IconDice6 size={40} stroke={GOLD_COLOR} />
              )}
            </Box>
            <Typography
              sx={{
                fontSize: 20,
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

      {/* Player Name - Top */}
      <PlayerName
        name={player.name}
        onClick={() => {
          setEditedName(player.name);
          setNameDialogOpen(true);
        }}
        isTop={true}
        onDiceClick={() => rollDice(player.id)}
        color={displayColor}
      />

      {/* Points Tracker - Big Rectangle with click zones */}
      <Box
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          flex: 1,
          borderTop: `2px solid ${GOLD_COLOR}`,
          borderBottom: `2px solid ${GOLD_COLOR}`,
          cursor: "pointer",
          userSelect: "none",
          position: "relative",
          transition: "background-color 0.1s ease-out",
          boxSizing: "border-box",
          // overflow: "hidden",
          flexDirection: "row",
        }}
      >
        {/* Points Indicator - Left Side (or Right Side when mirrored) */}
        <Box
          sx={{
            display: "flex",
            pointerEvents: "none",
            width: 48, // Fixed width - always accommodates two columns
            height: "100%",
            marginX: 0.5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PointsIndicator
            currentPoints={player.points}
            upperLimit={upperLimit}
            onPointClick={(points) => setPoints(player.id, points)}
          />
        </Box>
        {/* Center - Points Display */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            position: "relative",
            height: "100%",
          }}
        >
          {/* Visual indicators - left and right side hints */}
          <SideIndicator side="left" />
          <SideIndicator side="right" />

          {/* Points Display */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 80,
              height: 80,
              minWidth: 80,
              minHeight: 80,
              borderRadius: "50%",
              backgroundColor: "transparent",
              border: `2px solid ${displayColor}`,
              zIndex: 1,
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <Typography
              sx={{
                fontSize: 48,
                fontWeight: "bold",
                color: displayColor,
                textAlign: "center",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
        {/* Empty spacing on right side to be symmetrical with the points indicator */}
        <Box
          sx={{
            display: "flex",
            width: 48, // Fixed width - always matches points indicator
            height: "100%",
            marginX: 0.5,
          }}
        >
          {/* Empty spacing */}
        </Box>
      </Box>
      {/* Player Name - Bottom */}
      <PlayerName
        name={player.name}
        onClick={() => {
          setEditedName(player.name);
          setNameDialogOpen(true);
        }}
        isTop={false}
        onDiceClick={() => rollDice(player.id)}
      />

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
              gap: 3,
              paddingY: 2,
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
                gap: 2,
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
