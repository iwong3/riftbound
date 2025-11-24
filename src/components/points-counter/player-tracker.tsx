import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Player, usePointsCounterStore } from "./points-counter-store";
import { PointsIndicator } from "./points-indicator";

// Constants
const GOLD_COLOR = "#bc9a53";
const GOLD_COLOR_DARK = "#a6894a";
const RED_COLOR = "#C1121F";
const GREEN_COLOR = "#008000";

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
};

const PlayerName = ({ name, onClick, isTop = false }: PlayerNameProps) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: isTop ? "right" : "left",
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
        ...(isTop && { transform: "rotate(180deg)" }),
      }}
    >
      {name}
    </Typography>
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
  const { incrementPoints, decrementPoints, upperLimit, setPlayerName } =
    usePointsCounterStore(
      useShallow((state) => ({
        incrementPoints: state.incrementPoints,
        decrementPoints: state.decrementPoints,
        upperLimit: state.upperLimit,
        setPlayerName: state.setPlayerName,
      }))
    );

  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const [clickedSide, setClickedSide] = useState<"left" | "right" | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(player.name);

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
      {/* Player Name - Top */}
      <PlayerName
        name={player.name}
        onClick={() => {
          setEditedName(player.name);
          setNameDialogOpen(true);
        }}
        isTop={true}
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
              border: `2px solid ${GOLD_COLOR}`,
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 48,
                fontWeight: "bold",
                color: GOLD_COLOR,
                textAlign: "center",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
            backgroundColor: "#19425b",
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
