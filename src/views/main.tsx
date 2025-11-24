import { Box } from "@mui/material";

import { PointsCounter } from "components/points-counter/points-counter";

export const Main = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100vh",
        background: `radial-gradient(circle at center, rgb(24, 87, 121) 0, #19425b 100%)`,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <PointsCounter />
    </Box>
  );
};
