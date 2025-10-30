import pool from "../db/config";
import { LoggingService } from "./logging.service";

export interface RunoffElection {
  id: number;
  originalPositionId: number;
  originalPositionName: string;
  tiedCandidates: Array<{
    candidateId: number;
    candidateName: string;
    originalVoteCount: number;
  }>;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  winnerCandidateId?: number;
}

export interface RunoffVote {
  id: number;
  runoffElectionId: number;
  voucher: string;
  candidateId: number;
  verificationCode: string;
  votedAt: Date;
}

export class RunoffService {
  async detectTiesAndCreateRunoffs(): Promise<RunoffElection[]> {
    try {
      // Find positions with tied candidates
      const tieQuery = `
        SELECT
          p.id as position_id,
          p.position_name,
          c.id as candidate_id,
          c.name as candidate_name,
          COUNT(v.id) as vote_count
        FROM "Position" p
        JOIN "Candidate" c ON p.id = c.position_id
        LEFT JOIN "Vote" v ON c.id = v.candidate_id AND c.position_id = v.position_id
        GROUP BY p.id, p.position_name, c.id, c.name
        HAVING COUNT(v.id) > 0
        ORDER BY p.id, vote_count DESC
      `;

      const candidatesResult = await pool.query(tieQuery);
      const runoffElections: RunoffElection[] = [];

      // Group by position and find ties
      const positionGroups = new Map<number, any[]>();

      for (const row of candidatesResult.rows) {
        if (!positionGroups.has(row.position_id)) {
          positionGroups.set(row.position_id, []);
        }
        positionGroups.get(row.position_id)!.push(row);
      }

      // Check each position for ties
      for (const [positionId, candidates] of positionGroups) {
        if (candidates.length < 2) continue;

        const topVoteCount = candidates[0].vote_count;
        const tiedCandidates = candidates.filter(c => c.vote_count === topVoteCount);

        // Only create runoff if there's a tie for first place
        if (tiedCandidates.length > 1) {
          const runoffElection = await this.createRunoffElection(
            positionId,
            candidates[0].position_name,
            tiedCandidates
          );

          if (runoffElection) {
            runoffElections.push(runoffElection);
          }
        }
      }

      LoggingService.logAudit('RUNOFF_ELECTIONS_CREATED', {
        count: runoffElections.length,
        positions: runoffElections.map(r => r.originalPositionName)
      });

      return runoffElections;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'detectTiesAndCreateRunoffs' });
      throw new Error(`Failed to detect ties: ${error.message}`);
    }
  }

  async createRunoffElection(
    positionId: number,
    positionName: string,
    tiedCandidates: any[]
  ): Promise<RunoffElection | null> {
    try {
      const result = await pool.query(
        `INSERT INTO "RunoffElection"(original_position_id, original_position_name, tied_candidates, status, created_at)
         VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING id, original_position_id, original_position_name, tied_candidates, status, created_at`,
        [positionId, positionName, JSON.stringify(tiedCandidates), 'pending']
      );

      const runoff = result.rows[0];

      // Create runoff candidates
      for (const candidate of tiedCandidates) {
        await pool.query(
          `INSERT INTO "RunoffCandidate"(runoff_election_id, candidate_id, candidate_name, original_vote_count)
           VALUES($1, $2, $3, $4)`,
          [runoff.id, candidate.candidate_id, candidate.candidate_name, candidate.vote_count]
        );
      }

      LoggingService.logAdminAction('system', 'CREATE_RUNOFF_ELECTION', positionId.toString(), {
        positionName,
        tiedCandidates: tiedCandidates.length
      });

      return {
        id: runoff.id,
        originalPositionId: runoff.original_position_id,
        originalPositionName: runoff.original_position_name,
        tiedCandidates: tiedCandidates.map(c => ({
          candidateId: c.candidate_id,
          candidateName: c.candidate_name,
          originalVoteCount: c.vote_count
        })),
        status: runoff.status,
        createdAt: runoff.created_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'createRunoffElection', positionId });
      return null;
    }
  }

  async startRunoffElection(runoffElectionId: number): Promise<RunoffElection | null> {
    try {
      const result = await pool.query(
        `UPDATE "RunoffElection"
         SET status = 'active', started_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND status = 'pending'
         RETURNING id, original_position_id, original_position_name, tied_candidates, status, created_at, started_at`,
        [runoffElectionId]
      );

      if (result.rows.length === 0) {
        throw new Error('Runoff election not found or already started');
      }

      const runoff = result.rows[0];

      LoggingService.logAdminAction('system', 'START_RUNOFF_ELECTION', runoffElectionId.toString());

      return {
        id: runoff.id,
        originalPositionId: runoff.original_position_id,
        originalPositionName: runoff.original_position_name,
        tiedCandidates: JSON.parse(runoff.tied_candidates),
        status: runoff.status,
        createdAt: runoff.created_at,
        startedAt: runoff.started_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'startRunoffElection', runoffElectionId });
      throw new Error(`Failed to start runoff election: ${error.message}`);
    }
  }

  async castRunoffVote(
    runoffElectionId: number,
    voucher: string,
    candidateId: number
  ): Promise<RunoffVote> {
    try {
      // Check if runoff election is active
      const runoffCheck = await pool.query(
        'SELECT id, status FROM "RunoffElection" WHERE id = $1 AND status = \'active\'',
        [runoffElectionId]
      );

      if (runoffCheck.rows.length === 0) {
        throw new Error('Runoff election not found or not active');
      }

      // Check if user has already voted in this runoff
      const existingVoteCheck = await pool.query(
        'SELECT id FROM "RunoffVote" WHERE runoff_election_id = $1 AND voucher = $2',
        [runoffElectionId, voucher]
      );

      if (existingVoteCheck.rows.length > 0) {
        throw new Error('User has already voted in this runoff election');
      }

      // Verify candidate is part of this runoff
      const candidateCheck = await pool.query(
        'SELECT candidate_id FROM "RunoffCandidate" WHERE runoff_election_id = $1 AND candidate_id = $2',
        [runoffElectionId, candidateId]
      );

      if (candidateCheck.rows.length === 0) {
        throw new Error('Invalid candidate for this runoff election');
      }

      // Generate verification code
      const verificationCode = this.generateVerificationCode();

      const result = await pool.query(
        `INSERT INTO "RunoffVote"(runoff_election_id, voucher, candidate_id, verification_code, voted_at)
         VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING id, runoff_election_id, voucher, candidate_id, verification_code, voted_at`,
        [runoffElectionId, voucher, candidateId, verificationCode]
      );

      const runoffVote = result.rows[0];

      LoggingService.logVote(voucher, candidateId, runoffElectionId, verificationCode + '-RUNOFF');

      return runoffVote;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'castRunoffVote', runoffElectionId, candidateId });
      throw error;
    }
  }

  async completeRunoffElection(runoffElectionId: number): Promise<RunoffElection | null> {
    try {
      // Get runoff results
      const resultsQuery = `
        SELECT
          rc.candidate_id,
          rc.candidate_name,
          COUNT(rv.id) as vote_count
        FROM "RunoffCandidate" rc
        LEFT JOIN "RunoffVote" rv ON rc.candidate_id = rv.candidate_id AND rc.runoff_election_id = rv.runoff_election_id
        WHERE rc.runoff_election_id = $1
        GROUP BY rc.candidate_id, rc.candidate_name
        ORDER BY vote_count DESC
      `;

      const resultsResult = await pool.query(resultsQuery, [runoffElectionId]);
      const results = resultsResult.rows;

      if (results.length === 0) {
        throw new Error('No candidates found for runoff election');
      }

      // Find winner (candidate with most votes)
      const winner = results[0];
      const winnerVoteCount = winner.vote_count;

      // Check if there's still a tie
      const tiedWinners = results.filter(r => r.vote_count === winnerVoteCount);

      let finalWinnerId: number | undefined;

      if (tiedWinners.length === 1) {
        // Clear winner
        finalWinnerId = winner.candidate_id;
      } else {
        // Still tied - mark as tie
        finalWinnerId = undefined;
      }

      // Update runoff election
      const updateResult = await pool.query(
        `UPDATE "RunoffElection"
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP, winner_candidate_id = $2
         WHERE id = $1
         RETURNING id, original_position_id, original_position_name, tied_candidates, status, created_at, started_at, completed_at, winner_candidate_id`,
        [runoffElectionId, finalWinnerId]
      );

      const runoff = updateResult.rows[0];

      LoggingService.logAdminAction('system', 'COMPLETE_RUNOFF_ELECTION', runoffElectionId.toString(), {
        winnerCandidateId: finalWinnerId,
        stillTied: tiedWinners.length > 1
      });

      return {
        id: runoff.id,
        originalPositionId: runoff.original_position_id,
        originalPositionName: runoff.original_position_name,
        tiedCandidates: JSON.parse(runoff.tied_candidates),
        status: runoff.status,
        createdAt: runoff.created_at,
        startedAt: runoff.started_at,
        completedAt: runoff.completed_at,
        winnerCandidateId: runoff.winner_candidate_id
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'completeRunoffElection', runoffElectionId });
      throw new Error(`Failed to complete runoff election: ${error.message}`);
    }
  }

  async getRunoffElections(): Promise<RunoffElection[]> {
    try {
      const result = await pool.query(
        `SELECT id, original_position_id, original_position_name, tied_candidates, status, created_at, started_at, completed_at, winner_candidate_id
         FROM "RunoffElection"
         ORDER BY created_at DESC`
      );

      return result.rows.map(row => ({
        id: row.id,
        originalPositionId: row.original_position_id,
        originalPositionName: row.original_position_name,
        tiedCandidates: JSON.parse(row.tied_candidates),
        status: row.status,
        createdAt: row.created_at,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        winnerCandidateId: row.winner_candidate_id
      }));
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getRunoffElections' });
      throw new Error(`Failed to fetch runoff elections: ${error.message}`);
    }
  }

  async getRunoffElectionById(runoffElectionId: number): Promise<RunoffElection | null> {
    try {
      const result = await pool.query(
        `SELECT id, original_position_id, original_position_name, tied_candidates, status, created_at, started_at, completed_at, winner_candidate_id
         FROM "RunoffElection" WHERE id = $1`,
        [runoffElectionId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        originalPositionId: row.original_position_id,
        originalPositionName: row.original_position_name,
        tiedCandidates: JSON.parse(row.tied_candidates),
        status: row.status,
        createdAt: row.created_at,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        winnerCandidateId: row.winner_candidate_id
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getRunoffElectionById', runoffElectionId });
      throw new Error(`Failed to fetch runoff election: ${error.message}`);
    }
  }

  async getRunoffCandidates(runoffElectionId: number): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT candidate_id, candidate_name, original_vote_count
         FROM "RunoffCandidate"
         WHERE runoff_election_id = $1
         ORDER BY original_vote_count DESC`,
        [runoffElectionId]
      );

      return result.rows;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getRunoffCandidates', runoffElectionId });
      throw new Error(`Failed to fetch runoff candidates: ${error.message}`);
    }
  }

  async getRunoffResults(runoffElectionId: number): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT
          rc.candidate_id,
          rc.candidate_name,
          COUNT(rv.id) as runoff_vote_count
         FROM "RunoffCandidate" rc
         LEFT JOIN "RunoffVote" rv ON rc.candidate_id = rv.candidate_id AND rc.runoff_election_id = rv.runoff_election_id
         WHERE rc.runoff_election_id = $1
         GROUP BY rc.candidate_id, rc.candidate_name
         ORDER BY runoff_vote_count DESC`,
        [runoffElectionId]
      );

      return result.rows;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getRunoffResults', runoffElectionId });
      throw new Error(`Failed to fetch runoff results: ${error.message}`);
    }
  }

  private generateVerificationCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}

export default new RunoffService();