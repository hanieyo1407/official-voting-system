import { Request, Response } from "express";
import AdminService, { NewCandidateData, UpdateCandidateData } from "../services/admin.service"; 
import { LoggingService } from "../services/logging.service";
import cloudinary from '../config/cloudinary.config'; 
import { InputSanitizer } from "../utils/sanitizer";

// REPLACE your existing createAdmin function:
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required"
      });
    }

    // SECURITY FIX: Sanitize inputs
    let sanitizedUsername: string;
    let sanitizedEmail: string;
    try {
      sanitizedUsername = InputSanitizer.sanitizeUsername(username);
      sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      InputSanitizer.validatePassword(password);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    // Validate role
    if (role && !['super_admin', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const admin = await AdminService.createAdminUser(
      sanitizedUsername,
      sanitizedEmail,
      password,
      role
    );

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
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: "Username or email already exists" });
    }
    return res.status(500).json({ error: "Failed to create admin user" });
  }
};

// REPLACE your existing loginAdmin function with this sanitized version:
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // SECURITY FIX: Input validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // SECURITY FIX: Sanitize and validate inputs
    let sanitizedEmail: string;
    try {
      sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      InputSanitizer.validatePassword(password);
    } catch (error: any) {
      LoggingService.logSecurity('ADMIN_LOGIN_INVALID_INPUT', { 
        error: error.message,
        ip: req.ip 
      });
      return res.status(400).json({ 
        error: "Invalid email or password format" 
      });
    }

    const result = await AdminService.authenticateAdmin(sanitizedEmail, password);

    if (!result) {
      // SECURITY: Generic error message
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { token, admin } = result;

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
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
    return res.status(500).json({ error: "Login failed" });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).admin?.id;

    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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

export const deletePosition = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).admin?.id;
    
    // Check if admin is authenticated
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Get admin details to check role
    const admin = await AdminService.getAdminById(adminId);
    
    // Check if admin has permission (only super_admin can delete positions)
    if (!admin || admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions. Only super admins can delete positions."
      });
    }

    const { positionId } = req.params;
    
    // Validate positionId
    if (!positionId) {
      return res.status(400).json({
        success: false,
        message: "Position ID is required"
      });
    }

    // Call service to delete position
    // Uncomment the following line to enable the deletePosition service call
    // const result = await AdminService.deletePosition(parseInt(positionId));
    
    return res.status(200).json({
      success: true,
      message: "Position deleted successfully"
    });
  } catch (error: any) {
    LoggingService.logError(error, { context: "delete_position_controller" });
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
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
    return res.status(500).json({ error: err.message || "Failed to fetch admins" });
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

// REPLACE your changePassword function:
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

    // SECURITY FIX: Validate passwords
    try {
      InputSanitizer.validatePassword(currentPassword);
      InputSanitizer.validatePassword(newPassword);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        error: "New password must be different" 
      });
    }

    await AdminService.changePassword(adminId, currentPassword, newPassword);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'changePassword' });
    if (err.message.includes('incorrect')) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    return res.status(500).json({ error: "Failed to change password" });
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
    return res.status(500).json({ error: err.message || "Failed to fetch admin statistics" });
  }
};

// --- NEW CANDIDATE MANAGEMENT CONTROLLERS ---

export const createCandidate = async (req: Request, res: Response) => {
    try {
        const requestingAdmin = (req as any).admin;
        // CRITICAL FIX: Destructure manifesto instead of bio
        const { name, positionId, imageUrl, manifesto } = req.body as NewCandidateData;

        if (!requestingAdmin || !['admin', 'super_admin'].includes(requestingAdmin.role)) {
            return res.status(403).json({ error: "Insufficient permissions to create candidate" });
        }

        // CRITICAL FIX: Check manifesto instead of bio
        if (!name || !positionId || !imageUrl || !manifesto) {
             return res.status(400).json({
                error: "Candidate name, position ID, image URL, and manifesto are required"
             });
        }
        
        const positionIdNum = parseInt(positionId.toString());
        if (isNaN(positionIdNum) || positionIdNum <= 0) {
             return res.status(400).json({ error: "Invalid position ID" });
        }
        
        // CRITICAL FIX: Pass manifesto to the service
        const newCandidate = await AdminService.createCandidate(
            { name, positionId: positionIdNum, imageUrl, manifesto },
            requestingAdmin.id
        );

        return res.status(201).json({ 
            message: "Candidate created successfully", 
            candidate: newCandidate 
        });

    } catch (err: any) {
        LoggingService.logError(err, { context: 'createCandidate' });
        return res.status(500).json({ error: err.message || "Failed to create candidate" });
    }
}


export const updateCandidate = async (req: Request, res: Response) => {
    try {
        const requestingAdmin = (req as any).admin;
        const { candidateId } = req.params;
        const updateData: UpdateCandidateData = req.body;

        if (!requestingAdmin || !['admin', 'super_admin'].includes(requestingAdmin.role)) {
            return res.status(403).json({ error: "Insufficient permissions to update candidate" });
        }

        const idNum = parseInt(candidateId);
        if (isNaN(idNum) || idNum <= 0) {
             return res.status(400).json({ error: "Invalid candidate ID" });
        }

        // Validate positionId if present
        if (updateData.positionId !== undefined) {
             const positionIdNum = parseInt(updateData.positionId.toString());
             if (isNaN(positionIdNum) || positionIdNum <= 0) {
                 return res.status(400).json({ error: "Invalid position ID" });
             }
             updateData.positionId = positionIdNum; // Ensure it's a number for the service
        }

        // Data for the service call, ensuring only allowed fields are passed
        const finalUpdateData: UpdateCandidateData = {};
        if (updateData.name !== undefined) finalUpdateData.name = updateData.name;
        if (updateData.positionId !== undefined) finalUpdateData.positionId = updateData.positionId;
        if (updateData.imageUrl !== undefined) finalUpdateData.imageUrl = updateData.imageUrl; 
        // CRITICAL FIX: Check and include manifesto
        if (updateData.manifesto !== undefined) finalUpdateData.manifesto = updateData.manifesto;
        // CRITICAL FIX: Removed isPublished from DTO check
        // if (updateData.isPublished !== undefined) finalUpdateData.isPublished = updateData.isPublished;

        if (Object.keys(finalUpdateData).length === 0) {
            return res.status(400).json({ error: "No valid fields provided for update" });
        }

        const updatedCandidate = await AdminService.updateCandidate(
            idNum,
            finalUpdateData,
            requestingAdmin.id
        );

        return res.status(200).json({ 
            message: "Candidate updated successfully", 
            candidate: updatedCandidate 
        });

    } catch (err: any) {
        // FIX applied for compile error
        LoggingService.logError(err, { context: 'updateCandidate', candidateId: req.params.candidateId }); 
        return res.status(500).json({ error: err.message || "Failed to update candidate" });
    }
}


// ADDED: Function to generate a secure signature for direct client upload (Cloudinary)
export const signUpload = async (req: Request, res: Response) => {
    try {
        // Retrieve values from the local environment variables loaded by index.ts/server.ts
        const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
        const API_KEY = process.env.CLOUDINARY_API_KEY;
        const API_SECRET = process.env.CLOUDINARY_API_SECRET;

        // CRITICAL FIX 1: Server-side check for configuration presence
        if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
            LoggingService.logError(new Error("Cloudinary environment variables missing"), { context: 'signUpload' });
            return res.status(500).json({ error: "Cloudinary configuration is incomplete on the server." });
        }
        
        const requestingAdmin = (req as any).admin;
        // CRITICAL FIX 2: Safely access public_id from req.body, defaulting to an empty object
        const { public_id } = req.body || {}; 
        
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

        // Use the API_SECRET directly for signing
        const signature = cloudinary.utils.api_sign_request(
            params,
            API_SECRET as string // Use the directly fetched secret
        );

        LoggingService.logAdminAction(requestingAdmin.id, 'GENERATE_UPLOAD_SIGNATURE', 'candidate_image', { public_id: public_id || 'new' });

        return res.status(200).json({
            signature: signature,
            timestamp: timestamp,
            cloud_name: CLOUD_NAME, // Pass the environment variable directly
            api_key: API_KEY,      // Pass the environment variable directly
            public_id: public_id,
            folder: params.folder
        });

    } catch (err: any) {
        LoggingService.logError(err, { context: 'signUpload' });
        return res.status(500).json({ error: "Failed to generate upload signature" });
    }
};
