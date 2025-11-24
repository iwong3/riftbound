import { Box } from "@mui/material";

import { PointsCounterMenu } from "./points-counter-menu";
import { usePointsCounterStore } from "./points-counter-store";
import { PointsCounterV1 } from "./points-counter-v1";
import { PointsCounterV2 } from "./points-counter-v2";

export const PointsCounter = () => {
  const players = usePointsCounterStore((state) => state.players);
  const layoutVersion = usePointsCounterStore((state) => state.layoutVersion);

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

      {/* Body Section - Version-specific layout */}
      {layoutVersion === "v2" ? (
        <PointsCounterV2 players={players} />
      ) : (
        <PointsCounterV1 players={players} />
      )}
    </Box>
  );
};
