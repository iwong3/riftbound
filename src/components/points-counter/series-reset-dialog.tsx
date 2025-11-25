import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { BLUE_COLOR, GOLD_COLOR } from "./constants";

type SeriesResetDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  oldBestOf: number;
  newBestOf: number;
};

export const SeriesResetDialog = ({
  open,
  onClose,
  onConfirm,
  oldBestOf,
  newBestOf,
}: SeriesResetDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: BLUE_COLOR,
          border: `2px solid ${GOLD_COLOR}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: GOLD_COLOR,
          fontWeight: "bold",
          padding: 2,
          paddingBottom: 1,
        }}
      >
        Reset Series?
      </DialogTitle>
      <DialogContent sx={{ paddingX: 2, paddingBottom: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              color: GOLD_COLOR,
            }}
          >
            Changing the "Best of" setting will reset the current series. If the
            current game is finished, it will be recorded, then a new series
            will begin.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={onClose}
              sx={{
                color: GOLD_COLOR,
                border: `2px solid ${GOLD_COLOR}`,
                "&:hover": {
                  backgroundColor: "rgba(188, 154, 83, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              sx={{
                backgroundColor: GOLD_COLOR,
                color: "#000",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "rgba(188, 154, 83, 0.8)",
                },
              }}
            >
              Reset Series
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
