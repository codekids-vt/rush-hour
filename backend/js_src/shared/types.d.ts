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
export declare enum carColors {
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
    green = "emerald"
}
export declare enum gameState {
    attemptingLevel = 0,
    levelComplete = 1,
    settingCustomLevel = 2,
    selectingLevel = 3,
    settingLevelUp = 4
}
export type stateId = string;
export type stateIdPair = string;
export declare const cellWidth = 63.333;
export declare const redCarID = 5;
export type AuthUser = {
    id: number;
    username: string;
};
export type AuthState = {
    user: AuthUser | null;
    token: string | null;
};
export declare function loadAuthState(): AuthState;
export declare function saveAuthState(state: AuthState): void;
export declare function clearAuthState(): void;
