import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) return res.status(401).json({ error: "Access denied" });

//   jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
//     if (err) return res.status(403).json({ error: "Invalid token" });
//     (req as any).user = user;
//     next();
//   });
// };


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // cookie-parser must be registered in server to populate req.cookies
    const tokenFromCookie = (req as any).cookies?.token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

    const token = tokenFromCookie || tokenFromHeader;
    if (!token) return res.status(401).json({ error: "Unauthorized: token missing" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Server configuration error" });

    const payload = jwt.verify(token, secret);
    // attach user info to request for downstream handlers
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
