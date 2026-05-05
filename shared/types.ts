export type Car = {
  x: number;
  y: number;
  vertical: boolean;
  length: number;
  color: string | carColors;
  carID?: number;
};

export type RushHourLevel = {
  levelID: number;
  levelName: string;
  isCustom: boolean;
  startingPositions: Car[];
  isComplete?: boolean;
};

export enum carColors {
  blue = "#154491",
  red = "#ff0000",
  yellow = "#bc8206",
  orange = "#b73601",

  darkGreen = "#05552e",
  lightGreen = "#33905d",
  olive = "#635e04",

  purple = "purple",
  pink = "pink",
  teal = "#39a080",
  cyan = "cyan",
  lime = "lime",
  amber = "amber",
  sky = "sky",
  green = "emerald",
}

export enum gameState {
  attemptingLevel,
  levelComplete,
  settingCustomLevel,
  selectingLevel,
  settingLevelUp,
}

export type stateId = string;
export type stateIdPair = string;

export const cellWidth = 63.333;
export const redCarID = 5;

// Auth and user login stuff
export type AuthUser = {
  id: number;
  username: string;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
};

const STORAGE_KEY = "rushHourAuth";

export function loadAuthState(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { user: null, token: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { user: null, token: null };
  }
}

export function saveAuthState(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState() {
  localStorage.removeItem(STORAGE_KEY);
}
