import { Box } from "@mui/material";

import { PlayerTracker } from "./player-tracker";
import { PointsCounterMenu } from "./points-counter-menu";
import { usePointsCounterStore } from "./points-counter-store";

export const PointsCounter = () => {
  const players = usePointsCounterStore((state) => state.players);

  // For mirrored layout: top players are opponents, bottom players are "me"
  // With 2 players: Player 1 (top/opponent), Player 2 (bottom/me)
  // This will be expanded for 3-4 players later
  const topPlayers = players.slice(0, Math.ceil(players.length / 2));
  const bottomPlayers = players.slice(Math.ceil(players.length / 2));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* Header Menu - Full Width */}
      <PointsCounterMenu />

      {/* Body Section - With Horizontal Padding */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          paddingX: 2,
          paddingY: 4,
          boxSizing: "border-box",
        }}
      >
        {/* Top Section - Opponents (Mirrored) */}
        {/* Note: Visual mirroring can be added later - for now, just reverse order */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginBottom: 2,
          }}
        >
          {topPlayers.map((player) => (
            <PlayerTracker key={player.id} player={player} isMirrored={true} />
          ))}
        </Box>

        {/* Bottom Section - Me */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: 2,
          }}
        >
          {bottomPlayers.map((player) => (
            <PlayerTracker key={player.id} player={player} isMirrored={false} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
