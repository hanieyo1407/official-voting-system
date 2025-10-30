import pool from "../db/config";
import { LoggingService } from "./logging.service";

export interface VotingStats {
  totalVoters: number;
  totalVotesCast: number;
  voterTurnout: number;
  positionsWithStats: PositionStats[];
  overallStats: {
    totalPositions: number;
    totalCandidates: number;
    averageVotesPerPosition: number;
    mostVotedPosition?: string;
    leastVotedPosition?: string;
  };
}

export interface PositionStats {
  positionId: number;
  positionName: string;
  totalCandidates: number;
  totalVotes: number;
  voterTurnout: number;
  candidates: CandidateStats[];
}

export interface CandidateStats {
  candidateId: number;
  candidateName: string;
  manifesto?: string;
  voteCount: number;
  votePercentage: number;
}

export class StatsService {
  async getOverallVotingStats(): Promise<VotingStats> {
    try {
      // Get total registered voters
      // FIXED: Use Number() instead of parseInt() to correctly interpret DB string result
      const totalVotersResult = await pool.query('SELECT COUNT(*) as count FROM "User"');
      const totalVoters = Number(totalVotersResult.rows[0].count); // FIXED

      // Get total votes cast
      const totalVotesResult = await pool.query('SELECT COUNT(*) as count FROM "Vote"');
      const totalVotesCast = Number(totalVotesResult.rows[0].count); // FIXED

      // Calculate voter turnout percentage
      const uniqueVotersQuery = `
        SELECT COUNT(DISTINCT voucher) as unique_voters
        FROM "Vote"
      `;
      const uniqueVotersResult = await pool.query(uniqueVotersQuery);
      const uniqueVotersWhoVoted = Number(uniqueVotersResult.rows[0].unique_voters); // FIXED

      // CORRECTED CALCULATION: Use Number() to force float arithmetic
      const voterTurnout = totalVoters > 0 ? (Number(uniqueVotersWhoVoted) / Number(totalVoters)) * 100 : 0;

      // Get position statistics
      const positionsStats = await this.getPositionsStats();

      // Get overall statistics
      const overallStats = await this.getOverallStats();

      const stats: VotingStats = {
        totalVoters,
        totalVotesCast,
        voterTurnout: Math.round(voterTurnout * 100) / 100,
        positionsWithStats: positionsStats,
        overallStats
      };

      LoggingService.logStats(stats);
      return stats;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getOverallVotingStats' });
      throw new Error(`Failed to fetch voting statistics: ${error.message}`);
    }
  }

  private async getPositionsStats(): Promise<PositionStats[]> {
    try {
      // Get all positions with their vote counts and candidate information
      const query = `
        SELECT
          p.id as position_id,
          p.position_name,
          COUNT(DISTINCT c.id) as total_candidates,
          COUNT(v.id) as total_votes,
          COUNT(DISTINCT v.voucher) as unique_voters
        FROM "Position" p
        LEFT JOIN "Candidate" c ON p.id = c.position_id
        LEFT JOIN "Vote" v ON p.id = v.position_id AND v.voted_at IS NOT NULL
        GROUP BY p.id, p.position_name
        ORDER BY p.id
      `;

      const positionsResult = await pool.query(query);

      const positionsStats: PositionStats[] = [];

      // FIXED: Get total voters once outside the loop
      const totalVotersResult = await pool.query('SELECT COUNT(*) as count FROM "User"');
      const totalVoters = Number(totalVotersResult.rows[0].count);

      for (const position of positionsResult.rows) {
        const candidates = await this.getCandidatesStats(position.position_id);

        // Calculate turnout for this position
        const uniqueVotersForPosition = Number(await (await pool.query(
          'SELECT COUNT(DISTINCT voucher) as unique_voters FROM "Vote" WHERE position_id = $1',
          [position.position_id]
        )).rows[0].unique_voters);
        
        // CORRECTED CALCULATION: Use Number() to force float arithmetic
        const positionTurnout = totalVoters > 0 ? (Number(uniqueVotersForPosition) / Number(totalVoters)) * 100 : 0;

        positionsStats.push({
          positionId: position.position_id,
          positionName: position.position_name,
          totalCandidates: Number(position.total_candidates),
          totalVotes: Number(position.total_votes),
          voterTurnout: Math.round(positionTurnout * 100) / 100,
          candidates
        });
      }

      return positionsStats;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getPositionsStats' });
      throw error;
    }
  }

  private async getCandidatesStats(positionId: number): Promise<CandidateStats[]> {
    try {
      const query = `
        SELECT
          c.id as candidate_id,
          c.name as candidate_name,
          c.manifesto,
          COUNT(v.id) as vote_count
        FROM "Candidate" c
        LEFT JOIN "Vote" v ON c.id = v.candidate_id AND c.position_id = $1 AND v.voted_at IS NOT NULL
        WHERE c.position_id = $1
        GROUP BY c.id, c.name, c.manifesto
        ORDER BY vote_count DESC
      `;

      const candidatesResult = await pool.query(query, [positionId]);

      // Get total votes for this position to calculate percentages
      const totalVotesQuery = `
        SELECT COUNT(*) as total_votes
        FROM "Vote"
        WHERE position_id = $1 AND voted_at IS NOT NULL
      `;
      const totalVotesResult = await pool.query(totalVotesQuery, [positionId]);
      const totalVotes = Number(totalVotesResult.rows[0].total_votes); // FIXED

      // Handle ties in candidate voting
      const candidatesWithTies = candidatesResult.rows.map(candidate => {
        const voteCount = Number(candidate.vote_count); // FIXED
        const votePercentage = totalVotes > 0 ?
          Math.round((voteCount / Number(totalVotes)) * 10000) / 100 : 0; // FIXED

        return {
          candidateId: candidate.candidate_id,
          candidateName: candidate.candidate_name,
          manifesto: candidate.manifesto,
          voteCount: voteCount,
          votePercentage: votePercentage
        };
      });

      // Mark ties in candidate results
      if (candidatesWithTies.length > 1) {
        const topVoteCount = candidatesWithTies[0].voteCount;
        const tiedCandidates = candidatesWithTies.filter(c => c.voteCount === topVoteCount);

        if (tiedCandidates.length > 1) {
          // Mark tied candidates
          tiedCandidates.forEach(candidate => {
            candidate.candidateName = `TIE: ${candidate.candidateName}`;
          });
        }
      }

      return candidatesWithTies;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getCandidatesStats', positionId });
      throw error;
    }
  }

  private async getOverallStats(): Promise<VotingStats['overallStats']> {
    try {
      // Get total positions
      const positionsResult = await pool.query('SELECT COUNT(*) as count FROM "Position"');
      const totalPositions = Number(positionsResult.rows[0].count); // FIXED

      // Get total candidates
      const candidatesResult = await pool.query('SELECT COUNT(*) as count FROM "Candidate"');
      const totalCandidates = Number(candidatesResult.rows[0].count); // FIXED

      // Get average votes per position
      const avgVotesQuery = `
        SELECT AVG(position_votes) as avg_votes
        FROM (
          SELECT COUNT(v.id) as position_votes
          FROM "Position" p
          LEFT JOIN "Vote" v ON p.id = v.position_id AND v.voted_at IS NOT NULL
          GROUP BY p.id
        ) position_vote_counts
      `;
      const avgVotesResult = await pool.query(avgVotesQuery);
      const averageVotesPerPosition = parseFloat(avgVotesResult.rows[0].avg_votes) || 0;

      // Get most and least voted positions (handle ties)
      const positionVoteQuery = `
        SELECT
          p.position_name,
          COUNT(v.id) as vote_count
        FROM "Position" p
        LEFT JOIN "Vote" v ON p.id = v.position_id AND v.voted_at IS NOT NULL
        GROUP BY p.id, p.position_name
        ORDER BY vote_count DESC
      `;

      const positionVotesResult = await pool.query(positionVoteQuery);

      let mostVotedPosition: string | undefined;
      let leastVotedPosition: string | undefined;

      if (positionVotesResult.rows.length > 0) {
        const topVoteCount = Number(positionVotesResult.rows[0].vote_count); // FIXED

        // Find all positions with the highest vote count (handle ties)
        const tiedWinners = positionVotesResult.rows.filter(row => Number(row.vote_count) === topVoteCount); // FIXED
        if (tiedWinners.length === 1) {
          mostVotedPosition = tiedWinners[0].position_name;
        } else {
          // Multiple positions tied for most votes
          mostVotedPosition = `TIE: ${tiedWinners.map(w => w.position_name).join(' & ')}`;
        }

        if (positionVotesResult.rows.length > 1) {
          const lastIndex = positionVotesResult.rows.length - 1;
          const bottomVoteCount = Number(positionVotesResult.rows[lastIndex].vote_count); // FIXED
          
          const tiedLosers = positionVotesResult.rows.filter(row => Number(row.vote_count) === bottomVoteCount); // FIXED

          if (tiedLosers.length === 1) {
            leastVotedPosition = tiedLosers[0].position_name;
          } else {
            leastVotedPosition = `TIE: ${tiedLosers.map(l => l.position_name).join(' & ')}`;
          }
        }
      }

      return {
        totalPositions,
        totalCandidates,
        averageVotesPerPosition: Math.round(averageVotesPerPosition * 100) / 100,
        mostVotedPosition,
        leastVotedPosition
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getOverallStats' });
      throw error;
    }
  }

  async getVotingTrends(): Promise<any> {
    try {
      // Get voting activity over time (last 30 days)
      const trendsQuery = `
        SELECT
          DATE(v.voted_at) as vote_date,
          COUNT(*) as votes_count,
          COUNT(DISTINCT v.voucher) as unique_voters
        FROM "Vote" v
        WHERE v.voted_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(v.voted_at)
        ORDER BY vote_date DESC
      `;

      const trendsResult = await pool.query(trendsQuery);

      // Get hourly voting patterns for today
      const hourlyQuery = `
        SELECT
          EXTRACT(hour FROM v.voted_at) as hour,
          COUNT(*) as votes_count
        FROM "Vote" v
        WHERE DATE(v.voted_at) = CURRENT_DATE
        GROUP BY EXTRACT(hour FROM v.voted_at)
        ORDER BY hour
      `;

      const hourlyResult = await pool.query(hourlyQuery);

      return {
        dailyTrends: trendsResult.rows,
        hourlyPattern: hourlyResult.rows
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getVotingTrends' });
      throw new Error(`Failed to fetch voting trends: ${error.message}`);
    }
  }

  async getVoterDemographics(): Promise<any> {
    try {
      // Get voter registration trends
      const registrationQuery = `
        SELECT
          DATE(u.created_at) as registration_date,
          COUNT(*) as new_registrations
        FROM "User" u
        WHERE u.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(u.created_at)
        ORDER BY registration_date DESC
      `;

      const registrationResult = await pool.query(registrationQuery);

      // Get vote frequency distribution
      // In the new system, users should have exactly 0 or 2 votes (one for each position)
      const voteFrequencyQuery = `
        SELECT
          vote_count,
          COUNT(*) as voter_count
        FROM (
          SELECT
            u.id,
            COUNT(v.id) as vote_count
          FROM "User" u
          LEFT JOIN "Vote" v ON u.voucher = v.voucher
          GROUP BY u.id
        ) user_vote_counts
        GROUP BY vote_count
        ORDER BY vote_count
      `;

      const voteFrequencyResult = await pool.query(voteFrequencyQuery);

      return {
        registrationTrends: registrationResult.rows,
        voteFrequencyDistribution: voteFrequencyResult.rows
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getVoterDemographics' });
      throw new Error(`Failed to fetch voter demographics: ${error.message}`);
    }
  }
}

export default new StatsService();