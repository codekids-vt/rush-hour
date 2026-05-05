import { Request, Response } from "express";
export declare const getAllGameLevels: (req: Request, res: Response) => Promise<void>;
export declare const getLevel: (req: Request, res: Response) => Promise<void>;
export declare const addLevel: (req: Request, res: Response) => Promise<void>;
export declare const markComplete: (req: Request, res: Response) => Promise<void>;
