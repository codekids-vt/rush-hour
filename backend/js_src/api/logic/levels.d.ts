import { Car, RushHourLevel } from "@shared/types";
export declare function getAllNonCustomLevels(userID: number): Promise<RushHourLevel[]>;
export declare function getLevelWithID(id: number, userID: number): Promise<RushHourLevel>;
export declare function createLevelsWithID(levels: RushHourLevel[]): Promise<RushHourLevel[]>;
export declare function createLevelWithID(name: string, isCustom: boolean, startingPositions: Car[]): Promise<number>;
export declare function markLevelCompleted(userID: number, levelID: number): Promise<Boolean>;
