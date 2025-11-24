import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { LegendName } from "../../helpers/legends";
import { BLUE_COLOR, GOLD_COLOR } from "./constants";
import { LegendSelectionGrid } from "./legend-selection-grid";

type LegendSelectorDialogProps = {
  open: boolean;
  onClose: () => void;
  selectedLegend: LegendName | null;
  onSelectLegend: (legend: LegendName | null) => void;
  playerName: string;
};

export const LegendSelectorDialog = ({
  open,
  onClose,
  selectedLegend,
  onSelectLegend,
  playerName,
}: LegendSelectorDialogProps) => {
  const handleSelectLegend = (legend: LegendName | null) => {
    onSelectLegend(legend);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: BLUE_COLOR,
          border: `2px double ${GOLD_COLOR}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: GOLD_COLOR,
          fontWeight: "bold",
        }}
      >
        Select Legend for {playerName}
      </DialogTitle>
      <DialogContent>
        <LegendSelectionGrid
          selectedLegend={selectedLegend}
          onSelectLegend={handleSelectLegend}
          iconSize={60}
          maxHeight="400px"
        />
      </DialogContent>
    </Dialog>
  );
};
