// api/src/routes/stats.route.ts

import { Router } from "express";
import {
  getOverallStats,
  getVotingTrends,
  getVoterDemographics,
  getPositionStats,
  getTopPerformingCandidates,
  getElectionSummary
} from "../controllers/stats.controller";
// CRITICAL FIX: The security middleware imports are REMOVED from here to prevent them from guarding the public routes globally.

/**
 * @swagger
 * tags:
 *   - name: Statistics
 *     description: Voting statistics and analytics endpoints (public access for general stats)
 */

const statsRoute = Router();

// CRITICAL FIX: The statsRoute MUST NOT have global middleware that locks public access.

/**
 * @swagger
 * /stats/overall:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get overall voting statistics
 *     description: Retrieve comprehensive voting statistics including voter turnout, total votes, and position breakdowns
 *     security: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VotingStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
statsRoute.get("/overall", getOverallStats); // PUBLIC ACCESS

/**
 * @swagger
 * /stats/position/{positionId}:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get position-specific statistics
 *     description: Retrieve detailed statistics for a specific voting position
 *     security: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PositionStats'
 *       400:
 *         description: Invalid position ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
statsRoute.get("/position/:positionId", getPositionStats); // Public access is fine here too

/**
 * @swagger
 * /stats/trends:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get voting trends
 *     description: Retrieve voting activity trends over the last 30 days
 *     security: []
 *     responses:
 *       200:
 *         description: Voting trends retrieved successfully
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
 *                     dailyTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           vote_date:
 *                             type: string
 *                             format: date
 *                           votes_count:
 *                             type: integer
 *                           unique_voters:
 *                             type: integer
 *                     hourlyPattern:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: integer
 *                           votes_count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
statsRoute.get("/trends", getVotingTrends); // PUBLIC ACCESS

/**
 * @swagger
 * /stats/demographics:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get voter demographics
 *     description: Retrieve voter registration trends and voting frequency distribution
 *     security: []
 *     responses:
 *       200:
 *         description: Voter demographics retrieved successfully
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
 *                     registrationTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           registration_date:
 *                             type: string
 *                             format: date
 *                           new_registrations:
 *                             type: integer
 *                     voteFrequencyDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           vote_count:
 *                             type: integer
 *                           voter_count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
statsRoute.get("/demographics", getVoterDemographics); 

/**
 * @swagger
 * /stats/top-candidates:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get top performing candidates
 *     description: Retrieve list of top performing candidates across all positions
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top candidates to return
 *     responses:
 *       200:
 *         description: Top candidates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CandidateStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
statsRoute.get("/top-candidates", getTopPerformingCandidates); 

/**
 * @swagger
 * /stats/summary:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get election summary
 *     description: Retrieve comprehensive election summary with overview, highlights, and insights
 *     security: []
 *     responses:
 *       200:
 *         description: Election summary retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalVoters:
 *                           type: integer
 *                         totalVotesCast:
 *                           type: integer
 *                         voterTurnout:
 *                           type: number
 *                           format: float
 *                         totalPositions:
 *                           type: integer
 *                         totalCandidates:
 *                           type: integer
 *                     highlights:
 *                       type: object
 *                       properties:
 *                         mostVotedPosition:
 *                           type: string
 *                         leastVotedPosition:
 *                           type: string
 *                         averageVotesPerPosition:
 *                           type: number
 *                           format: float
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         dailyTrends:
 *                           type: array
 *                         hourlyPattern:
 *                           type: array
 *                     voterInsights:
 *                       type: object
 *                       properties:
 *                         registrationTrends:
 *                           type: array
 *                         voteFrequencyDistribution:
 *                           type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
statsRoute.get("/summary", getElectionSummary); 

export default statsRoute;