import { Box, Typography } from "@mui/material";
import {
  getAvailableLegendNames,
  getLegendDisplayName,
  LegendName,
} from "../../helpers/legends";
import { GOLD_COLOR } from "./constants";
import { LegendIcon } from "./legend-icon";

type LegendSelectionGridProps = {
  selectedLegend: LegendName | null;
  onSelectLegend: (legend: LegendName | null) => void;
  iconSize?: number;
  maxHeight?: string;
  gap?: number;
  paddingY?: number;
};

export const LegendSelectionGrid = ({
  selectedLegend,
  onSelectLegend,
  iconSize = 60,
  maxHeight = "250px",
  gap = 0.5,
  paddingY = 1.5,
}: LegendSelectionGridProps) => {
  const availableLegends = getAvailableLegendNames();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap,
        maxHeight,
        padding: 1,
        paddingY,
        border: `1px solid ${GOLD_COLOR}`,
        borderRadius: 1,
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
      {/* None option */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <LegendIcon
          legend={null}
          size={iconSize}
          onClick={() => onSelectLegend(null)}
          isSelected={selectedLegend === null}
          placeholderText="None"
        />
      </Box>
      {/* Legend options */}
      {availableLegends.map((legendName) => (
        <Box
          key={legendName}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LegendIcon
            legend={legendName}
            size={iconSize}
            onClick={() => onSelectLegend(legendName)}
            isSelected={selectedLegend === legendName}
          />
          <Typography
            sx={{
              fontSize: 12,
              color: GOLD_COLOR,
              textAlign: "center",
            }}
          >
            {getLegendDisplayName(legendName)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
