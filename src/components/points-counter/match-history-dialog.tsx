import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { IconPentagonNumber1, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { getLegendDisplayName, LegendName } from "../../helpers/legends";
import {
  getMatchHistory,
  MatchResult,
  recalculateSeriesWins,
  updateMatchInHistory,
} from "../../helpers/match-history";
import {
  BLUE_COLOR,
  GOLD_COLOR,
  GOLD_COLOR_DARK,
  GREEN_COLOR,
  PLAYER_1_COLOR,
  PLAYER_2_COLOR,
  RED_COLOR,
} from "./constants";
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

  // Group matches by seriesId and sort
  const groupedBySeries = new Map<string, MatchResult[]>();
  matchHistory.forEach((match) => {
    const seriesId = match.seriesId || "no-series";
    if (!groupedBySeries.has(seriesId)) {
      groupedBySeries.set(seriesId, []);
    }
    groupedBySeries.get(seriesId)!.push(match);
  });

  // Sort each series by datetime descending, then sort series by most recent match
  const sortedSeries = Array.from(groupedBySeries.entries())
    .map(([seriesId, matches]) => ({
      seriesId,
      matches: matches.sort(
        (a, b) =>
          new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
      ),
      mostRecentDate: Math.max(
        ...matches.map((m) => new Date(m.finishedAt).getTime())
      ),
    }))
    .sort((a, b) => b.mostRecentDate - a.mostRecentDate);

  // Generate alternating colors for series borders
  const SERIES_COLORS = [GOLD_COLOR, GOLD_COLOR_DARK]; // Gold and darker gold for alternation

  // Generate human-readable series display name
  const getSeriesDisplayName = (
    match: MatchResult,
    allMatchesInSeries: MatchResult[]
  ): string => {
    const p1 = match.players[0];
    const p2 = match.players[1] || match.players[0];
    const p1Legend = getLegendDisplayName(p1.legend);
    const p2Legend = getLegendDisplayName(p2.legend);
    const bestOf = match.bestOf || 1;

    // Recalculate series wins dynamically from all matches in the series
    // This ensures we always have the current state, even if matches were edited
    const calculatedSeriesWins: Record<string, number> = {};
    const sortedMatches = [...allMatchesInSeries].sort(
      (a, b) => (a.gameNumber || 1) - (b.gameNumber || 1)
    );

    sortedMatches.forEach((m) => {
      const matchP1 = m.players[0];
      const matchP2 = m.players[1] || m.players[0];
      const matchP1Won = matchP1.points > matchP2.points;
      const matchP2Won = matchP2.points > matchP1.points;

      if (matchP1Won) {
        calculatedSeriesWins[matchP1.id] =
          (calculatedSeriesWins[matchP1.id] || 0) + 1;
      } else if (matchP2Won) {
        calculatedSeriesWins[matchP2.id] =
          (calculatedSeriesWins[matchP2.id] || 0) + 1;
      }
    });

    const winsRequired = Math.ceil(bestOf / 2);
    const p1Wins = calculatedSeriesWins[p1.id] || 0;
    const p2Wins = calculatedSeriesWins[p2.id] || 0;

    const p1WonSeries = p1Wins >= winsRequired;
    const p2WonSeries = p2Wins >= winsRequired;
    const isIncomplete = !p1WonSeries && !p2WonSeries;

    // Add crown emoji to winner's name
    const p1Name = p1WonSeries ? `👑 ${p1.name}` : p1.name;
    const p2Name = p2WonSeries ? `👑 ${p2.name}` : p2.name;

    const incompleteText = isIncomplete ? " (Incomplete)" : "";

    return `${p1Name}'s ${p1Legend} vs. ${p2Name}'s ${p2Legend} - Bo${bestOf}${incompleteText}`;
  };

  const handleEditMatch = (match: MatchResult) => {
    setEditingMatch(match);
    setEditDialogOpen(true);
  };

  const handleSaveMatch = (
    updatedMatch: MatchResult,
    shouldClose: boolean = true
  ) => {
    updateMatchInHistory(updatedMatch.id, updatedMatch);

    // Recalculate seriesWins for all matches in the series if this match is part of a series
    if (updatedMatch.seriesId) {
      recalculateSeriesWins(updatedMatch.seriesId);
    }

    // Refresh match history to update series titles dynamically
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
          {sortedSeries.length === 0 ? (
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
            sortedSeries.map((series, seriesIndex) => {
              const seriesColor =
                SERIES_COLORS[seriesIndex % SERIES_COLORS.length];
              const firstMatch = series.matches[0];
              const formatDateTime = (isoString: string): string => {
                const date = new Date(isoString);
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const year = String(date.getFullYear()).slice(-2);
                const hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, "0");
                const hour12 = hours % 12 || 12;
                const ampm = hours >= 12 ? "PM" : "AM";
                return `${month}/${day}/${year}, ${hour12}:${minutes} ${ampm}`;
              };

              return (
                <Box key={series.seriesId}>
                  {/* Series Header */}
                  <Box
                    sx={{
                      paddingX: 1,
                      marginBottom: 0.5,
                    }}
                  >
                    {/* Series Title - Full Width */}
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: GOLD_COLOR,
                        fontWeight: "bold",
                      }}
                    >
                      {getSeriesDisplayName(firstMatch, series.matches)}
                    </Typography>
                  </Box>
                  {/* Series Matches */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    {series.matches.map((match) => (
                      <MatchHistoryItem
                        key={match.id}
                        match={match}
                        onEdit={handleEditMatch}
                        allMatches={matchHistory}
                        seriesBorderColor={seriesColor}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })
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
  allMatches: MatchResult[];
  seriesBorderColor?: string;
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

const MatchHistoryItem = ({
  match,
  onEdit,
  allMatches,
  seriesBorderColor = GOLD_COLOR,
}: MatchHistoryItemProps) => {
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

  // Series circles logic
  const seriesWins = match.seriesWins || {};
  const gameNumber = match.gameNumber || 1;
  const p1Wins = seriesWins[player1.id] || 0;
  const p2Wins = seriesWins[player2.id] || 0;

  // Use stored bestOf, or infer from series info if not stored
  let bestOf = match.bestOf || 1;
  if (!match.bestOf && (p1Wins > 0 || p2Wins > 0 || gameNumber > 1)) {
    // Infer from game number (fallback for old matches)
    if (gameNumber <= 3) {
      bestOf = 3;
    } else if (gameNumber <= 5) {
      bestOf = 5;
    }
  }

  // Number of circles should match bestOf (BO1 = 1 circle, BO3 = 3 circles, BO5 = 5 circles)
  const numCircles = bestOf;

  // Determine winner of this match
  const thisGameWinner = player1Won ? player1 : player2Won ? player2 : null;

  // Get all matches in the same series, sorted by game number
  const seriesMatches = match.seriesId
    ? allMatches
        .filter((m) => m.seriesId === match.seriesId)
        .sort((a, b) => (a.gameNumber || 1) - (b.gameNumber || 1))
    : [match];

  // Create a map of game number to winner
  const gameWinners = new Map<number, { id: string; name: string } | null>();
  seriesMatches.forEach((seriesMatch) => {
    const gameNum = seriesMatch.gameNumber || 1;
    const p1 = seriesMatch.players[0];
    const p2 = seriesMatch.players[1] || seriesMatch.players[0];
    const p1Won = p1.points > p2.points;
    const p2Won = p2.points > p1.points;
    const winner = p1Won ? p1 : p2Won ? p2 : null;
    gameWinners.set(gameNum, winner);
  });

  // Calculate series state: for each game, determine if it's been played and who won
  const getSeriesCircleState = (gameNum: number) => {
    if (gameNum < gameNumber) {
      // Previous game - look up in series matches
      const winner = gameWinners.get(gameNum);
      if (winner) {
        // Match the winner to player1 or player2 based on ID
        const matchedWinner =
          winner.id === player1.id
            ? player1
            : winner.id === player2.id
            ? player2
            : null;
        return { winner: matchedWinner, played: true };
      }
      return { winner: null, played: false };
    } else if (gameNum === gameNumber) {
      // Current game
      return { winner: thisGameWinner, played: thisGameWinner !== null };
    } else {
      // Future game
      return { winner: null, played: false };
    }
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      sx={{
        border: `3px double ${seriesBorderColor}`,
        borderRadius: 1,
        paddingX: 1,
        paddingTop: 0.5,
        paddingBottom: 1,
        backgroundColor: isLongPressing
          ? "rgba(188, 154, 83, 0.15)"
          : "rgba(188, 154, 83, 0.05)",
        cursor: "pointer",
        userSelect: "none",
        transition: "background-color 0.2s",
      }}
    >
      {/* Game Number and Datetime Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            color: GOLD_COLOR,
            opacity: 0.8,
          }}
        >
          Game {gameNumber}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            color: GOLD_COLOR,
            opacity: 0.7,
          }}
        >
          {formatDateTime(match.finishedAt)}
        </Typography>
      </Box>

      {/* Main row: Player 1 icon, Turn order icon, Scores, Turn order icon, Player 2 icon */}
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

        {/* Turn Order Icon for Player 1 (or empty space) */}
        <Box
          sx={{
            width: 12,
            height: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {(player1.turnOrder || 1) === 1 && (
            <IconPentagonNumber1 size={12} color={GOLD_COLOR} />
          )}
        </Box>

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

        {/* Turn Order Icon for Player 2 (or empty space) */}
        <Box
          sx={{
            width: 12,
            height: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {(player2.turnOrder || 2) === 1 && (
            <IconPentagonNumber1 size={12} color={GOLD_COLOR} />
          )}
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

        {/* Series Circles or DateTime (centered) - aligned with scores section */}
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
          {numCircles > 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {Array.from({ length: numCircles }, (_, index) => {
                const gameNum = index + 1;
                const circleState = getSeriesCircleState(gameNum);
                const isPlayer1 = circleState.winner?.id === player1.id;
                const isPlayer2 = circleState.winner?.id === player2.id;
                const playerColor = isPlayer1
                  ? PLAYER_1_COLOR
                  : isPlayer2
                  ? PLAYER_2_COLOR
                  : GOLD_COLOR;
                const isFilled =
                  circleState.played && circleState.winner !== null;
                const winnerInitial = circleState.winner
                  ? circleState.winner.name.charAt(0).toUpperCase()
                  : "";

                return (
                  <Box
                    key={gameNum}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: isFilled ? playerColor : "transparent",
                      border: `2px solid ${
                        isFilled ? playerColor : GOLD_COLOR
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isFilled && (
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: "#fff",
                          textAlign: "center",
                          lineHeight: 1,
                        }}
                      >
                        {winnerInitial}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          ) : (
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
          )}
        </Box>

        {/* Player 2 Name - aligned with Player 2 icon */}
        <MatchPlayerName name={player2.name} />
      </Box>
    </Box>
  );
};
