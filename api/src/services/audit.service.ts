// api/src/services/audit.service.ts

import pool from "../db/config";
import { LoggingService } from "./logging.service";

export interface VoteAuditResult {
  voteId: number;
  voucher: string;
  verificationCode: string;
  candidateId: number;
  positionId: number;
  timestamp: Date;
  isValid: boolean;
  issues: string[];
  riskScore: number;
}

export interface AuditReport {
  totalVotesAudited: number;
  validVotes: number;
  suspiciousVotes: number;
  invalidVotes: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  commonIssues: Array<{
    issue: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: string[];
}

export interface FraudDetectionResult {
  isSuspicious: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  confidence: number;
  details: any;
}

export class AuditService {
  async auditVote(voteId: number): Promise<VoteAuditResult> {
    try {
      // Get vote details
      const voteQuery = `
        SELECT v.*, u.voucher, c.name as candidate_name, p.position_name
        FROM "Vote" v
        JOIN "User" u ON v.voucher = u.voucher
        JOIN "Candidate" c ON v.candidate_id = c.id
        JOIN "Position" p ON v.position_id = p.id
        WHERE v.id = $1
      `;

      const voteResult = await pool.query(voteQuery, [voteId]);

      if (voteResult.rows.length === 0) {
        throw new Error('Vote not found');
      }

      const vote = voteResult.rows[0];
      const issues: string[] = [];
      let riskScore = 0;

      // Check 1: Verify user exists and is valid
      const userCheck = await this.validateUserByVoucher(vote.voucher);
      if (!userCheck.isValid) {
        issues.push(`Invalid user: ${userCheck.issue}`);
        riskScore += 25;
      }

      // Check 2: Verify candidate exists and belongs to position
      const candidateCheck = await this.validateCandidate(vote.candidate_id, vote.position_id);
      if (!candidateCheck.isValid) {
        issues.push(`Invalid candidate: ${candidateCheck.issue}`);
        riskScore += 30;
      }

      // Check 3: Check for duplicate votes by same user
      const duplicateCheck = await this.checkDuplicateVotesByVoucher(vote.voucher, vote.position_id, voteId);
      if (duplicateCheck.hasDuplicates) {
        issues.push(`Duplicate votes detected: ${duplicateCheck.duplicateCount} votes for same position`);
        riskScore += duplicateCheck.duplicateCount * 20;
      }

      // Check 4: Verify verification code format and uniqueness
      const codeCheck = await this.validateVerificationCode(vote.verification_code, voteId);
      if (!codeCheck.isValid) {
        issues.push(`Invalid verification code: ${codeCheck.issue}`);
        riskScore += 15;
      }

      // Check 5: Check voting timing patterns
      const timingCheck = await this.analyzeVotingTimingByVoucher(vote.voucher, vote.created_at);
      if (timingCheck.isSuspicious) {
        issues.push(`Suspicious timing: ${timingCheck.issue}`);
        riskScore += timingCheck.riskScore;
      }

      // Check 6: Verify vote hasn't been tampered with
      const integrityCheck = await this.verifyVoteIntegrity(vote);
      if (!integrityCheck.isValid) {
        issues.push(`Integrity issue: ${integrityCheck.issue}`);
        riskScore += 40;
      }

      const isValid = issues.length === 0 && riskScore < 30;

      const auditResult: VoteAuditResult = {
        voteId: vote.id,
        voucher: vote.voucher,
        verificationCode: vote.verification_code,
        candidateId: vote.candidate_id,
        positionId: vote.position_id,
        timestamp: vote.created_at,
        isValid,
        issues,
        riskScore: Math.min(riskScore, 100)
      };

      LoggingService.logAudit('VOTE_AUDIT', {
        voteId,
        isValid,
        riskScore,
        issues: issues.length
      });

      return auditResult;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'auditVote', voteId });
      throw new Error(`Failed to audit vote: ${error.message}`);
    }
  }

  async auditAllVotes(): Promise<AuditReport> {
    try {
      // Get all vote IDs
      const allVotesQuery = 'SELECT id FROM "Vote" ORDER BY id';
      const allVotesResult = await pool.query(allVotesQuery);

      const auditResults: VoteAuditResult[] = [];
      const issuesMap = new Map<string, number>();
      const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };

      // Audit each vote
      for (const vote of allVotesResult.rows) {
        try {
          const auditResult = await this.auditVote(vote.id);
          auditResults.push(auditResult);

          // Track issues
          auditResult.issues.forEach(issue => {
            issuesMap.set(issue, (issuesMap.get(issue) || 0) + 1);
          });

          // Categorize risk
          if (auditResult.riskScore >= 70) {
            riskDistribution.critical++;
          } else if (auditResult.riskScore >= 50) {
            riskDistribution.high++;
          } else if (auditResult.riskScore >= 25) {
            riskDistribution.medium++;
          } else {
            riskDistribution.low++;
          }
        } catch (error: any) {
          LoggingService.logError(new Error(error.message || error), { context: 'auditAllVotes', voteId: vote.id });
        }
      }

      const validVotes = auditResults.filter(r => r.isValid).length;
      const suspiciousVotes = auditResults.filter(r => !r.isValid && r.riskScore < 50).length;
      const invalidVotes = auditResults.filter(r => r.riskScore >= 50).length;

      // Generate common issues list
      const commonIssues = Array.from(issuesMap.entries())
        .map(([issue, count]) => ({
          issue,
          count,
          severity: this.categorizeIssueSeverity(issue) as 'low' | 'medium' | 'high' | 'critical'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Generate recommendations
      const recommendations = this.generateRecommendations(commonIssues, riskDistribution);

      const report: AuditReport = {
        totalVotesAudited: auditResults.length,
        validVotes,
        suspiciousVotes,
        invalidVotes,
        riskDistribution,
        commonIssues,
        recommendations
      };

      LoggingService.logAudit('FULL_AUDIT_COMPLETED', {
        totalAudited: auditResults.length,
        validVotes,
        suspiciousVotes,
        invalidVotes
      });

      return report;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'auditAllVotes' });
      throw new Error(`Failed to audit all votes: ${error.message}`);
    }
  }

  async detectFraudPatterns(): Promise<FraudDetectionResult> {
    try {
      const fraudFactors: string[] = [];
      let totalRiskScore = 0;
      const details: any = {};

      // Check 1: Multiple votes from same IP (if IP tracking is implemented)
      // For now, we'll check for rapid successive votes from same user
      const rapidVotingCheck = await this.detectRapidVoting();
      if (rapidVotingCheck.isSuspicious) {
        fraudFactors.push('Rapid successive voting detected');
        totalRiskScore += rapidVotingCheck.riskScore;
        details.rapidVoting = rapidVotingCheck.details;
      }

      // Check 2: Vote concentration analysis
      const concentrationCheck = await this.analyzeVoteConcentration();
      if (concentrationCheck.isSuspicious) {
        fraudFactors.push('Unusual vote concentration patterns');
        totalRiskScore += concentrationCheck.riskScore;
        details.voteConcentration = concentrationCheck.details;
      }

      // Check 3: Timing pattern analysis
      const timingPatternCheck = await this.analyzeTimingPatterns();
      if (timingPatternCheck.isSuspicious) {
        fraudFactors.push('Suspicious timing patterns');
        totalRiskScore += timingPatternCheck.riskScore;
        details.timingPatterns = timingPatternCheck.details;
      }

      // Check 4: User behavior analysis
      const behaviorCheck = await this.analyzeUserBehavior();
      if (behaviorCheck.isSuspicious) {
        fraudFactors.push('Unusual user behavior patterns');
        totalRiskScore += behaviorCheck.riskScore;
        details.userBehavior = behaviorCheck.details;
      }

      const maxRiskScore = 100;
      const normalizedRiskScore = Math.min(totalRiskScore, maxRiskScore);

      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (normalizedRiskScore >= 75) {
        riskLevel = 'critical';
      } else if (normalizedRiskScore >= 50) {
        riskLevel = 'high';
      } else if (normalizedRiskScore >= 25) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }

      const confidence = Math.min((fraudFactors.length * 25), 100);

      const result: FraudDetectionResult = {
        isSuspicious: fraudFactors.length > 0,
        riskLevel,
        riskFactors: fraudFactors,
        confidence,
        details
      };

      LoggingService.logAudit('FRAUD_DETECTION_COMPLETED', {
        isSuspicious: result.isSuspicious,
        riskLevel: result.riskLevel,
        fraudFactors: fraudFactors.length,
        confidence: result.confidence
      });

      return result;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'detectFraudPatterns' });
      throw new Error(`Failed to detect fraud patterns: ${error.message}`);
    }
  }

  private async validateUser(userId: number): Promise<{ isValid: boolean; issue?: string }> {
    try {
      const result = await pool.query(
        'SELECT id, voucher FROM "User" WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return { isValid: false, issue: 'User not found' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, issue: 'Database error during user validation' };
    }
  }

  private async validateUserByVoucher(voucher: string): Promise<{ isValid: boolean; issue?: string }> {
    try {
      const result = await pool.query(
        'SELECT id, voucher FROM "User" WHERE voucher = $1',
        [voucher]
      );

      if (result.rows.length === 0) {
        return { isValid: false, issue: 'User not found' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, issue: 'Database error during user validation' };
    }
  }

  private async validateCandidate(candidateId: number, positionId: number): Promise<{ isValid: boolean; issue?: string }> {
    try {
      const result = await pool.query(
        'SELECT id, position_id FROM "Candidate" WHERE id = $1 AND position_id = $2',
        [candidateId, positionId]
      );

      if (result.rows.length === 0) {
        return { isValid: false, issue: 'Candidate not found or not associated with position' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, issue: 'Database error during candidate validation' };
    }
  }

  private async checkDuplicateVotes(userId: number, positionId: number, excludeVoteId: number): Promise<{ hasDuplicates: boolean; duplicateCount: number }> {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM "Vote" WHERE user_id = $1 AND position_id = $2 AND id != $3',
        [userId, positionId, excludeVoteId]
      );

      const duplicateCount = parseInt(result.rows[0].count);
      return { hasDuplicates: duplicateCount > 0, duplicateCount };
    } catch (error) {
      return { hasDuplicates: false, duplicateCount: 0 };
    }
  }

  private async checkDuplicateVotesByVoucher(voucher: string, positionId: number, excludeVoteId: number): Promise<{ hasDuplicates: boolean; duplicateCount: number }> {
    try {
      // In the new system, users can only vote once total (for both positions)
      // So we check for ANY votes from this voucher (except the current vote being audited)
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM "Vote" WHERE voucher = $1 AND id != $3',
        [voucher, excludeVoteId]
      );

      const duplicateCount = parseInt(result.rows[0].count);
      return { hasDuplicates: duplicateCount > 0, duplicateCount };
    } catch (error) {
      return { hasDuplicates: false, duplicateCount: 0 };
    }
  }

  private async validateVerificationCode(code: string, excludeVoteId: number): Promise<{ isValid: boolean; issue?: string }> {
    try {
      const result = await pool.query(
        'SELECT id FROM "Vote" WHERE verification_code = $1 AND id != $2',
        [code, excludeVoteId]
      );

      if (result.rows.length > 0) {
        return { isValid: false, issue: 'Verification code not unique' };
      }

      if (code.length < 8) {
        return { isValid: false, issue: 'Verification code too short' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, issue: 'Database error during code validation' };
    }
  }

  private async analyzeVotingTiming(userId: number, voteTimestamp: Date): Promise<{ isSuspicious: boolean; issue?: string; riskScore: number }> {
    try {
      // Check if user voted multiple times within a short time period
      const result = await pool.query(`
        SELECT voted_at FROM "Vote"
        WHERE user_id = $1 AND voted_at >= $2::timestamp - INTERVAL '5 minutes'
        ORDER BY voted_at
      `, [userId, voteTimestamp]);

      if (result.rows.length > 5) {
        return {
          isSuspicious: true,
          issue: 'Multiple votes within 5 minutes',
          riskScore: 15
        };
      }

      return { isSuspicious: false, riskScore: 0 };
    } catch (error) {
      return { isSuspicious: false, riskScore: 0 };
    }
  }

  private async analyzeVotingTimingByVoucher(voucher: string, voteTimestamp: Date): Promise<{ isSuspicious: boolean; issue?: string; riskScore: number }> {
    try {
      // In the new system, users should only have one vote total
      // Check if user has multiple votes (which shouldn't happen)
      const result = await pool.query(`
        SELECT voted_at FROM "Vote"
        WHERE voucher = $1
        ORDER BY voted_at
      `, [voucher]);

      if (result.rows.length > 2) {
        return {
          isSuspicious: true,
          issue: 'User has more than 2 votes (should only have 2 - one for each position)',
          riskScore: 30
        };
      }

      return { isSuspicious: false, riskScore: 0 };
    } catch (error) {
      return { isSuspicious: false, riskScore: 0 };
    }
  }

  private async verifyVoteIntegrity(vote: any): Promise<{ isValid: boolean; issue?: string }> {
    try {
      // Basic integrity checks
      if (!vote.user_id || !vote.candidate_id || !vote.position_id) {
        return { isValid: false, issue: 'Missing required vote data' };
      }

      if (vote.voted_at > new Date()) {
        return { isValid: false, issue: 'Vote timestamp is in the future' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, issue: 'Error during integrity verification' };
    }
  }

  private async detectRapidVoting(): Promise<{ isSuspicious: boolean; riskScore: number; details: any }> {
    try {
      // Find users who voted multiple times within short intervals
      const query = `
        SELECT
          user_id,
          COUNT(*) as vote_count,
          ARRAY_AGG(voted_at ORDER BY voted_at) as timestamps
        FROM "Vote"
        WHERE voted_at >= NOW() - INTERVAL '1 hour'
        GROUP BY user_id
        HAVING COUNT(*) > 3
      `;

      const result = await pool.query(query);

      if (result.rows.length > 0) {
        return {
          isSuspicious: true,
          riskScore: result.rows.length * 10,
          details: {
            suspiciousUsers: result.rows.length,
            maxVotesPerUser: Math.max(...result.rows.map(r => parseInt(r.vote_count)))
          }
        };
      }

      return { isSuspicious: false, riskScore: 0, details: {} };
    } catch (error) {
      return { isSuspicious: false, riskScore: 0, details: {} };
    }
  }

  private async analyzeVoteConcentration(): Promise<{ isSuspicious: boolean; riskScore: number; details: any }> {
    try {
      // Check if votes are concentrated on few candidates unusually
      const query = `
        SELECT
          candidate_id,
          COUNT(*) as vote_count,
          (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()) as vote_percentage
        FROM "Vote"
        GROUP BY candidate_id
        ORDER BY vote_count DESC
      `;

      const result = await pool.query(query);

      if (result.rows.length > 0) {
        const topCandidatePercentage = parseFloat(result.rows[0].vote_percentage);

        if (topCandidatePercentage > 60) {
          return {
            isSuspicious: true,
            riskScore: (topCandidatePercentage - 60) * 2,
            details: {
              topCandidatePercentage,
              totalCandidates: result.rows.length
            }
          };
        }
      }

      return { isSuspicious: false, riskScore: 0, details: {} };
    } catch (error) {
      return { isSuspicious: false, riskScore: 0, details: {} };
    }
  }

  private async analyzeTimingPatterns(): Promise<{ isSuspicious: boolean; riskScore: number; details: any }> {
    try {
      // Analyze voting patterns by hour
      const query = `
        SELECT
          EXTRACT(hour FROM voted_at) as hour,
          COUNT(*) as vote_count
        FROM "Vote"
        WHERE voted_at >= NOW() - INTERVAL '24 hours'
        GROUP BY EXTRACT(hour FROM created_at)
        ORDER BY hour
      `;

      const result = await pool.query(query);

      // Check for unusual patterns (e.g., all votes at exact same time)
      const voteCounts = result.rows.map(r => parseInt(r.vote_count));
      const maxVotes = Math.max(...voteCounts);
      const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

      if (maxVotes > totalVotes * 0.8) {
        return {
          isSuspicious: true,
          riskScore: 30,
          details: {
            maxVotesInHour: maxVotes,
            totalVotes,
            concentrationRatio: maxVotes / totalVotes
          }
        };
      }

      return { isSuspicious: false, riskScore: 0, details: {} };
    } catch (error) {
      return { isSuspicious: false, riskScore: 0, details: {} };
    }
  }

  private async analyzeUserBehavior(): Promise<{ isSuspicious: boolean; riskScore: number; details: any }> {
    try {
      // In the new system, users should have exactly 2 votes (one for each position)
      // Find users who have more than 2 votes (which indicates a problem)
      const query = `
        SELECT
          voucher,
          COUNT(*) as total_votes,
          COUNT(DISTINCT position_id) as positions_voted
        FROM "Vote"
        GROUP BY voucher
        HAVING COUNT(*) > 2
      `;

      const result = await pool.query(query);

      if (result.rows.length > 0) {
        return {
          isSuspicious: true,
          riskScore: result.rows.length * 15,
          details: {
            usersWithExtraVotes: result.rows.length,
            maxVotesByUser: Math.max(...result.rows.map(r => parseInt(r.total_votes)))
          }
        };
      }

      return { isSuspicious: false, riskScore: 0, details: {} };
    } catch (error) {
      return { isSuspicious: false, riskScore: 0, details: {} };
    }
  }

  private categorizeIssueSeverity(issue: string): string {
    if (issue.includes('Duplicate votes') || issue.includes('Integrity issue')) {
      return 'critical';
    } else if (issue.includes('Invalid') || issue.includes('not found')) {
      return 'high';
    } else if (issue.includes('Suspicious')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateRecommendations(commonIssues: any[], riskDistribution: any): string[] {
    const recommendations: string[] = [];

    if (riskDistribution.critical > 0) {
      recommendations.push('Immediate investigation required for votes with critical risk scores');
    }

    if (riskDistribution.high > 0) {
      recommendations.push('Review votes with high risk scores for potential irregularities');
    }

    if (commonIssues.some(issue => issue.issue.includes('Duplicate'))) {
      recommendations.push('Implement stricter duplicate vote prevention mechanisms');
    }

    if (commonIssues.some(issue => issue.issue.includes('timing'))) {
      recommendations.push('Add rate limiting and timing validation to voting process');
    }

    if (commonIssues.some(issue => issue.issue.includes('verification code'))) {
      recommendations.push('Enhance verification code generation and validation');
    }

    if (recommendations.length === 0) {
      recommendations.push('No specific recommendations - voting process appears healthy');
    }

    return recommendations;
  }
}

export default new AuditService();