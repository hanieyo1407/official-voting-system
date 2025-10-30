// api/src/controllers/admin.controller.ts

import { Request, Response } from "express";
import AdminService from "../services/admin.service";
import { LoggingService } from "../services/logging.service";
import cloudinary from '../config/cloudinary.config'; 

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long"
      });
    }

    const admin = await AdminService.createAdminUser(username, email, password, role);

    return res.status(201).json({
      message: "Admin user created successfully",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'createAdmin' });
    return res.status(500).json({ error: err.message || "Failed to create admin user" });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    // Debug logging
    console.log('=== ADMIN LOGIN DEBUG ===');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Full request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw req.body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'undefined');

    // Handle case where body might be undefined
    if (!req.body) {
      console.error('req.body is completely undefined!');
      return res.status(400).json({
        error: "Request body is missing. Make sure Content-Type is application/json",
        debug: {
          headers: req.headers,
          bodyType: typeof req.body,
          hasBody: !!req.body
        }
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        receivedBody: req.body
      });
    }

    const result = await AdminService.authenticateAdmin(email, password);

    if (!result) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { token, admin } = result;

    // Set HTTP-only cookie for admin token
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
    });

    return res.status(200).json({
      message: "Admin login successful",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'loginAdmin' });
    return res.status(500).json({ error: err.message || "Login failed" });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).admin?.id;

    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    if (adminId) {
      LoggingService.logAuth(adminId.toString(), 'ADMIN_LOGOUT');
    }

    return res.status(200).json({ message: "Admin logout successful" });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'logoutAdmin' });
    return res.status(500).json({ error: "Logout failed" });
  }
};

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).admin?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = await AdminService.getAdminById(adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    return res.status(200).json({ admin });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getAdminProfile' });
    return res.status(500).json({ error: "Failed to fetch admin profile" });
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // FIXED: Allow 'moderator' to view all admins
    if (!['super_admin', 'admin', 'moderator'].includes(requestingAdmin.role)) { 
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const admins = await AdminService.getAllAdmins();

    return res.status(200).json({
      admins: admins.map(admin => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }))
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getAllAdmins' });
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
};

export const updateAdminRole = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { adminId } = req.params;
    const { role } = req.body;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can update roles" });
    }

    if (!adminId || !role) {
      return res.status(400).json({ error: "Admin ID and role are required" });
    }

    const validRoles = ['super_admin', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const updatedAdmin = await AdminService.updateAdminRole(
      parseInt(adminId),
      role,
      requestingAdmin.id
    );

    return res.status(200).json({
      message: "Admin role updated successfully",
      admin: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'updateAdminRole' });
    return res.status(500).json({ error: err.message || "Failed to update admin role" });
  }
};

export const deactivateAdmin = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { adminId } = req.params;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    // Prevent self-deactivation
    if (parseInt(adminId) === requestingAdmin.id) {
      return res.status(400).json({ error: "Cannot deactivate your own account" });
    }

    await AdminService.deactivateAdmin(parseInt(adminId), requestingAdmin.id);

    return res.status(200).json({ message: "Admin deactivated successfully" });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'deactivateAdmin' });
    return res.status(500).json({ error: err.message || "Failed to deactivate admin" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).admin?.id;
    const { currentPassword, newPassword } = req.body;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters long"
      });
    }

    await AdminService.changePassword(adminId, currentPassword, newPassword);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'changePassword' });
    return res.status(500).json({ error: err.message || "Failed to change password" });
  }
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // FIXED: Allow 'moderator' to view stats
    if (!['super_admin', 'admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const stats = await AdminService.getAdminStats();

    return res.status(200).json({ stats });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getAdminStats' });
    return res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
};

// ADDED: Function to generate a secure signature for direct client upload (Cloudinary)
export const signUpload = async (req: Request, res: Response) => {
    try {
        const requestingAdmin = (req as any).admin;
        const { public_id } = req.body; 
        
        if (!requestingAdmin || !['admin', 'super_admin'].includes(requestingAdmin.role)) {
            return res.status(403).json({ error: "Insufficient permissions to sign upload" });
        }
        
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        const params: any = {
            timestamp: timestamp,
            folder: 'sjbu-voting-candidates', // Recommended folder for organization
            // Use existing public_id for updating an image
            ...(public_id && { public_id: public_id, overwrite: true }) 
        };

        const signature = cloudinary.utils.api_sign_request(
            params,
            cloudinary.config().api_secret as string // Sign the request with the secret
        );

        LoggingService.logAdminAction(requestingAdmin.id, 'GENERATE_UPLOAD_SIGNATURE', 'candidate_image', { public_id: public_id || 'new' });

        return res.status(200).json({
            signature: signature,
            timestamp: timestamp,
            cloud_name: cloudinary.config().cloud_name,
            api_key: cloudinary.config().api_key,
            public_id: public_id,
            folder: params.folder
        });

    } catch (err: any) {
        LoggingService.logError(err, { context: 'signUpload' });
        return res.status(500).json({ error: "Failed to generate upload signature" });
    }
};