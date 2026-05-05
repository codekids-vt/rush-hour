import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { findUserById } from "../logic/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = req.headers.authorization;
  //console.log("Incoming token", auth);

  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    (req as any).user = {
      id: user.id,
      username: user.username,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
