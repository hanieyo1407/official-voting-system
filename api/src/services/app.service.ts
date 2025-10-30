import pool from "../db/config";
import jwt from "jsonwebtoken";
import CacheService from "./cache.service";
import { LoggingService } from "./logging.service";
import * as crypto from 'crypto'; // ADDED: Import native crypto for secure token generation

export class AppService {
  async getAllUsers(): Promise<any[]> {
    try {
      // Check cache first
      const cached = CacheService.get<any[]>('users:all');
      if (cached) {
        LoggingService.logAudit('CACHE_HIT', { key: 'users:all', source: 'getAllUsers' });
        return cached;
      }

      const result = await pool.query('SELECT id, voucher FROM "User" ORDER BY id');
      const users = result.rows;

      // Cache the result
      CacheService.set('users:all', users, 900); // 15 minutes

      LoggingService.logAudit('CACHE_MISS', { key: 'users:all', source: 'getAllUsers' });
      return users;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getAllUsers' });
      throw error;
    }
  }

  async createUser(voucher: string): Promise<any> {
    const result = await pool.query(
      'INSERT INTO "User"(voucher) VALUES($1) ON CONFLICT (voucher) DO NOTHING RETURNING id, voucher',
      [voucher]
    );
    // If conflict happened DO NOTHING, return existing row as a fallback
    if (result.rows.length === 0) {
      const existing = await pool.query('SELECT id, voucher FROM "User" WHERE voucher = $1', [voucher]);
      return existing.rows[0];
    }
    return result.rows[0];
  }

  async getPositions(): Promise<any[]> {
    try {
      // Check cache first
      const cached = CacheService.getPositions();
      if (cached) {
        LoggingService.logAudit('CACHE_HIT', { key: 'positions:all', source: 'getPositions' });
        return cached;
      }

      const result = await pool.query('SELECT id, position_name FROM "Position" ORDER BY id');
      
      // FIX: Map the backend's raw data (with position_name) to the frontend's Position type (with name)
      const positions = result.rows.map(row => ({
          id: row.id,
          name: row.position_name
      }));

      // Cache the result
      CacheService.setPositions(positions);

      LoggingService.logAudit('CACHE_MISS', { key: 'positions:all', source: 'getPositions' });
      return positions;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getPositions' });
      throw error;
    }
  }

  async getCandidatesByPosition(positionId: number): Promise<any[]> {
    try {
      // Check cache first
      const cached = CacheService.getPositionCandidates(positionId);
      if (cached) {
        LoggingService.logAudit('CACHE_HIT', { key: `position:${positionId}:candidates`, source: 'getCandidatesByPosition' });
        return cached;
      }

      const result = await pool.query(
        'SELECT id, name, manifesto, position_id FROM "Candidate" WHERE position_id = $1 ORDER BY id',
        [positionId]
      );
      const candidates = result.rows;

      // Cache the result
      CacheService.setPositionCandidates(positionId, candidates);

      LoggingService.logAudit('CACHE_MISS', { key: `position:${positionId}:candidates`, source: 'getCandidatesByPosition' });
      return candidates;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getCandidatesByPosition', positionId });
      throw error;
    }
  }

  async createPosition(positionName: string) {
    const result = await pool.query(
      `INSERT INTO "Position"(position_name) VALUES($1) RETURNING id, position_name`,
      [positionName]
    );
    return result.rows[0];
  }

  async createCandidate(positionId: number, name: string, manifesto?: string) {
    const result = await pool.query(
      `INSERT INTO "Candidate"(name, position_id, manifesto)
       VALUES($1, $2, $3)
       RETURNING id, name, position_id, manifesto`,
      [name, positionId, manifesto ?? null]
    );
    return result.rows[0];
  }

  async findUserByVoucher(voucher: string) {
    const result = await pool.query(
      `SELECT id, voucher FROM "User" WHERE voucher = $1 LIMIT 1`,
      [voucher]
    );
    return result.rows[0] ?? null;
  }

  async loginUser(voucher: string) {
    const user = await this.findUserByVoucher(voucher);
    
    // STEP 1: Check if the voucher is valid (exists in "User" table)
    if (!user) {
      throw new Error("Invalid voucher");
    }

    // STEP 2: CRITICAL SECURITY CHECK: Check if the voucher has already been used (exists in "Vote" table)
    const voteCheckResult = await pool.query(
      `SELECT COUNT(*) AS count FROM "Vote" WHERE voucher = $1`,
      [voucher]
    );

    if (Number(voteCheckResult.rows[0].count) > 0) {
      throw new Error("Voucher already used for voting");
    }

    // STEP 3: If valid and unused, grant access
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, voucher: user.voucher },
      process.env.JWT_SECRET as string,
      { expiresIn: "5m" }
    );

    return { token, user };
  }

  // MODIFIED: Use crypto for secure, production-ready token generation
  private generateAlphaNum(len = 12) {
    return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len).toUpperCase();
  }

  private async verificationCodeExists(code: string) {
    const r = await pool.query(`SELECT 1 FROM "Vote" WHERE verification_code = $1 LIMIT 1`, [code]);
    return r.rows.length > 0;
  }

  private async generateUniqueVerificationCode(len = 12, attempts = 10) {
    for (let i = 0; i < attempts; i++) {
      // Use a slightly longer code for better uniqueness
      const code = this.generateAlphaNum(len + 4); 
      const exists = await this.verificationCodeExists(code);
      if (!exists) return code;
    }
    // Fallback should ideally throw a fatal error, but for robustness:
    throw new Error("FATAL: Could not generate a unique verification code after multiple attempts.");
  }

  async castVote(voucher: string, candidateId: number, positionId: number) {
    try {
      // REMOVED: Redundant and fragile client-side rate-limit check. 
      // The express-rate-limit middleware already handles IP-based limits.

      // generate unique verification code
      const code = await this.generateUniqueVerificationCode(12);

      const result = await pool.query(
        `INSERT INTO "Vote"(voucher, candidate_id, position_id, verification_code)
         VALUES($1, $2, $3, $4)
         RETURNING id, voucher, candidate_id, position_id, verification_code, voted_at`,
        [voucher, candidateId, positionId, code]
      );

      const vote = result.rows[0];

      // Cache the vote verification for quick lookup
      CacheService.setVoteVerification(code, vote);

      // Invalidate relevant caches
      CacheService.invalidateStatsCache();
      CacheService.invalidatePositionCache(positionId);

      // Log the vote
      LoggingService.logVote(voucher, candidateId, positionId, code);

      return vote;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'castVote', voucher, candidateId, positionId });
      // Re-throw generic error message for security
      throw new Error("Failed to process vote submission.");
    }
  }
  
  async verifyVoteByCode(code: string): Promise<any | null> {
    try {
      // Check cache first
      const cached = CacheService.getVoteVerification(code);
      if (cached) {
        LoggingService.logAudit('CACHE_HIT', { key: `vote:verification:${code}`, source: 'verifyVoteByCode' });
        return cached;
      }

      const result = await pool.query(
        `SELECT id, voucher, candidate_id, position_id, verification_code, voted_at
         FROM "Vote" WHERE verification_code = $1 LIMIT 1`,
        [code]
      );

      const vote = result.rows[0] ?? null;

      // Cache the result if found
      if (vote) {
        CacheService.setVoteVerification(code, vote);
      }

      LoggingService.logAudit('CACHE_MISS', { key: `vote:verification:${code}`, source: 'verifyVoteByCode' });
      return vote;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'verifyVoteByCode', verificationCode: code });
      throw error;
    }
  }
}

export default new AppService();