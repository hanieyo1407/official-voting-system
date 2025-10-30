// api/src/routes/audit.route.ts

import { Router } from "express";
import {
  auditSingleVote,
  auditAllVotes,
  detectFraud,
  getAuditLogs,
  getSuspiciousVotes
} from "../controllers/audit.controller";
import { verifyAdminToken, requireAdminOrSuperAdmin, requireSuperAdmin } from "../middleware/admin.middleware";

/**
 * @swagger
 * tags:
 *   - name: Audit
 *     description: Vote auditing and fraud detection endpoints (admin only)
 */

const auditRoute = Router();

// All audit routes require admin authentication
auditRoute.use(verifyAdminToken);

/**
 * @swagger
 * /audit/vote/{voteId}:
 *   get:
 *     tags:
 *       - Audit
 *     summary: Audit single vote
 *     description: Perform detailed audit on a specific vote to check for irregularities
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vote ID to audit
 *     responses:
 *       200:
 *         description: Vote audit completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VoteAuditResult'
 *       400:
 *         description: Missing vote ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
auditRoute.get("/vote/:voteId", requireAdminOrSuperAdmin, auditSingleVote);

/**
 * @swagger
 * /audit/full:
 *   post:
 *     tags:
 *       - Audit
 *     summary: Full system audit
 *     description: Perform comprehensive audit of all votes in the system (super admin only)
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Full audit completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuditReport'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (super admin required)
 *       500:
 *         description: Server error
 */
auditRoute.post("/full", requireSuperAdmin, auditAllVotes);

/**
 * @swagger
 * /audit/fraud-detection:
 *   get:
 *     tags:
 *       - Audit
 *     summary: Detect fraud patterns
 *     description: Analyze voting patterns to detect potential fraud or irregularities
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Fraud detection analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FraudDetectionResult'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
auditRoute.get("/fraud-detection", requireAdminOrSuperAdmin, detectFraud);

/**
 * @swagger
 * /audit/suspicious:
 *   get:
 *     tags:
 *       - Audit
 *     summary: Get suspicious votes
 *     description: Retrieve list of votes that may be suspicious based on risk scoring
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Risk score threshold for suspicious votes (0-100)
 *     responses:
 *       200:
 *         description: Suspicious votes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     suspiciousVotes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           voteId:
 *                             type: integer
 *                           voucher:
 *                             type: string
 *                           candidateName:
 *                             type: string
 *                           positionName:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           issues:
 *                             type: array
 *                             items:
 *                               type: string
 *                           riskScore:
 *                             type: number
 *                             format: float
 *                     totalCount:
 *                       type: integer
 *                     threshold:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
auditRoute.get("/suspicious", requireAdminOrSuperAdmin, getSuspiciousVotes);

/**
 * @swagger
 * /audit/logs:
 *   get:
 *     tags:
 *       - Audit
 *     summary: Get audit logs
 *     description: Retrieve system audit logs and activity history
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of log entries to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of log entries to skip
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAuditsPerformed:
 *                       type: integer
 *                     lastAuditDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     mostCommonIssues:
 *                       type: array
 *                     auditTrends:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
auditRoute.get("/logs", requireAdminOrSuperAdmin, getAuditLogs);

export default auditRoute;