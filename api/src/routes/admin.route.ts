// api/src/routes/admin.route.ts

import { Router } from "express";
import {
  createAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getAllAdmins,
  updateAdminRole,
  deactivateAdmin,
  changePassword,
  getAdminStats,
  signUpload,
  createCandidate,
  updateCandidate,
  deletePosition
} from "../controllers/admin.controller";
import { verifyAdminToken, requireSuperAdmin, requireAdminOrSuperAdmin } from "../middleware/admin.middleware";
import { adminRateLimit } from "../middleware/rateLimit.middleware"; // Assuming this rate limit middleware exists

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management endpoints (requires admin authentication)
 *   - name: FileUpload
 *     description: Secure endpoints for file uploads
 *   - name: Candidate
 *     description: Candidate management endpoints (requires admin/super_admin authentication)
 */


const adminRoute = Router();

// Public admin routes (no authentication required)
/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin login
 *     description: Authenticate admin user and receive admin JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *                 example: "admin@sjbu-voting.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin password
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin login successful"
 *                 admin:
 *                   $ref: '#/components/schemas/AdminUser'
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
adminRoute.post("/login", loginAdmin);

// Protected admin routes (authentication required)
/**
 * @swagger
 * /admin/logout:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin logout
 *     description: Clear admin authentication cookie
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */
adminRoute.post("/logout", verifyAdminToken, logoutAdmin);

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin profile
 *     description: Retrieve current admin user profile
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin:
 *                   $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
adminRoute.get("/profile", verifyAdminToken, getAdminProfile);

/**
 * @swagger
 * /admin/change-password:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Change admin password
 *     description: Update admin account password
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (min 8 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Missing passwords or new password too short
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
adminRoute.post("/change-password", verifyAdminToken, changePassword);


// ADDED: Route for Cloudinary Signature Generation
/**
 * @swagger
 * /admin/sign-upload:
 *   post:
 *     tags:
 *       - FileUpload
 *     summary: Generate Cloudinary upload signature
 *     description: Returns a secure signature for direct client-side image upload (Admin/Super Admin only).
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               public_id:
 *                 type: string
 *                 description: Optional existing public ID for overwriting an image.
 *     responses:
 *       200:
 *         description: Signature generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signature: {type: 'string'}
 *                 timestamp: {type: 'integer'}
 *                 cloud_name: {type: 'string'}
 *                 api_key: {type: 'string'}
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
adminRoute.post("/sign-upload", verifyAdminToken, requireAdminOrSuperAdmin, adminRateLimit, signUpload);

// --- NEW CANDIDATE MANAGEMENT ROUTES ---

/**
 * @swagger
 * /admin/candidate:
 *   post:
 *     tags:
 *       - Candidate
 *     summary: Create a new candidate
 *     description: Create a new candidate with a name, position, bio, and Cloudinary image URL (Admin/Super Admin only).
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - positionId
 *               - imageUrl
 *               - bio
 *             properties:
 *               name: {type: 'string', example: 'Candidate Name'}
 *               positionId: {type: 'integer', example: 1}
 *               imageUrl: {type: 'string', example: 'https://res.cloudinary.com/dmi/image/upload/v123456/candidate.jpg'}
 *               bio: {type: 'string', example: 'Short biography of the candidate.'}
 *     responses:
 *       201: {description: 'Candidate created successfully'}
 *       400: {description: 'Missing required fields or invalid data'}
 *       403: {description: 'Insufficient permissions'}
 */
adminRoute.post("/candidate", verifyAdminToken, requireAdminOrSuperAdmin, createCandidate);

/**
 * @swagger
 * /admin/candidate/{candidateId}:
 *   put:
 *     tags:
 *       - Candidate
 *     summary: Update an existing candidate
 *     description: Update an existing candidate's details, including a new image URL (Admin/Super Admin only).
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema: {type: 'integer'}
 *         description: The ID of the candidate to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: {type: 'string'}
 *               positionId: {type: 'integer'}
 *               imageUrl: {type: 'string', description: 'New Cloudinary URL'}
 *               bio: {type: 'string'}
 *               isPublished: {type: 'boolean'}
 *     responses:
 *       200: {description: 'Candidate updated successfully'}
 *       400: {description: 'Invalid candidate ID or no fields provided for update'}
 *       403: {description: 'Insufficient permissions'}
 *       404: {description: 'Candidate not found'}
 */
adminRoute.put("/candidate/:candidateId", verifyAdminToken, requireAdminOrSuperAdmin, updateCandidate);

// --- END NEW CANDIDATE MANAGEMENT ROUTES ---



// Super admin only routes
/**
 * @swagger
 * /admin/create:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new admin
 *     description: Create a new admin user (super admin only)
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Admin username
 *                 example: "newadmin"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *                 example: "newadmin@sjbu-voting.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin password (min 8 characters)
 *                 example: "securepassword123"
 *               role:
 *                 type: string
 *                 enum: [admin, moderator]
 *                 description: Admin role (defaults to admin)
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Missing required fields or password too short
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
adminRoute.post("/create", verifyAdminToken, requireSuperAdmin, createAdmin);

/**
 * @swagger
 * /admin/all:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all admins
 *     description: Retrieve list of all admin users (admin and super_admin only)
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: List of admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
adminRoute.get("/all", verifyAdminToken, requireAdminOrSuperAdmin, getAllAdmins);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin statistics
 *     description: Retrieve admin system statistics (admin and super_admin only)
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_admins:
 *                       type: integer
 *                     active_today:
 *                       type: integer
 *                     super_admins:
 *                       type: integer
 *                     admins:
 *                       type: integer
 *                     moderators:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
adminRoute.get("/stats", verifyAdminToken, requireAdminOrSuperAdmin, getAdminStats);

/**
 * @swagger
 * /admin/{adminId}/role:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update admin role
 *     description: Update an admin's role (super admin only)
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Admin user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, moderator]
 *                 description: New role for the admin
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role or missing admin ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
adminRoute.put("/:adminId/role", verifyAdminToken, requireSuperAdmin, updateAdminRole);

/**
 * @swagger
 * /admin/{adminId}/deactivate:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Deactivate admin
 *     description: Deactivate an admin account (super admin only)
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Admin user ID to deactivate
 *     responses:
 *       200:
 *         description: Admin deactivated successfully
 *       400:
 *         description: Missing admin ID or attempting self-deactivation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
adminRoute.delete("/:adminId/deactivate", verifyAdminToken, requireSuperAdmin, deactivateAdmin);

/**
 * @swagger
 * /admin/position/{positionId}:
 *   delete:
 *     summary: Delete a position
 *     description: Delete a position by ID (super admin only)
 *     tags: [Admin]
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Internal server error
 */
adminRoute.delete("/position/:positionId", verifyAdminToken, requireSuperAdmin, deletePosition);

export default adminRoute;