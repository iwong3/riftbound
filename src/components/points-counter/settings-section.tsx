import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";
import { GOLD_COLOR } from "./constants";

type SettingsSectionProps = {
  children: ReactNode;
  showBottomBorder?: boolean;
};

export const SettingsSection = ({
  children,
  showBottomBorder = true,
}: SettingsSectionProps) => {
  return (
    <Box
      sx={{
        ...(showBottomBorder && { borderBottom: `3px double ${GOLD_COLOR}` }),
        paddingBottom: showBottomBorder ? 2 : 0,
      }}
    >
      {children}
    </Box>
  );
};

type SettingsSectionTitleProps = {
  title: string;
  marginBottom?: number;
};

export const SettingsSectionTitle = ({
  title,
  marginBottom = 1,
}: SettingsSectionTitleProps) => {
  return (
    <Typography
      sx={{
        marginBottom: marginBottom ? marginBottom : 1,
        fontWeight: "bold",
        color: GOLD_COLOR,
      }}
    >
      {title}
    </Typography>
  );
};
