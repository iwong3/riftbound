import { getLegendDisplayName, LegendName } from "./legends";
import { MatchResult } from "./match-history";

/**
 * Escapes a CSV field value, handling commas, quotes, and newlines
 */
const escapeCsvField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Converts match history to CSV format
 */
export const matchHistoryToCsv = (matches: MatchResult[]): string => {
  // CSV Headers
  const headers = [
    "Date",
    "Time",
    "Series ID",
    "Game Number",
    "Best Of",
    "Player 1 Name",
    "Player 1 Legend",
    "Player 1 Points",
    "Player 1 Turn Order",
    "Player 2 Name",
    "Player 2 Legend",
    "Player 2 Points",
    "Player 2 Turn Order",
    "Winner",
  ];

  // Sort matches by date descending (most recent first)
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
  );

  // Convert matches to CSV rows
  const rows = sortedMatches.map((match) => {
    const date = new Date(match.finishedAt);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const player1 = match.players[0] || { name: "", legend: null, points: 0, turnOrder: 1 };
    const player2 = match.players[1] || { name: "", legend: null, points: 0, turnOrder: 2 };

    const player1Legend = player1.legend
      ? getLegendDisplayName(player1.legend)
      : "None";
    const player2Legend = player2.legend
      ? getLegendDisplayName(player2.legend)
      : "None";

    // Determine winner
    let winner = "";
    if (player1.points > player2.points) {
      winner = player1.name;
    } else if (player2.points > player1.points) {
      winner = player2.name;
    }

    return [
      escapeCsvField(dateStr),
      escapeCsvField(timeStr),
      escapeCsvField(match.seriesId || ""),
      escapeCsvField(match.gameNumber || ""),
      escapeCsvField(match.bestOf || ""),
      escapeCsvField(player1.name),
      escapeCsvField(player1Legend),
      escapeCsvField(player1.points),
      escapeCsvField(player1.turnOrder || ""),
      escapeCsvField(player2.name),
      escapeCsvField(player2Legend),
      escapeCsvField(player2.points),
      escapeCsvField(player2.turnOrder || ""),
      escapeCsvField(winner),
    ].join(",");
  });

  // Combine headers and rows
  return [headers.join(","), ...rows].join("\n");
};

/**
 * Downloads match history as a CSV file
 */
export const downloadMatchHistoryAsCsv = (matches: MatchResult[]): void => {
  const csvContent = matchHistoryToCsv(matches);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element and trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = `match-history-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

