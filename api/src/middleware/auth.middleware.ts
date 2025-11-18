import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prefer cookie for browser-based auth; allow Authorization header as fallback
    const tokenFromCookie = (req as any).cookies?.token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    const token = tokenFromCookie || tokenFromHeader;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: token missing" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const payload = jwt.verify(token, secret);
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
