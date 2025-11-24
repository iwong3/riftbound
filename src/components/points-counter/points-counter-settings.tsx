import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useShallow } from "zustand/react/shallow";

import { usePointsCounterStore } from "./points-counter-store";

type PointsCounterSettingsProps = {
  open: boolean;
  onClose: () => void;
};

export const PointsCounterSettings = ({
  open,
  onClose,
}: PointsCounterSettingsProps) => {
  const { upperLimit, setUpperLimit, resetAllSettings } = usePointsCounterStore(
    useShallow((state) => ({
      upperLimit: state.upperLimit,
      setUpperLimit: state.setUpperLimit,
      resetAllSettings: state.resetAllSettings,
    }))
  );

  const MIN_LIMIT = 8;
  const MAX_LIMIT = 13;

  const handleDecrement = () => {
    if (upperLimit > MIN_LIMIT) {
      setUpperLimit(upperLimit - 1);
    }
  };

  const handleIncrement = () => {
    if (upperLimit < MAX_LIMIT) {
      setUpperLimit(upperLimit + 1);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleResetAll = () => {
    resetAllSettings();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#19425b",
          border: "2px solid #bc9a53",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#bc9a53",
          fontWeight: "bold",
        }}
      >
        Settings
        <IconButton
          onClick={handleResetAll}
          sx={{
            color: "#C1121F",
            "&:hover": {
              backgroundColor: "rgba(193, 18, 31, 0.1)",
            },
          }}
          title="Reset all settings to default"
        >
          <IconRefresh size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            paddingY: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ marginBottom: 1, fontWeight: "bold", color: "#bc9a53" }}
            >
              Max Points
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: "#bc9a53",
                marginBottom: 2,
              }}
            >
              Points needed to win ({MIN_LIMIT}-{MAX_LIMIT})
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <IconButton
                onClick={handleDecrement}
                disabled={upperLimit <= MIN_LIMIT}
                sx={{
                  color: "#bc9a53",
                  border: "2px solid #bc9a53",
                  "&:hover": {
                    backgroundColor: "rgba(188, 154, 83, 0.1)",
                  },
                  "&.Mui-disabled": {
                    borderColor: "rgba(188, 154, 83, 0.3)",
                    color: "rgba(188, 154, 83, 0.3)",
                  },
                }}
              >
                <IconMinus size={24} />
              </IconButton>
              <Typography
                sx={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#bc9a53",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {upperLimit}
              </Typography>
              <IconButton
                onClick={handleIncrement}
                disabled={upperLimit >= MAX_LIMIT}
                sx={{
                  color: "#bc9a53",
                  border: "2px solid #bc9a53",
                  "&:hover": {
                    backgroundColor: "rgba(188, 154, 83, 0.1)",
                  },
                  "&.Mui-disabled": {
                    borderColor: "rgba(188, 154, 83, 0.3)",
                    color: "rgba(188, 154, 83, 0.3)",
                  },
                }}
              >
                <IconPlus size={24} />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleClose}
              variant="contained"
              sx={{
                backgroundColor: "#bc9a53",
                color: "#000",
                "&:hover": {
                  backgroundColor: "#a6894a",
                },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
