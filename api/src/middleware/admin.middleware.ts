// api/src/middleware/admin.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AdminService from "../services/admin.service";
import { LoggingService } from "../services/logging.service";

interface JwtPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  type: string;
  iat: number;
  exp: number;
}

export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      LoggingService.logSecurity('ADMIN_ACCESS_DENIED', { reason: 'no_token' });
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (decoded.type !== 'admin') {
      LoggingService.logSecurity('ADMIN_ACCESS_DENIED', { reason: 'invalid_token_type', userId: decoded.id });
      return res.status(401).json({ error: "Invalid admin token" });
    }

    const admin = await AdminService.getAdminById(decoded.id);

    if (!admin || !admin.isActive) {
      LoggingService.logSecurity('ADMIN_ACCESS_DENIED', {
        reason: 'admin_not_found_or_inactive',
        adminId: decoded.id
      });
      return res.status(401).json({ error: "Admin account not found or inactive" });
    }

    // Attach admin info to request object
    (req as any).admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      LoggingService.logSecurity('ADMIN_ACCESS_DENIED', { reason: 'token_expired' });
      return res.status(401).json({ error: "Admin token expired" });
    } else if (error.name === 'JsonWebTokenError') {
      LoggingService.logSecurity('ADMIN_ACCESS_DENIED', { reason: 'invalid_token' });
      return res.status(401).json({ error: "Invalid admin token" });
    } else {
      LoggingService.logError(error, { context: 'verifyAdminToken' });
      return res.status(500).json({ error: "Authentication error" });
    }
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = (req as any).admin;

      if (!admin) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      if (!allowedRoles.includes(admin.role)) {
        LoggingService.logSecurity('ADMIN_ACCESS_DENIED', {
          reason: 'insufficient_role',
          userRole: admin.role,
          requiredRoles: allowedRoles,
          adminId: admin.id
        });
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    } catch (error: any) {
      LoggingService.logError(error, { context: 'requireRole' });
      return res.status(500).json({ error: "Authorization error" });
    }
  };
};

export const requireSuperAdmin = requireRole(['super_admin']);

// CRITICAL FIX: Expanded list to include 'moderator' for general view/stats access
export const requireAdminOrSuperAdmin = requireRole(['moderator', 'admin', 'super_admin']); 

// NOTE: No need to define requireModeratorOrAbove since requireAdminOrSuperAdmin now covers it.