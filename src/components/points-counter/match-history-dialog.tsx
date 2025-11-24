import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { LegendName } from "../../helpers/legends";
import {
  getMatchHistory,
  MatchResult,
  updateMatchInHistory,
} from "../../helpers/match-history";
import { BLUE_COLOR, GOLD_COLOR, GREEN_COLOR, RED_COLOR } from "./constants";
import { EditMatchDialog } from "./edit-match-dialog";
import { LegendIcon } from "./legend-icon";

// Shared styles
const playerDisplayContainerStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.25,
  flexShrink: 0,
  minWidth: 0,
};

const playerNameStyles = {
  fontSize: 10,
  color: GOLD_COLOR,
  textAlign: "center",
  maxWidth: 50,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const scoreBaseStyles = {
  fontSize: 28,
  fontWeight: "bold",
  textAlign: "center",
  flexShrink: 0,
};

type MatchHistoryDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const MatchHistoryDialog = ({
  open,
  onClose,
}: MatchHistoryDialogProps) => {
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([]);
  const [editingMatch, setEditingMatch] = useState<MatchResult | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Refresh match history when dialog opens
  useEffect(() => {
    if (open) {
      const history = getMatchHistory();
      setMatchHistory(history);
    }
  }, [open]);

  // Sort by datetime descending (most recent first)
  const sortedHistory = [...matchHistory].sort(
    (a, b) =>
      new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
  );

  const handleEditMatch = (match: MatchResult) => {
    setEditingMatch(match);
    setEditDialogOpen(true);
  };

  const handleSaveMatch = (
    updatedMatch: MatchResult,
    shouldClose: boolean = true
  ) => {
    updateMatchInHistory(updatedMatch.id, updatedMatch);
    // Refresh match history
    const history = getMatchHistory();
    setMatchHistory(history);

    if (shouldClose) {
      setEditDialogOpen(false);
      setEditingMatch(null);
    }
    // Don't update editingMatch on auto-save to avoid resetting the form
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: BLUE_COLOR,
          border: `3px double ${GOLD_COLOR}`,
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
        Match History
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
            gap: 1,
            maxHeight: "50vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(188, 154, 83, 0.1)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: GOLD_COLOR,
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "rgba(188, 154, 83, 0.8)",
              },
            },
          }}
        >
          {sortedHistory.length === 0 ? (
            <Typography
              sx={{
                color: GOLD_COLOR,
                textAlign: "center",
                paddingY: 4,
              }}
            >
              No match history yet
            </Typography>
          ) : (
            sortedHistory.map((match) => (
              <MatchHistoryItem
                key={match.id}
                match={match}
                onEdit={handleEditMatch}
              />
            ))
          )}
        </Box>
      </DialogContent>

      {/* Edit Match Dialog */}
      {editingMatch && (
        <EditMatchDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingMatch(null);
          }}
          match={editingMatch}
          onSave={handleSaveMatch}
        />
      )}
    </Dialog>
  );
};

type MatchHistoryItemProps = {
  match: MatchResult;
  onEdit: (match: MatchResult) => void;
};

type MatchPlayerDisplayProps = {
  legend: LegendName | null;
  name: string;
  isWinner: boolean;
  isLoser: boolean;
  showName?: boolean;
};

const MatchPlayerDisplay = ({
  legend,
  name,
  isWinner,
  isLoser,
  showName = true,
}: MatchPlayerDisplayProps) => {
  const borderColor = isWinner ? GREEN_COLOR : isLoser ? RED_COLOR : GOLD_COLOR;

  return (
    <Box sx={playerDisplayContainerStyles}>
      <LegendIcon
        legend={legend}
        size={40}
        showPlaceholder={true}
        borderColor={borderColor}
      />
      {showName && <Typography sx={playerNameStyles}>{name}</Typography>}
    </Box>
  );
};

type MatchScoreProps = {
  points: number;
  isWinner: boolean;
  isLoser: boolean;
};

const MatchScore = ({ points, isWinner, isLoser }: MatchScoreProps) => {
  const color = isWinner ? GREEN_COLOR : isLoser ? RED_COLOR : GOLD_COLOR;
  const textDecoration = isWinner ? "underline" : "none";

  return (
    <Typography
      sx={{
        ...scoreBaseStyles,
        color,
        textDecoration,
      }}
    >
      {points}
    </Typography>
  );
};

type MatchPlayerNameProps = {
  name: string;
};

const MatchPlayerName = ({ name }: MatchPlayerNameProps) => {
  return (
    <Box
      sx={{
        ...playerDisplayContainerStyles,
        width: 46, // Match icon size (40px) + border (3px on each side)
        borderLeft: `3px double transparent`, // Match border width
        borderRight: `3px double transparent`, // Match border width
        boxSizing: "border-box",
      }}
    >
      <Typography sx={playerNameStyles}>{name}</Typography>
    </Box>
  );
};

const MatchHistoryItem = ({ match, onEdit }: MatchHistoryItemProps) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const LONG_PRESS_DURATION = 1500; // 1.5 seconds

  const handleMouseDown = () => {
    setIsLongPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      onEdit(match);
      setIsLongPressing(false);
    }, LONG_PRESS_DURATION);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  const handleMouseLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    // Format without seconds: MM/DD/YY, H:MM AM/PM (no leading zero for hours < 10)
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const hour12 = hours % 12 || 12; // Convert to 12-hour format (0 -> 12, 13 -> 1, etc.)
    const ampm = hours >= 12 ? "PM" : "AM";

    return `${month}/${day}/${year}, ${hour12}:${minutes} ${ampm}`;
  };

  // Determine winner (highest score)
  const player1 = match.players[0];
  const player2 = match.players[1] || match.players[0];
  const player1Won = player1.points > player2.points;
  const player2Won = player2.points > player1.points;

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      sx={{
        border: `3px double ${GOLD_COLOR}`,
        borderRadius: 1,
        padding: 1,
        backgroundColor: isLongPressing
          ? "rgba(188, 154, 83, 0.15)"
          : "rgba(188, 154, 83, 0.05)",
        cursor: "pointer",
        userSelect: "none",
        transition: "background-color 0.2s",
      }}
    >
      {/* Main row: Player 1 icon, Player 1 score, Player 2 score, Player 2 icon */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
        }}
      >
        {/* Player 1 Display */}
        <MatchPlayerDisplay
          legend={player1.legend}
          name={player1.name}
          isWinner={player1Won}
          isLoser={player2Won}
          showName={false}
        />

        {/* Scores */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <MatchScore
            points={player1.points}
            isWinner={player1Won}
            isLoser={player2Won}
          />

          {/* VS separator */}
          <Typography
            sx={{
              fontSize: 12,
              color: GOLD_COLOR,
              opacity: 0.5,
              flexShrink: 0,
            }}
          >
            vs
          </Typography>

          <MatchScore
            points={player2.points}
            isWinner={player2Won}
            isLoser={player1Won}
          />
        </Box>

        {/* Player 2 Display */}
        <MatchPlayerDisplay
          legend={player2.legend}
          name={player2.name}
          isWinner={player2Won}
          isLoser={player1Won}
          showName={false}
        />
      </Box>

      {/* Bottom row: Player 1 name, DateTime, Player 2 name */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
          marginTop: 0.25,
        }}
      >
        {/* Player 1 Name - aligned with Player 1 icon */}
        <MatchPlayerName name={player1.name} />

        {/* DateTime (centered) - aligned with scores section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: GOLD_COLOR,
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            {formatDateTime(match.finishedAt)}
          </Typography>
        </Box>

        {/* Player 2 Name - aligned with Player 2 icon */}
        <MatchPlayerName name={player2.name} />
      </Box>
    </Box>
  );
};
