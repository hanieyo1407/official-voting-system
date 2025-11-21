import pool from "../db/config";
import jwt from "jsonwebtoken";
import CacheService from "./cache.service";
import { LoggingService } from "./logging.service";

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
      const positions = result.rows;

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
        'SELECT id, name, manifesto, imageurl, position_id FROM "Candidate" WHERE position_id = $1 ORDER BY id',
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

  // async castVote(voucher: string, candidateId: number, positionId: number, verificationCode: string): Promise<any> {
  //   const result = await pool.query(
  //     `INSERT INTO "Vote"(voucher, candidate_id, position_id, verification_code)
  //      VALUES($1, $2, $3, $4) RETURNING id, voucher, candidate_id, position_id, verification_code`,
  //     [voucher, candidateId, positionId, verificationCode]
  //   );
  //   return result.rows[0];
  // }

  async createPosition(positionName: string) {
    const result = await pool.query(
      `INSERT INTO "Position"(position_name) VALUES($1) RETURNING id, position_name`,
      [positionName]
    );
    return result.rows[0];
  }

  async createCandidate(positionId: number, name: string, manifesto?: string, imageurl?: string) {
    const result = await pool.query(
      `INSERT INTO "Candidate"(name, position_id, manifesto, imageurl)
       VALUES($1, $2, $3, $4)
       RETURNING id, name, position_id, manifesto, imageurl`,
      [name, positionId, manifesto ?? null, imageurl ?? null]
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
    if (!user) {
      throw new Error("Invalid voucher");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, voucher: user.voucher },
      process.env.JWT_SECRET as string,
      { expiresIn: "5m" }
    );

    return { token, user };
  }

  private generateAlphaNum(len = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < len; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  private async verificationCodeExists(code: string) {
    const r = await pool.query(`SELECT 1 FROM "Vote" WHERE verification_code = $1 LIMIT 1`, [code]);
    // return r.rowCount > 0;
    return r.rows.length > 0;
  }

  private async generateUniqueVerificationCode(len = 12, attempts = 10) {
    for (let i = 0; i < attempts; i++) {
      const code = this.generateAlphaNum(len);
      const exists = await this.verificationCodeExists(code);
      if (!exists) return code;
    }
    // fallback to longer code if collisions keep happening
    return this.generateAlphaNum(len * 2);
  }

  async castVote(voucher: string, presidentCandidateId: number, vicePresidentCandidateId: number) {
  try {
    // Step 1: Check how many times this voucher appears in the Vote table
    const existingVotesCheck = await pool.query(
      'SELECT id, position_id, verification_code FROM "Vote" WHERE voucher = $1',
      [voucher]
    );

    const existingVoteCount = existingVotesCheck.rows.length;

    // Step 2: Get position IDs for President and Vice President
    const positionResult = await pool.query(
      'SELECT id, position_name FROM "Position" WHERE position_name IN (\'President\', \'Vice President\') ORDER BY position_name'
    );

    if (positionResult.rows.length !== 2) {
      throw new Error('President and Vice President positions not found');
    }

    const presidentPositionId = positionResult.rows.find(p => p.position_name === 'President')?.id;
    const vicePresidentPositionId = positionResult.rows.find(p => p.position_name === 'Vice President')?.id;

    if (!presidentPositionId || !vicePresidentPositionId) {
      throw new Error('Could not determine position IDs');
    }

    // Step 3: Handle different scenarios based on existing vote count
    if (existingVoteCount === 0) {
      // No existing votes - insert both new votes
      const code = await this.generateUniqueVerificationCode(12);

      const presidentResult = await pool.query(
        `INSERT INTO "Vote"(voucher, candidate_id, position_id, verification_code)
         VALUES($1, $2, $3, $4)
         RETURNING id, voucher, candidate_id, position_id, verification_code, voted_at`,
        [voucher, presidentCandidateId, presidentPositionId, code]
      );

      const vicePresidentResult = await pool.query(
        `INSERT INTO "Vote"(voucher, candidate_id, position_id, verification_code)
         VALUES($1, $2, $3, $4)
         RETURNING id, voucher, candidate_id, position_id, verification_code, voted_at`,
        [voucher, vicePresidentCandidateId, vicePresidentPositionId, code]
      );

      const presidentVote = presidentResult.rows[0];
      const vicePresidentVote = vicePresidentResult.rows[0];

      // Cache and log
      CacheService.setVoteVerification(code, {
        president: presidentVote,
        vicePresident: vicePresidentVote,
        combinedVote: true
      });

      CacheService.invalidateStatsCache();
      CacheService.invalidatePositionCache(presidentPositionId);
      CacheService.invalidatePositionCache(vicePresidentPositionId);

      LoggingService.logVote(voucher, presidentCandidateId, presidentPositionId, code + '-PRESIDENT');
      LoggingService.logVote(voucher, vicePresidentCandidateId, vicePresidentPositionId, code + '-VICE_PRESIDENT');

      return {
        verificationCode: code,
        presidentVote,
        vicePresidentVote,
        message: 'Successfully voted for both President and Vice President'
      };

    } else if (existingVoteCount === 1) {
      // One existing vote - check which position and add the missing one
      const existingVote = existingVotesCheck.rows[0];
      const existingPositionId = existingVote.position_id;
      const existingVerificationCode = existingVote.verification_code;

      // Determine which position is missing
      if (existingPositionId === presidentPositionId) {
        // President vote exists, add Vice President vote
        const vicePresidentResult = await pool.query(
          `INSERT INTO "Vote"(voucher, candidate_id, position_id, verification_code)
           VALUES($1, $2, $3, $4)
           RETURNING id, voucher, candidate_id, position_id, verification_code, voted_at`,
          [voucher, vicePresidentCandidateId, vicePresidentPositionId, existingVerificationCode]
        );

        const vicePresidentVote = vicePresidentResult.rows[0];

        // Update cache and invalidate
        CacheService.invalidateStatsCache();
        CacheService.invalidatePositionCache(vicePresidentPositionId);

        LoggingService.logVote(voucher, vicePresidentCandidateId, vicePresidentPositionId, existingVerificationCode + '-VICE_PRESIDENT');

        return {
          verificationCode: existingVerificationCode,
          vicePresidentVote,
          message: 'Successfully completed your vote by adding Vice President selection'
        };

      } else if (existingPositionId === vicePresidentPositionId) {
        // Vice President vote exists, add President vote
        const presidentResult = await pool.query(
          `INSERT INTO "Vote"(voucher, candidate_id, position_id, verification_code)
           VALUES($1, $2, $3, $4)
           RETURNING id, voucher, candidate_id, position_id, verification_code, voted_at`,
          [voucher, presidentCandidateId, presidentPositionId, existingVerificationCode]
        );

        const presidentVote = presidentResult.rows[0];

        // Update cache and invalidate
        CacheService.invalidateStatsCache();
        CacheService.invalidatePositionCache(presidentPositionId);

        LoggingService.logVote(voucher, presidentCandidateId, presidentPositionId, existingVerificationCode + '-PRESIDENT');

        return {
          verificationCode: existingVerificationCode,
          presidentVote,
          message: 'Successfully completed your vote by adding President selection'
        };

      } else {
        // Existing vote is for an unknown position - this shouldn't happen
        throw new Error('Existing vote is for an unexpected position');
      }

    } else if (existingVoteCount === 2) {
      // Both votes already exist
      throw new Error('Voucher has already been used for both positions');

    } else {
      // More than 2 votes - database corruption
      throw new Error('Database corruption detected for this voucher');
    }

  } catch (error: any) {
    LoggingService.logError(error, { context: 'castVote', voucher, presidentCandidateId, vicePresidentCandidateId });
    throw error;
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