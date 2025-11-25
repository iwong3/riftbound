import { Box } from "@mui/material";

import { PointsCounterMenu } from "./points-counter-menu";
import { usePointsCounterStore } from "./points-counter-store";
import { PointsCounterV2 } from "./points-counter-v2";

export const PointsCounter = () => {
  const players = usePointsCounterStore((state) => state.players);

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

      {/* Body Section */}
      <PointsCounterV2 players={players} />
    </Box>
  );
};
