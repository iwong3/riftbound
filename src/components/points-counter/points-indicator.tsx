import { Box, Typography } from "@mui/material";
import { GOLD_COLOR, WHITE_COLOR } from "./constants";

type PointsIndicatorProps = {
  currentPoints: number;
  upperLimit: number;
};

export const PointsIndicator = ({
  currentPoints,
  upperLimit,
}: PointsIndicatorProps) => {
  // Always show 0-8 in the first column
  const firstColumnNumbers = Array.from({ length: 9 }, (_, i) => 8 - i); // 8 to 0

  // Second column: always generate 10 circles, but only show numbers 9-13
  // Display highest visible number at top
  // This maintains consistent spacing with the first column
  const secondColumnNumbers = Array.from({ length: 9 }, (_, i) => {
    if (i < 5) {
      // First 5 positions: show highest to lowest visible numbers (9-13)
      // If upperLimit = 9: [9, ?, ?, ?, ?] -> show only 9
      // If upperLimit = 10: [10, 9, ?, ?, ?] -> show 10 and 9
      // If upperLimit = 11: [11, 10, 9, ?, ?] -> show 11, 10, 9
      // If upperLimit = 12: [12, 11, 10, 9, ?] -> show 12, 11, 10, 9
      // If upperLimit = 13: [13, 12, 11, 10, 9] -> show all five
      const maxVisible = Math.min(upperLimit, 13);
      if (i === 0) {
        return maxVisible; // Highest visible at top (9, 10, 11, 12, or 13)
      } else if (i === 1) {
        // Position 1: show maxVisible - 1 if upperLimit >= 10, else placeholder
        return upperLimit >= 10 ? maxVisible - 1 : 14;
      } else if (i === 2) {
        // Position 2: show maxVisible - 2 if upperLimit >= 11, else placeholder
        return upperLimit >= 11 ? maxVisible - 2 : 15;
      } else if (i === 3) {
        // Position 3: show maxVisible - 3 if upperLimit >= 12, else placeholder
        return upperLimit >= 12 ? maxVisible - 3 : 16;
      } else if (i === 4) {
        // Position 4: show maxVisible - 4 if upperLimit >= 13, else placeholder
        return upperLimit >= 13 ? maxVisible - 4 : 17;
      }
    }
    // Positions 5-9 are invisible placeholders (14-18)
    return 14 + (i - 5);
  });

  const circleSize = 18; // Reduced for mobile
  const circleFontSize = 8; // Reduced for mobile

  const renderCircle = (num: number, isActive: boolean, index: number) => (
    <Box
      key={`circle-${num}-${index}`}
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
        border: isActive ? `1px solid ${WHITE_COLOR}` : `1px solid ${GOLD_COLOR}`,
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

  // Determine if a second column number should be visible
  const isSecondColumnNumberVisible = (num: number): boolean => {
    // Only show 10, 11, 12 (hide 13+)
    return num >= 10 && num <= 12 && num <= upperLimit;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 0.5,
        height: "100%",
      }}
    >
      {/* First Column: 0-8 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginY: 0.5,
        }}
      >
        {firstColumnNumbers.map((num, index) => {
          const isActive = currentPoints === num;
          return renderCircle(num, isActive, index);
        })}
      </Box>

      {/* Second Column: Always 9 circles, but only show numbers 9-13 */}
      {/* Display highest number at top (13, 12, 11, 10, 9) */}
      <Box
        key={`second-col-${upperLimit}`}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginY: 0.5,
        }}
      >
        {secondColumnNumbers.map((num, index) => {
          // Only show if it's 9-13 and within upperLimit
          const isVisible = num >= 9 && num <= 13 && num <= upperLimit;
          const isActive = currentPoints === num;

          if (!isVisible) {
            // Render empty circle with transparent border to maintain spacing
            // Use index as key to ensure stable rendering when upperLimit changes
            return (
              <Box
                key={`empty-${index}`}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: circleSize,
                  height: circleSize,
                  minWidth: circleSize,
                  minHeight: circleSize,
                  borderRadius: "50%",
                  backgroundColor: "transparent",
                  border: "1px solid transparent", // Transparent border maintains spacing
                }}
              />
            );
          }

          return renderCircle(num, isActive, index);
        })}
      </Box>
    </Box>
  );
};
