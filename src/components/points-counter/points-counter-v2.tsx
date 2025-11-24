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
import { Player, usePointsCounterStore } from "./points-counter-store";
import { PointsIndicatorHorizontal } from "./points-indicator-horizontal";

// Constants - Sizes
const FONT_SIZE_PLAYER_NAME = 18;
const FONT_SIZE_BUTTON_SYMBOL = 48;
const FONT_SIZE_CENTER_SCORE = 48;
const FONT_SIZE_CENTER_NAME = 14;

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
  const { setPlayerLegend } = usePointsCounterStore(
    useShallow((state) => ({
      setPlayerLegend: state.setPlayerLegend,
    }))
  );

  const handleLegendClick = () => {
    setLegendDialogOpen(true);
  };

  const handleSelectLegend = (legend: LegendName | null) => {
    setPlayerLegend(player.id, legend);
  };

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
          {/* Legend Icon - Always displayed, clickable */}
          <LegendIcon
            legend={player.legend}
            size={CENTER_SCORE_SIZE}
            onClick={handleLegendClick}
            showPlaceholder={true}
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
              border: `${CENTER_SCORE_BORDER_WIDTH}px double ${GOLD_COLOR}`,
            }}
          >
            <Typography
              sx={{
                fontSize: FONT_SIZE_CENTER_SCORE,
                fontWeight: "bold",
                color: GOLD_COLOR,
                textAlign: "center",
                lineHeight: 1,
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
  const { incrementPoints, decrementPoints, upperLimit, setPlayerName } =
    usePointsCounterStore(
      useShallow((state) => ({
        incrementPoints: state.incrementPoints,
        decrementPoints: state.decrementPoints,
        upperLimit: state.upperLimit,
        setPlayerName: state.setPlayerName,
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        transform: isMirrored ? "rotate(180deg)" : "none",
      }}
    >
      {/* Player Name */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          paddingLeft: SPACING_PADDING_X,
          paddingBottom: SPACING_PADDING_Y_SMALL,
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
            color: GOLD_COLOR,
            cursor: "pointer",
            "&:hover": {
              opacity: 0.7,
            },
          }}
        >
          {player.name}
        </Typography>
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
          height: "25vh",
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
    </Box>
  );
};
