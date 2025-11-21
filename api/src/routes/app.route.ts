import { Router } from "express";
import {
  getAllUsers, //getting all users
  createUser, //creating a new user--creating a voucher
  getPositions, //getting all positons being contested for
  getCandidatesByPosition, //getting candidates on a speciif postion
  castVote, //creatig a vote in db
  createPosition, //adding positions to db
  createCandidate, //adding candidates to db
  loginUser, //authenticating
  logoutUser, //loggin out
  verifyVote, //verify the vote
} from "../controllers/app.controller";
import { verifyToken } from "../middleware/auth.middleware";
import {
  votingRateLimit,
  authRateLimit,
  generalRateLimit,
} from "../middleware/rateLimit.middleware";
import adminRoute from "./admin.route";
import statsRoute from "./stats.route";
import auditRoute from "./audit.route";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../docs/swagger";

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: Users
 *     description: User management endpoints
 *   - name: Positions
 *     description: Position management endpoints
 *   - name: Candidates
 *     description: Candidate management endpoints
 *   - name: Voting
 *     description: Voting endpoints
 */

const appRoute = Router();

//auth
/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user with voucher code and receive JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucher
 *             properties:
 *               voucher:
 *                 type: string
 *                 description: User's voucher code
 *                 example: "VCHR123456"
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
 *                   example: "Login successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing voucher
 *       401:
 *         description: Invalid voucher
 *       429:
 *         description: Too many login attempts
 */
appRoute.post("/login", loginUser);

/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: Clear authentication cookie
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
appRoute.post("/logout", logoutUser);

//user routes
/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve list of all registered users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Users
 *     summary: Create new user
 *     description: Register a new user with voucher code
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucher
 *             properties:
 *               voucher:
 *                 type: string
 *                 description: Unique voucher code
 *                 example: "VCHR123456"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Voucher is required
 *       500:
 *         description: Server error
 */
appRoute.get("/users", verifyToken, getAllUsers);
appRoute.post("/users", createUser);

//positions routes
/**
 * @swagger
 * /positions:
 *   get:
 *     tags:
 *       - Positions
 *     summary: Get all positions
 *     description: Retrieve list of all voting positions
 *     security: []
 *     responses:
 *       200:
 *         description: List of positions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Position'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Positions
 *     summary: Create new position
 *     description: Add a new voting position
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position_name
 *             properties:
 *               position_name:
 *                 type: string
 *                 description: Name of the position
 *                 example: "President"
 *     responses:
 *       201:
 *         description: Position created successfully
 *       400:
 *         description: Position name is required
 *       500:
 *         description: Server error
 */
appRoute.get("/positions", getPositions);
appRoute.post("/positions", createPosition);

/**
 * @swagger
 * /positions/{positionId}/candidates:
 *   get:
 *     tags:
 *       - Candidates
 *     summary: Get candidates by position
 *     description: Retrieve all candidates for a specific position
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
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid position ID
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Candidates
 *     summary: Add candidate to position
 *     description: Add a new candidate to a specific position
 *     security: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Candidate name
 *                 example: "John Doe"
 *               manifesto:
 *                 type: string
 *                 description: Candidate manifesto
 *                 example: "I will lead with integrity..."
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       400:
 *         description: Invalid position ID or missing name
 *       500:
 *         description: Server error
 */
appRoute.get("/positions/:positionId/candidates", getCandidatesByPosition);
appRoute.post("/positions/:positionId/candidates", createCandidate);

//voting route with rate limiting
/**
 * @swagger
 * /vote:
 *   post:
 *     tags:
 *       - Voting
 *     summary: Cast a vote
 *     description: Submit a vote for a candidate in a position (rate limited)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucher
 *               - candidateId
 *               - positionId
 *             properties:
 *               voucher:
 *                 type: string
 *                 description: User's voucher code
 *                 example: "VCHR123456"
 *               candidateId:
 *                 type: integer
 *                 description: ID of the candidate to vote for
 *                 example: 1
 *               positionId:
 *                 type: integer
 *                 description: ID of the position
 *                 example: 1
 *     responses:
 *       201:
 *         description: Vote cast successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Vote'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many voting attempts
 *       500:
 *         description: Server error
 */
appRoute.post("/vote", verifyToken, votingRateLimit, castVote);

//verify vote
/**
 * @swagger
 * /verify:
 *   post:
 *     tags:
 *       - Voting
 *     summary: Verify a vote
 *     description: Verify a vote using verification code
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verification_code
 *             properties:
 *               verification_code:
 *                 type: string
 *                 description: Vote verification code
 *                 example: "ABC123DEF456"
 *     responses:
 *       200:
 *         description: Vote found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "found"
 *                 vote:
 *                   $ref: '#/components/schemas/Vote'
 *       400:
 *         description: Verification code is required
 *       404:
 *         description: Vote not found
 *       500:
 *         description: Server error
 */
appRoute.post("/verify", generalRateLimit, verifyVote);

// API Documentation
/**
 * @swagger
 * /api-docs:
 *   get:
 *     summary: API Documentation
 *     description: Interactive API documentation and testing interface
 *     responses:
 *       200:
 *         description: API documentation interface
 */
appRoute.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "SJBU Voting System API Documentation",
  }),
);

// Mount admin routes
appRoute.use("/admin", adminRoute);

// Mount stats routes
appRoute.use("/stats", statsRoute);

// Mount audit routes
appRoute.use("/audit", auditRoute);

// console.log("Get all users: GET /users");
// console.log("Create a new user: POST /users");
// console.log("Get all positions: GET /positions");
// console.log("Create a new position POST /positions");
// console.log("Get candidates by their id: GET /positions/:positionId/candidates");
// console.log("Create a new candidate: POST /positions/:positionsId/candidates");
// console.log("Create a vote record: POST /vote");
// console.log("Get all votes: N/A");
// console.log("Get votes for a candidate with using an id: N/A");

export default appRoute;
