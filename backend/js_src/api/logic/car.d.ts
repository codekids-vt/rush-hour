import { Car, RushHourLevel } from "@shared/types";
export declare function getLevelWithID(id: number): Promise<RushHourLevel>;
export declare function createLevelsWithID(levels: RushHourLevel[]): Promise<RushHourLevel[]>;
export declare function createLevelWithID(name: string, isCustom: boolean, startingPositions: Car[]): Promise<number>;
