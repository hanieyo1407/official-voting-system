import { Router } from "express";
import {
  getElectionStatus,
  startElection,
  pauseElection,
  completeElection,
  cancelElection,
  updateElectionSettings,
  getElectionHistory,
  getAllPositionsWithCandidates
} from "../controllers/election.controller";
import { verifyAdminToken, requireSuperAdmin, requireAdminOrSuperAdmin } from "../middleware/admin.middleware";

/**
 * @swagger
 * tags:
 *   - name: Election Management
 *     description: Election lifecycle management endpoints
 *   - name: Positions & Candidates
 *     description: Endpoints for fetching all positions and candidates
 */

const electionRoute = Router();

/**
 * @swagger
 * /api/election/status:
 *   get:
 *     summary: Get current election status
 *     tags: [Election Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Election status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 electionStatus:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [not_started, active, paused, completed, cancelled]
 *                       example: "active"
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2025-10-20T18:00:00Z"
 *                     pausedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     cancelledAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     settings:
 *                       type: object
 *                       properties:
 *                         allowVoting:
 *                           type: boolean
 *                           example: true
 *                         showResults:
 *                           type: boolean
 *                           example: false
 *                         requireVerification:
 *                           type: boolean
 *                           example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-20T17:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-20T18:00:00Z"
 *       401:
 *         description: Unauthorized - Admin authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Insufficient permissions"
 *       500:
 *         description: Internal server error
 */

// Admin election routes (require authentication)
electionRoute.get("/status", verifyAdminToken, requireAdminOrSuperAdmin, getElectionStatus);

/**
 * @swagger
 * /api/election/history:
 *   get:
 *     summary: Get election history
 *     tags: [Election Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Election history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 electionHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       status:
 *                         type: string
 *                         enum: [not_started, active, paused, completed, cancelled]
 *                         example: "completed"
 *                       startedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-10-20T18:00:00Z"
 *                       pausedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-10-20T20:00:00Z"
 *                       cancelledAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       settings:
 *                         type: object
 *                         properties:
 *                           allowVoting:
 *                             type: boolean
 *                           showResults:
 *                             type: boolean
 *                           requireVerification:
 *                             type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-20T17:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-20T20:00:00Z"
 *       401:
 *         description: Unauthorized - Admin authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Insufficient permissions"
 *       500:
 *         description: Internal server error
 */
electionRoute.get("/history", verifyAdminToken, requireAdminOrSuperAdmin, getElectionHistory);


// --- NEW ROUTE FOR POSITIONS AND CANDIDATES (PUBLIC) ---

/**
 * @swagger
 * /api/election/positions:
 *   get:
 *     summary: Get all positions with their candidates
 *     tags: [Positions & Candidates]
 *     description: Retrieves the list of all active positions and the candidates for each.
 *     responses:
 *       200:
 *         description: List of positions and candidates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 positions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       positionName:
 *                         type: string
 *                       candidates:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id: {type: 'integer'}
 *                             name: {type: 'string'}
 *                             positionId: {type: 'integer'}
 *                             imageUrl: {type: 'string'}
 *                             manifesto: {type: 'string'}
 *       500:
 *         description: Internal server error
 */
// NOTE: This endpoint is intentionally public so voters and public pages can fetch positions/candidates.
electionRoute.get("/positions", getAllPositionsWithCandidates);


/**
 * @swagger
 * /api/election/start:
 *   post:
 *     summary: Start the election
 *     tags: [Election Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Election started successfully
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Only super admins can start elections
 *       500:
 *         description: Internal server error
 */

// Super admin only election routes
electionRoute.post("/start", verifyAdminToken, requireSuperAdmin, startElection);

/**
 * @swagger
 * /api/election/pause:
 *   post:
 *     summary: Pause the election
 *     tags: [Election Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Election paused successfully
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Only super admins can pause elections
 *       500:
 *         description: Internal server error
 */
electionRoute.post("/pause", verifyAdminToken, requireSuperAdmin, pauseElection);

/**
 * @swagger
 * /api/election/complete:
 *   post:
 *     summary: Complete the election
 *     tags: [Election Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Election completed successfully
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Only super admins can complete elections
 *       500:
 *         description: Internal server error
 */
electionRoute.post("/complete", verifyAdminToken, requireSuperAdmin, completeElection);

/**
 * @swagger
 * /api/election/cancel:
 *   post:
 *     summary: Cancel the election
 *     tags: [Election Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Election cancelled successfully
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Only super admins can cancel elections
 *       500:
 *         description: Internal server error
 */
electionRoute.post("/cancel", verifyAdminToken, requireSuperAdmin, cancelElection);

/**
 * @swagger
 * /api/election/settings:
 *   put:
 *     summary: Update election settings
 *     tags: [Election Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allowVoting:
 *                 type: boolean
 *               showResults:
 *                 type: boolean
 *               requireVerification:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Election settings updated successfully
 *       400:
 *         description: No valid settings provided
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Only super admins can update election settings
 *       500:
 *         description: Internal server error
 */
electionRoute.put("/settings", verifyAdminToken, requireSuperAdmin, updateElectionSettings);

export default electionRoute;
