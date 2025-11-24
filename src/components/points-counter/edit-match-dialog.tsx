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
import { LegendName } from "../../helpers/legends";
import { MatchResult } from "../../helpers/match-history";
import {
  BLUE_COLOR,
  GOLD_COLOR,
  GOLD_COLOR_DARK,
  MAX_LIMIT,
  MIN_LIMIT,
} from "./constants";
import { LegendSelectionGrid } from "./legend-selection-grid";
import { SettingsSection, SettingsSectionTitle } from "./settings-section";

// Reusable Player Edit Section Component
type PlayerEditSectionProps = {
  playerNumber: number;
  name: string;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  legend: LegendName | null;
  onLegendChange: (legend: LegendName | null) => void;
  points: number;
  onIncrement: () => void;
  onDecrement: () => void;
  pointsToWin: number;
  otherPlayerPoints: number;
};

const PlayerEditSection = ({
  playerNumber,
  name,
  onNameChange,
  onNameBlur,
  legend,
  onLegendChange,
  points,
  onIncrement,
  onDecrement,
  pointsToWin,
  otherPlayerPoints,
}: PlayerEditSectionProps) => {
  const isIncrementDisabled =
    points >= pointsToWin ||
    (otherPlayerPoints === pointsToWin && points >= pointsToWin - 1);

  return (
    <SettingsSection>
      <SettingsSectionTitle title={`Player ${playerNumber}`} marginBottom={2} />
      <TextField
        label="Name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onBlur={onNameBlur}
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
      <Typography
        sx={{
          fontSize: 14,
          color: GOLD_COLOR,
          marginBottom: 1,
        }}
      >
        Legend
      </Typography>
      <LegendSelectionGrid
        selectedLegend={legend}
        onSelectLegend={onLegendChange}
        iconSize={60}
        maxHeight="250px"
      />
      <Typography
        sx={{
          fontSize: 14,
          color: GOLD_COLOR,
          marginTop: 2,
          marginBottom: 2,
        }}
      >
        Points
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
          onClick={onDecrement}
          disabled={points <= 0}
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
          {points}
        </Typography>
        <IconButton
          onClick={onIncrement}
          disabled={isIncrementDisabled}
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
  );
};

type EditMatchDialogProps = {
  open: boolean;
  onClose: () => void;
  match: MatchResult;
  onSave: (updatedMatch: MatchResult, shouldClose?: boolean) => void;
};

export const EditMatchDialog = ({
  open,
  onClose,
  match,
  onSave,
}: EditMatchDialogProps) => {
  const [player1Name, setPlayer1Name] = useState(match.players[0]?.name || "");
  const [player2Name, setPlayer2Name] = useState(match.players[1]?.name || "");
  const [player1Points, setPlayer1Points] = useState(
    match.players[0]?.points || 0
  );
  const [player2Points, setPlayer2Points] = useState(
    match.players[1]?.points || 0
  );
  const [player1Legend, setPlayer1Legend] = useState<LegendName | null>(
    match.players[0]?.legend || null
  );
  const [player2Legend, setPlayer2Legend] = useState<LegendName | null>(
    match.players[1]?.legend || null
  );
  const [pointsToWin, setPointsToWin] = useState(() => {
    // Default to the higher of the two player's points, or 8
    const maxPoints = Math.max(
      match.players[0]?.points || 0,
      match.players[1]?.points || 0
    );
    return maxPoints > 0 ? maxPoints : 8;
  });
  const [dateTime, setDateTime] = useState(() => {
    const date = new Date(match.finishedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  // Track previous values for auto-save detection
  const prevPlayer1LegendRef = useRef<LegendName | null>(player1Legend);
  const prevPlayer2LegendRef = useRef<LegendName | null>(player2Legend);

  // Reset form when dialog opens with new match
  useEffect(() => {
    if (open) {
      const p1Points = match.players[0]?.points || 0;
      const p2Points = match.players[1]?.points || 0;
      const maxPoints = Math.max(p1Points, p2Points);
      const initialPointsToWin = maxPoints > 0 ? maxPoints : MIN_LIMIT;

      setPlayer1Name(match.players[0]?.name || "");
      setPlayer2Name(match.players[1]?.name || "");
      setPlayer1Points(p1Points);
      setPlayer2Points(p2Points);
      setPlayer1Legend(match.players[0]?.legend || null);
      setPlayer2Legend(match.players[1]?.legend || null);
      setPointsToWin(initialPointsToWin);
      prevPlayer1LegendRef.current = match.players[0]?.legend || null;
      prevPlayer2LegendRef.current = match.players[1]?.legend || null;

      const date = new Date(match.finishedAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [open, match]);

  const createUpdatedMatch = (
    p1Points?: number,
    p2Points?: number,
    p1Name?: string,
    p2Name?: string,
    p1Legend?: LegendName | null,
    p2Legend?: LegendName | null,
    dt?: string,
    ptsToWin?: number
  ): MatchResult => {
    const date = new Date(dt || dateTime);
    const p1Pts = p1Points !== undefined ? p1Points : player1Points;
    const p2Pts = p2Points !== undefined ? p2Points : player2Points;
    const ptsWin = ptsToWin !== undefined ? ptsToWin : pointsToWin;

    // Constrain points to pointsToWin
    const constrainedP1Points = Math.min(Math.max(0, p1Pts), ptsWin);
    const constrainedP2Points = Math.min(Math.max(0, p2Pts), ptsWin);

    // Ensure both players don't have max points
    let finalP1Points = constrainedP1Points;
    let finalP2Points = constrainedP2Points;
    if (constrainedP1Points === ptsWin && constrainedP2Points === ptsWin) {
      // If both are at max, keep the one that was already at max, or default to player 1
      if (match.players[0]?.points === ptsWin) {
        finalP2Points = ptsWin - 1;
      } else {
        finalP1Points = ptsWin - 1;
      }
    }

    return {
      ...match,
      players: [
        {
          id: match.players[0]?.id || "player1",
          name: (p1Name || player1Name).trim() || "Player 1",
          legend: p1Legend !== undefined ? p1Legend : player1Legend,
          points: finalP1Points,
        },
        {
          id: match.players[1]?.id || "player2",
          name: (p2Name || player2Name).trim() || "Player 2",
          legend: p2Legend !== undefined ? p2Legend : player2Legend,
          points: finalP2Points,
        },
      ],
      finishedAt: date.toISOString(),
    };
  };

  const handleSave = () => {
    const updatedMatch = createUpdatedMatch();
    onSave(updatedMatch, true); // true = should close
    onClose();
  };

  const handleAutoSave = (
    p1Points?: number,
    p2Points?: number,
    p1Name?: string,
    p2Name?: string,
    p1Legend?: LegendName | null,
    p2Legend?: LegendName | null,
    dt?: string,
    ptsToWin?: number
  ) => {
    const updatedMatch = createUpdatedMatch(
      p1Points,
      p2Points,
      p1Name,
      p2Name,
      p1Legend,
      p2Legend,
      dt,
      ptsToWin
    );
    onSave(updatedMatch, false); // false = don't close
  };

  const handleDecrementPlayer1 = () => {
    const newPoints = Math.max(0, player1Points - 1);
    setPlayer1Points(newPoints);
    handleAutoSave(newPoints);
  };

  const handleIncrementPlayer1 = () => {
    const newPoints = Math.min(player1Points + 1, pointsToWin);
    // If player 2 is at max, don't allow player 1 to reach max
    const maxAllowed =
      player2Points === pointsToWin ? pointsToWin - 1 : pointsToWin;
    const finalPoints = Math.min(newPoints, maxAllowed);
    setPlayer1Points(finalPoints);
    handleAutoSave(finalPoints);
  };

  const handleDecrementPlayer2 = () => {
    const newPoints = Math.max(0, player2Points - 1);
    setPlayer2Points(newPoints);
    handleAutoSave(undefined, newPoints);
  };

  const handleIncrementPlayer2 = () => {
    const newPoints = Math.min(player2Points + 1, pointsToWin);
    // If player 1 is at max, don't allow player 2 to reach max
    const maxAllowed =
      player1Points === pointsToWin ? pointsToWin - 1 : pointsToWin;
    const finalPoints = Math.min(newPoints, maxAllowed);
    setPlayer2Points(finalPoints);
    handleAutoSave(undefined, finalPoints);
  };

  const handlePlayer1NameBlur = () => {
    handleAutoSave(undefined, undefined, player1Name);
  };

  const handlePlayer2NameBlur = () => {
    handleAutoSave(undefined, undefined, undefined, player2Name);
  };

  const handlePlayer1LegendChange = (legend: LegendName | null) => {
    const prevLegend = prevPlayer1LegendRef.current;
    setPlayer1Legend(legend);
    prevPlayer1LegendRef.current = legend;
    // Auto-save if different from previous
    if (legend !== prevLegend) {
      handleAutoSave(undefined, undefined, undefined, undefined, legend);
    }
  };

  const handlePlayer2LegendChange = (legend: LegendName | null) => {
    const prevLegend = prevPlayer2LegendRef.current;
    setPlayer2Legend(legend);
    prevPlayer2LegendRef.current = legend;
    // Auto-save if different from previous
    if (legend !== prevLegend) {
      handleAutoSave(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        legend
      );
    }
  };

  const handleDateTimeChange = (newDateTime: string) => {
    setDateTime(newDateTime);
    handleAutoSave(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      newDateTime
    );
  };

  const handlePointsToWinChange = (newPointsToWin: number) => {
    let newP1Points = player1Points;
    let newP2Points = player2Points;

    // Constrain existing points
    if (player1Points > newPointsToWin) {
      newP1Points = newPointsToWin;
      setPlayer1Points(newPointsToWin);
    }
    if (player2Points > newPointsToWin) {
      newP2Points = newPointsToWin;
      setPlayer2Points(newPointsToWin);
    }
    // Ensure both players don't have max points
    if (newP1Points === newPointsToWin && newP2Points === newPointsToWin) {
      newP2Points = newPointsToWin - 1;
      setPlayer2Points(newPointsToWin - 1);
    }

    setPointsToWin(newPointsToWin);
    handleAutoSave(
      newP1Points,
      newP2Points,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      newPointsToWin
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        Edit Match
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
          {/* Points to Win Section */}
          <SettingsSection>
            <SettingsSectionTitle title="Points to Win" />
            <Typography
              sx={{
                fontSize: 14,
                color: GOLD_COLOR,
                marginBottom: 2,
              }}
            >
              Maximum points allowed ({MIN_LIMIT}-{MAX_LIMIT})
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
                onClick={() =>
                  handlePointsToWinChange(Math.max(MIN_LIMIT, pointsToWin - 1))
                }
                disabled={pointsToWin <= MIN_LIMIT}
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
                {pointsToWin}
              </Typography>
              <IconButton
                onClick={() =>
                  handlePointsToWinChange(Math.min(MAX_LIMIT, pointsToWin + 1))
                }
                disabled={pointsToWin >= MAX_LIMIT}
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

          {/* Player 1 Section */}
          <PlayerEditSection
            playerNumber={1}
            name={player1Name}
            onNameChange={setPlayer1Name}
            onNameBlur={handlePlayer1NameBlur}
            legend={player1Legend}
            onLegendChange={handlePlayer1LegendChange}
            points={player1Points}
            onIncrement={handleIncrementPlayer1}
            onDecrement={handleDecrementPlayer1}
            pointsToWin={pointsToWin}
            otherPlayerPoints={player2Points}
          />

          {/* Player 2 Section */}
          <PlayerEditSection
            playerNumber={2}
            name={player2Name}
            onNameChange={setPlayer2Name}
            onNameBlur={handlePlayer2NameBlur}
            legend={player2Legend}
            onLegendChange={handlePlayer2LegendChange}
            points={player2Points}
            onIncrement={handleIncrementPlayer2}
            onDecrement={handleDecrementPlayer2}
            pointsToWin={pointsToWin}
            otherPlayerPoints={player1Points}
          />

          {/* DateTime Section */}
          <SettingsSection showBottomBorder={false}>
            <SettingsSectionTitle title="Date of Match" />
            <TextField
              type="datetime-local"
              value={dateTime}
              onChange={(e) => handleDateTimeChange(e.target.value)}
              fullWidth
              sx={{
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
          </SettingsSection>

          {/* Save Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                backgroundColor: GOLD_COLOR,
                color: "#000",
                fontWeight: "bold",
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
  );
};
