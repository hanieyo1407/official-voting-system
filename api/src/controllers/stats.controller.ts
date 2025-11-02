// api/src/controllers/stats.controller.ts
// KEY FIX: Allow moderators to view all statistics (read-only)

import { Request, Response } from "express";
import StatsService from "../services/stats.service";
import { LoggingService } from "../services/logging.service";

export const getOverallStats = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // FIXED: Allow moderator, admin, and super_admin to view stats
    if (!['admin', 'super_admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const stats = await StatsService.getOverallVotingStats();

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'VIEW_STATS',
      'overall',
      { totalVoters: stats.totalVoters, totalVotes: stats.totalVotesCast }
    );

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getOverallStats' });
    return res.status(500).json({
      error: "Failed to fetch voting statistics",
      message: err.message
    });
  }
};

export const getVotingTrends = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // FIXED: Allow moderator, admin, and super_admin to view trends
    if (!['admin', 'super_admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const trends = await StatsService.getVotingTrends();

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'VIEW_TRENDS',
      'voting_trends'
    );

    return res.status(200).json({
      success: true,
      data: trends
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getVotingTrends' });
    return res.status(500).json({
      error: "Failed to fetch voting trends",
      message: err.message
    });
  }
};

export const getVoterDemographics = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // FIXED: Allow moderator, admin, and super_admin to view demographics
    if (!['admin', 'super_admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const demographics = await StatsService.getVoterDemographics();

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'VIEW_DEMOGRAPHICS',
      'voter_demographics'
    );

    return res.status(200).json({
      success: true,
      data: demographics
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getVoterDemographics' });
    return res.status(500).json({
      error: "Failed to fetch voter demographics",
      message: err.message
    });
  }
};

export const getPositionStats = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { positionId } = req.params;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // FIXED: Allow moderator, admin, and super_admin to view position stats
    if (!['admin', 'super_admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (!positionId) {
      return res.status(400).json({ error: "Position ID is required" });
    }

    const allStats = await StatsService.getOverallVotingStats();
    const positionStats = allStats.positionsWithStats.find(
      pos => pos.positionId === parseInt(positionId)
    );

    if (!positionStats) {
      return res.status(404).json({ error: "Position not found" });
    }

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'VIEW_POSITION_STATS',
      positionId,
      { positionName: positionStats.positionName }
    );

    return res.status(200).json({
      success: true,
      data: positionStats
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getPositionStats', positionId: req.params.positionId });
    return res.status(500).json({
      error: "Failed to fetch position statistics",
      message: err.message
    });
  }
};

export const getTopPerformingCandidates = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { limit = 10 } = req.query;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // FIXED: Allow moderator, admin, and super_admin to view top candidates
    if (!['admin', 'super_admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const allStats = await StatsService.getOverallVotingStats();

    // Flatten all candidates from all positions and sort by vote count
    const allCandidates = allStats.positionsWithStats
      .flatMap(position => position.candidates)
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, parseInt(limit as string));

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'VIEW_TOP_CANDIDATES',
      'top_performers',
      { limit: parseInt(limit as string) }
    );

    return res.status(200).json({
      success: true,
      data: allCandidates
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getTopPerformingCandidates' });
    return res.status(500).json({
      error: "Failed to fetch top performing candidates",
      message: err.message
    });
  }
};

export const getElectionSummary = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // FIXED: Allow moderator, admin, and super_admin to view election summary
    if (!['admin', 'super_admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const [overallStats, trends, demographics] = await Promise.all([
      StatsService.getOverallVotingStats(),
      StatsService.getVotingTrends(),
      StatsService.getVoterDemographics()
    ]);

    const summary = {
      overview: {
        totalVoters: overallStats.totalVoters,
        totalVotesCast: overallStats.totalVotesCast,
        voterTurnout: overallStats.voterTurnout,
        totalPositions: overallStats.overallStats.totalPositions,
        totalCandidates: overallStats.overallStats.totalCandidates
      },
      highlights: {
        mostVotedPosition: overallStats.overallStats.mostVotedPosition,
        leastVotedPosition: overallStats.overallStats.leastVotedPosition,
        averageVotesPerPosition: overallStats.overallStats.averageVotesPerPosition
      },
      recentActivity: {
        hourlyPattern: trends.hourlyPattern
      },
      voterInsights: {
        registrationTrends: demographics.registrationTrends.slice(0, 7),
        voteFrequencyDistribution: demographics.voteFrequencyDistribution
      }
    };

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'VIEW_ELECTION_SUMMARY'
    );

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getElectionSummary' });
    return res.status(500).json({
      error: "Failed to fetch election summary",
      message: err.message
    });
  }
};