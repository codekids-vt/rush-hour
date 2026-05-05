// api/controllers/authController.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { createUser, findUserByUsername } from "../logic/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Helper to generate JWT
function generateToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/register
export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Missing username or password" });

    const existing = await findUserByUsername(username);
    if (existing)
      return res.status(409).json({ error: "Username already taken" });

    const user = await createUser(username, password);

    if (!user || !user.id) {
      return res.status(409).json({ error: "Error while creating user" });
    }

    const token = generateToken(user.id);
    //console.log("Login token:", token);

    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: err?.message ?? "unknown error" });
    } else {
      res.status(500).json({ error: "unknown error" });
    }
  }
}

// POST /api/login
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Missing username or password" });

    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user.id);
    //console.log("Login token:", token);

    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: err?.message ?? "unknown error" });
    } else {
      res.status(500).json({ error: "unknown error" });
    }
  }
}

// GET /api/me (protected)
export function me(req: Request, res: Response) {
  const user = (req as any).user;
  res.json(user);
}
