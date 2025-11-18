import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * verifyToken middleware
 * Accepts token from cookie (req.cookies.token) OR Authorization: Bearer <token>.
 * Attaches minimal user info to req.user on success.
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieToken = (req as any).cookies?.token;
    const authHeader = (req.headers?.authorization as string) || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({ error: "Authentication token required" });
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, jwtSecret) as any;

    // Attach minimal user info to the request
    (req as any).user = {
      id: payload?.id ?? null,
      voucher: payload?.voucher ?? null,
      role: payload?.role ?? null,
    };

    // Optional: useful debug log while rolling out (remove/quiet in prod)
    console.log("verifyToken: auth via", cookieToken ? "cookie" : "bearer");

    next();
  } catch (err: any) {
    console.error("verifyToken error", err.message || err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * verifyAdminToken middleware
 * Similar to verifyToken but enforces admin role if present in token payload.
 */
export const verifyAdminToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieToken = (req as any).cookies?.admin_token || (req as any).cookies?.token;
    const authHeader = (req.headers?.authorization as string) || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, jwtSecret) as any;

    // Basic role enforcement if token contains role
    if (payload?.role && payload.role !== "admin" && payload.role !== "super_admin") {
      return res.status(403).json({ error: "Insufficient privileges" });
    }

    (req as any).user = {
      id: payload?.id ?? null,
      voucher: payload?.voucher ?? null,
      role: payload?.role ?? null,
    };

    console.log("verifyAdminToken: auth via", cookieToken ? "cookie" : "bearer");

    next();
  } catch (err: any) {
    console.error("verifyAdminToken error", err.message || err);
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
};
