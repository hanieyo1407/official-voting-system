import { Router } from "express";
import {
  getRunoffElections,
  getRunoffElection,
  startRunoffElection,
  castRunoffVote,
  completeRunoffElection,
  detectAndCreateRunoffs
} from "../controllers/runoff.controller";
import { verifyAdminToken, requireSuperAdmin, requireAdminOrSuperAdmin } from "../middleware/admin.middleware";
import { verifyToken } from "../middleware/auth.middleware";

/**
 * @swagger
 * tags:
 *   - name: Runoff Elections
 *     description: Runoff election management endpoints
 */

const runoffRoute = Router();

/**
 * @swagger
 * /api/runoff/vote:
 *   post:
 *     summary: Cast a runoff election vote
 *     tags: [Runoff Elections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - runoffElectionId
 *               - candidateId
 *             properties:
 *               runoffElectionId:
 *                 type: integer
 *                 description: The ID of the runoff election
 *                 example: 1
 *               candidateId:
 *                 type: integer
 *                 description: The ID of the candidate to vote for
 *                 example: 5
 *     responses:
 *       201:
 *         description: Vote cast successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Runoff vote cast successfully"
 *                 runoffVote:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     runoffElectionId:
 *                       type: integer
 *                       example: 1
 *                     candidateId:
 *                       type: integer
 *                       example: 5
 *                     verificationCode:
 *                       type: string
 *                       example: "RNF-2025-001-ABC123"
 *                     votedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-20T19:30:00Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Runoff election ID and candidate ID are required"
 *       401:
 *         description: User authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User authentication required"
 *       409:
 *         description: User has already voted in this runoff election
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User has already voted in this runoff election"
 *       500:
 *         description: Internal server error
 */

// Public runoff routes (for voting)
runoffRoute.post("/vote", verifyToken, castRunoffVote);

/**
 * @swagger
 * /api/runoff:
 *   get:
 *     summary: Get all runoff elections
 *     tags: [Runoff Elections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of runoff elections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 runoffElections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       originalPositionId:
 *                         type: integer
 *                         example: 2
 *                       originalPositionName:
 *                         type: string
 *                         example: "President"
 *                       tiedCandidates:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, active, completed, cancelled]
 *                         example: "active"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-20T18:00:00Z"
 *                       startedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-10-20T19:00:00Z"
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       winnerCandidateId:
 *                         type: integer
 *                         nullable: true
 *                         example: 5
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

// Admin runoff routes (require authentication)
runoffRoute.get("/", verifyAdminToken, requireAdminOrSuperAdmin, getRunoffElections);

/**
 * @swagger
 * /api/runoff/{runoffId}:
 *   get:
 *     summary: Get a specific runoff election by ID
 *     tags: [Runoff Elections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runoffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the runoff election
 *         example: 1
 *     responses:
 *       200:
 *         description: Runoff election retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 runoffElection:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     originalPositionId:
 *                       type: integer
 *                       example: 2
 *                     originalPositionName:
 *                       type: string
 *                       example: "President"
 *                     tiedCandidates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, active, completed, cancelled]
 *                       example: "active"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-20T18:00:00Z"
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2025-10-20T19:00:00Z"
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     winnerCandidateId:
 *                       type: integer
 *                       nullable: true
 *                       example: 5
 *                     candidates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           positionId:
 *                             type: integer
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           candidateId:
 *                             type: integer
 *                           voteCount:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *                             format: float
 *       400:
 *         description: Runoff election ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Runoff election ID is required"
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
 *       404:
 *         description: Runoff election not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Runoff election not found"
 *       500:
 *         description: Internal server error
 */
runoffRoute.get("/:runoffId", verifyAdminToken, requireAdminOrSuperAdmin, getRunoffElection);

/**
 * @swagger
 * /api/runoff/detect:
 *   post:
 *     summary: Detect ties and create runoff elections
 *     tags: [Runoff Elections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Runoff elections created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "2 runoff election(s) created"
 *                 runoffElections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       originalPositionName:
 *                         type: string
 *                         example: "President"
 *                       tiedCandidates:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, active, completed, cancelled]
 *                         example: "pending"
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
 *         description: Only super admins can detect and create runoff elections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Only super admins can detect and create runoff elections"
 *       500:
 *         description: Internal server error
 */

// Super admin only runoff routes
runoffRoute.post("/detect", verifyAdminToken, requireSuperAdmin, detectAndCreateRunoffs);

/**
 * @swagger
 * /api/runoff/{runoffId}/start:
 *   post:
 *     summary: Start a runoff election
 *     tags: [Runoff Elections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runoffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the runoff election to start
 *         example: 1
 *     responses:
 *       200:
 *         description: Runoff election started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Runoff election started successfully"
 *                 runoffElection:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     originalPositionName:
 *                       type: string
 *                       example: "President"
 *                     tiedCandidates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, active, completed, cancelled]
 *                       example: "active"
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-20T19:00:00Z"
 *       400:
 *         description: Runoff election ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Runoff election ID is required"
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
 *         description: Only super admins can start runoff elections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Only super admins can start runoff elections"
 *       404:
 *         description: Runoff election not found or already started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Runoff election not found or already started"
 *       500:
 *         description: Internal server error
 */
runoffRoute.post("/:runoffId/start", verifyAdminToken, requireSuperAdmin, startRunoffElection);

/**
 * @swagger
 * /api/runoff/{runoffId}/complete:
 *   post:
 *     summary: Complete a runoff election
 *     tags: [Runoff Elections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runoffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the runoff election to complete
 *         example: 1
 *     responses:
 *       200:
 *         description: Runoff election completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Runoff election completed successfully"
 *                 runoffElection:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     originalPositionName:
 *                       type: string
 *                       example: "President"
 *                     winnerCandidateId:
 *                       type: integer
 *                       example: 5
 *                     status:
 *                       type: string
 *                       enum: [pending, active, completed, cancelled]
 *                       example: "completed"
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-20T20:00:00Z"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       candidateId:
 *                         type: integer
 *                       voteCount:
 *                         type: integer
 *                       percentage:
 *                         type: number
 *                         format: float
 *       400:
 *         description: Runoff election ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Runoff election ID is required"
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
 *         description: Only super admins can complete runoff elections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Only super admins can complete runoff elections"
 *       404:
 *         description: Runoff election not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Runoff election not found"
 *       500:
 *         description: Internal server error
 */
runoffRoute.post("/:runoffId/complete", verifyAdminToken, requireSuperAdmin, completeRunoffElection);

export default runoffRoute;