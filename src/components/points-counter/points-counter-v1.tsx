import { Box } from "@mui/material";

import { PlayerTracker } from "./player-tracker";
import { Player } from "./points-counter-store";

type PointsCounterV1Props = {
  players: Player[];
};

export const PointsCounterV1 = ({ players }: PointsCounterV1Props) => {
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
        paddingX: 2,
        paddingY: 4,
        boxSizing: "border-box",
      }}
    >
      {/* Top Section - Opponents (Mirrored) */}
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
  );
};

