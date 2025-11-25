import { Box, Typography } from "@mui/material";
import { GOLD_COLOR, WHITE_COLOR } from "./constants";

type PointsIndicatorHorizontalProps = {
  currentPoints: number;
  upperLimit: number;
  onPointClick?: (points: number) => void;
};

export const PointsIndicatorHorizontal = ({
  currentPoints,
  upperLimit,
  onPointClick,
}: PointsIndicatorHorizontalProps) => {
  // Generate array of numbers from 0 to upperLimit
  const numbers = Array.from({ length: upperLimit + 1 }, (_, i) => i);

  const circleSize = 22;
  const circleFontSize = 11;

  const renderCircle = (num: number, isActive: boolean) => (
    <Box
      key={`circle-${num}`}
      onClick={() => onPointClick?.(num)}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: circleSize,
        height: circleSize,
        minWidth: circleSize,
        minHeight: circleSize,
        borderRadius: "50%",
        backgroundColor: isActive ? GOLD_COLOR : "transparent",
        border: isActive
          ? `1px solid ${WHITE_COLOR}`
          : `1px solid ${GOLD_COLOR}`,
        cursor: onPointClick ? "pointer" : "default",
        "&:hover": onPointClick
          ? {
              backgroundColor: isActive
                ? GOLD_COLOR
                : "rgba(188, 154, 83, 0.2)",
            }
          : {},
      }}
    >
      <Typography
        sx={{
          fontSize: circleFontSize,
          fontWeight: "bold",
          color: isActive ? WHITE_COLOR : GOLD_COLOR,
          textAlign: "center",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {num}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      {numbers.map((num) => {
        const isActive = currentPoints === num;
        return renderCircle(num, isActive);
      })}
    </Box>
  );
};
