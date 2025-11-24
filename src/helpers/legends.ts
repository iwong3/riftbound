// Legend icon imports
import AhriIcon from "../images/ahri-icon.jpg";
import AnnieIcon from "../images/annie-icon.jpg";
import DariusIcon from "../images/darius-icon.jpg";
import GarenIcon from "../images/garen-icon.jpg";
import JinxIcon from "../images/jinx-icon.jpg";
import KaisaIcon from "../images/kaisa-icon.jpg";
import LeeSinIcon from "../images/lee-sin-icon.jpg";
import LeonaIcon from "../images/leona-icon.jpg";
import LuxIcon from "../images/lux-icon.jpg";
import MasterYiIcon from "../images/master-yi-icon.jpg";
import MissFortuneIcon from "../images/miss-fortune-icon.jpg";
import SettIcon from "../images/sett-icon.jpg";
import TeemoIcon from "../images/teemo-icon.jpg";
import ViktorIcon from "../images/viktor-icon.jpg";
import VolibearIcon from "../images/volibear-icon.png";
import YasuoIcon from "../images/yasuo-icon.jpg";

// Legend name constants
export const LEGEND_NAMES = {
  AHRI: "ahri",
  ANNIE: "annie",
  DARIUS: "darius",
  GAREN: "garen",
  JINX: "jinx",
  KAISA: "kaisa",
  LEE_SIN: "lee-sin",
  LEONA: "leona",
  LUX: "lux",
  MASTER_YI: "master-yi",
  MISS_FORTUNE: "miss-fortune",
  SETT: "sett",
  TEEMO: "teemo",
  VIKTOR: "viktor",
  VOLIBEAR: "volibear",
  YASUO: "yasuo",
} as const;

export type LegendName =
  | "ahri"
  | "annie"
  | "darius"
  | "garen"
  | "jinx"
  | "kaisa"
  | "lee-sin"
  | "leona"
  | "lux"
  | "master-yi"
  | "miss-fortune"
  | "sett"
  | "teemo"
  | "viktor"
  | "volibear"
  | "yasuo"
  | null;

export interface Legend {
  name: Exclude<LegendName, null>;
  icon: string;
  displayName: string;
}

// Map of available legends (excluding null) - alphabetized by display name
export const AVAILABLE_LEGENDS: Record<Exclude<LegendName, null>, Legend> = {
  ahri: {
    name: "ahri",
    icon: AhriIcon,
    displayName: "Ahri",
  },
  annie: {
    name: "annie",
    icon: AnnieIcon,
    displayName: "Annie",
  },
  darius: {
    name: "darius",
    icon: DariusIcon,
    displayName: "Darius",
  },
  garen: {
    name: "garen",
    icon: GarenIcon,
    displayName: "Garen",
  },
  jinx: {
    name: "jinx",
    icon: JinxIcon,
    displayName: "Jinx",
  },
  kaisa: {
    name: "kaisa",
    icon: KaisaIcon,
    displayName: "Kai'Sa",
  },
  "lee-sin": {
    name: "lee-sin",
    icon: LeeSinIcon,
    displayName: "Lee Sin",
  },
  leona: {
    name: "leona",
    icon: LeonaIcon,
    displayName: "Leona",
  },
  lux: {
    name: "lux",
    icon: LuxIcon,
    displayName: "Lux",
  },
  "master-yi": {
    name: "master-yi",
    icon: MasterYiIcon,
    displayName: "Master Yi",
  },
  "miss-fortune": {
    name: "miss-fortune",
    icon: MissFortuneIcon,
    displayName: "Miss Fortune",
  },
  sett: {
    name: "sett",
    icon: SettIcon,
    displayName: "Sett",
  },
  teemo: {
    name: "teemo",
    icon: TeemoIcon,
    displayName: "Teemo",
  },
  viktor: {
    name: "viktor",
    icon: ViktorIcon,
    displayName: "Viktor",
  },
  volibear: {
    name: "volibear",
    icon: VolibearIcon,
    displayName: "Volibear",
  },
  yasuo: {
    name: "yasuo",
    icon: YasuoIcon,
    displayName: "Yasuo",
  },
};

// Get all available legend names (excluding null), alphabetized by display name
export const getAvailableLegendNames = (): Exclude<LegendName, null>[] => {
  return Object.values(AVAILABLE_LEGENDS)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((legend) => legend.name);
};

// Get legend icon by name
export const getLegendIcon = (legendName: LegendName | null): string => {
  if (!legendName) return "";
  return AVAILABLE_LEGENDS[legendName as Exclude<LegendName, null>]?.icon || "";
};

// Get legend display name
export const getLegendDisplayName = (legendName: LegendName | null): string => {
  if (!legendName) return "None";
  return AVAILABLE_LEGENDS[legendName as Exclude<LegendName, null>]?.displayName || "Unknown";
};

