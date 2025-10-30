import { Request, Response } from "express";
import RunoffService from "../services/runoff.service";
import { LoggingService } from "../services/logging.service";

export const getRunoffElections = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only super_admin and admin can view runoff elections
    if (!['super_admin', 'admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const runoffElections = await RunoffService.getRunoffElections();

    return res.status(200).json({
      runoffElections: runoffElections.map(runoff => ({
        id: runoff.id,
        originalPositionId: runoff.originalPositionId,
        originalPositionName: runoff.originalPositionName,
        tiedCandidates: runoff.tiedCandidates,
        status: runoff.status,
        createdAt: runoff.createdAt,
        startedAt: runoff.startedAt,
        completedAt: runoff.completedAt,
        winnerCandidateId: runoff.winnerCandidateId
      }))
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getRunoffElections' });
    return res.status(500).json({ error: "Failed to fetch runoff elections" });
  }
};

export const getRunoffElection = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { runoffId } = req.params;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!['super_admin', 'admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (!runoffId) {
      return res.status(400).json({ error: "Runoff election ID is required" });
    }

    const runoffElection = await RunoffService.getRunoffElectionById(parseInt(runoffId));

    if (!runoffElection) {
      return res.status(404).json({ error: "Runoff election not found" });
    }

    if (!runoffElection) {
      return res.status(404).json({ error: "Runoff election not found" });
    }

    // Get runoff candidates and results
    const candidates = await RunoffService.getRunoffCandidates(runoffElection.id);
    const results = await RunoffService.getRunoffResults(runoffElection.id);

    return res.status(200).json({
      runoffElection: {
        id: runoffElection.id,
        originalPositionId: runoffElection.originalPositionId,
        originalPositionName: runoffElection.originalPositionName,
        tiedCandidates: runoffElection.tiedCandidates,
        status: runoffElection.status,
        createdAt: runoffElection.createdAt,
        startedAt: runoffElection.startedAt,
        completedAt: runoffElection.completedAt,
        winnerCandidateId: runoffElection.winnerCandidateId,
        candidates,
        results
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getRunoffElection' });
    return res.status(500).json({ error: "Failed to fetch runoff election" });
  }
};

export const startRunoffElection = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { runoffId } = req.params;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can start runoff elections" });
    }

    if (!runoffId) {
      return res.status(400).json({ error: "Runoff election ID is required" });
    }

    const runoffElection = await RunoffService.startRunoffElection(parseInt(runoffId));

    if (!runoffElection) {
      return res.status(404).json({ error: "Runoff election not found or already started" });
    }

    return res.status(200).json({
      message: "Runoff election started successfully",
      runoffElection: {
        id: runoffElection.id,
        originalPositionName: runoffElection.originalPositionName,
        tiedCandidates: runoffElection.tiedCandidates,
        status: runoffElection.status,
        startedAt: runoffElection.startedAt
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'startRunoffElection' });
    return res.status(500).json({ error: err.message || "Failed to start runoff election" });
  }
};

export const castRunoffVote = async (req: Request, res: Response) => {
  try {
    const { runoffElectionId, candidateId } = req.body;

    if (!runoffElectionId || !candidateId) {
      return res.status(400).json({
        error: "Runoff election ID and candidate ID are required"
      });
    }

    // For runoff voting, we need to get voucher from authenticated user
    // This assumes the user is logged in with their voucher
    const user = (req as any).user;
    if (!user || !user.voucher) {
      return res.status(401).json({ error: "User authentication required" });
    }

    const runoffVote = await RunoffService.castRunoffVote(
      parseInt(runoffElectionId),
      user.voucher,
      parseInt(candidateId)
    );

    return res.status(201).json({
      message: "Runoff vote cast successfully",
      runoffVote: {
        id: runoffVote.id,
        runoffElectionId: runoffVote.runoffElectionId,
        candidateId: runoffVote.candidateId,
        verificationCode: runoffVote.verificationCode,
        votedAt: runoffVote.votedAt
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'castRunoffVote' });
    if (err.message.includes('already voted')) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || "Failed to cast runoff vote" });
  }
};

export const completeRunoffElection = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { runoffId } = req.params;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can complete runoff elections" });
    }

    if (!runoffId) {
      return res.status(400).json({ error: "Runoff election ID is required" });
    }

    const runoffElection = await RunoffService.completeRunoffElection(parseInt(runoffId));

    if (!runoffElection) {
      return res.status(404).json({ error: "Runoff election not found" });
    }

    const results = await RunoffService.getRunoffResults(runoffElection.id);

    return res.status(200).json({
      message: "Runoff election completed successfully",
      runoffElection: {
        id: runoffElection.id,
        originalPositionName: runoffElection.originalPositionName,
        winnerCandidateId: runoffElection.winnerCandidateId,
        status: runoffElection.status,
        completedAt: runoffElection.completedAt
      },
      results
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'completeRunoffElection' });
    return res.status(500).json({ error: err.message || "Failed to complete runoff election" });
  }
};

export const detectAndCreateRunoffs = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can detect and create runoff elections" });
    }

    const runoffElections = await RunoffService.detectTiesAndCreateRunoffs();

    return res.status(200).json({
      message: `${runoffElections.length} runoff election(s) created`,
      runoffElections: runoffElections.map(runoff => ({
        id: runoff.id,
        originalPositionName: runoff.originalPositionName,
        tiedCandidates: runoff.tiedCandidates,
        status: runoff.status
      }))
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'detectAndCreateRunoffs' });
    return res.status(500).json({ error: "Failed to detect and create runoff elections" });
  }
};