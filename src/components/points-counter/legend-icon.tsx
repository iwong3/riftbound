import { Box, Typography } from "@mui/material";
import { getLegendIcon, LegendName } from "../../helpers/legends";
import { GOLD_COLOR, WHITE_COLOR } from "./constants";

type LegendIconProps = {
  legend: LegendName | null;
  size?: number;
  onClick?: () => void;
  isSelected?: boolean;
  showPlaceholder?: boolean;
  placeholderText?: string;
  borderColor?: string;
};

const BORDER_WIDTH = 3;

export const LegendIcon = ({
  legend,
  size = 60,
  onClick,
  isSelected = false,
  showPlaceholder = false,
  placeholderText,
  borderColor,
}: LegendIconProps) => {
  const legendIcon = legend ? getLegendIcon(legend) : null;

  const getBorderColor = () => {
    if (borderColor) return borderColor;
    if (isSelected) return WHITE_COLOR;
    return GOLD_COLOR;
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        border: `${BORDER_WIDTH}px double ${getBorderColor()}`,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        backgroundColor: isSelected
          ? "rgba(188, 154, 83, 0.2)"
          : legendIcon
          ? "transparent"
          : "rgba(188, 154, 83, 0.1)",
        "&:hover": onClick
          ? {
              backgroundColor: "rgba(188, 154, 83, 0.2)",
            }
          : {},
      }}
    >
      {legendIcon ? (
        <Box
          component="img"
          src={legendIcon}
          alt={legend || "No legend"}
          sx={{
            width: "90%",
            height: "90%",
            objectFit: "contain",
          }}
        />
      ) : showPlaceholder || placeholderText ? (
        <Typography
          sx={{
            fontSize: 12,
            color: GOLD_COLOR,
            opacity: placeholderText ? 1 : 0.5,
            textAlign: "center",
          }}
        >
          {placeholderText || "?"}
        </Typography>
      ) : null}
    </Box>
  );
};
