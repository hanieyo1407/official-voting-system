// api/src/controllers/election.controller.ts

import { Request, Response } from "express";
import ElectionService from "../services/election.service";
import { LoggingService } from "../services/logging.service";

// --- NEW POSITION/CANDIDATE FETCHING CONTROLLER ---
/**
 * Fetches all positions with their candidates from the ElectionService.
 * This is the public facing list for voting and admin views.
 */
export const getAllPositionsWithCandidates = async (req: Request, res: Response) => {
  try {
    const positions = await ElectionService.getAllPositionsWithCandidates();

    return res.status(200).json({
      positions: positions.map(p => ({
        id: p.id,
        name: p.positionName,
        candidates: p.candidates.map(c => ({
          id: c.id,
          name: c.name,
          manifesto: c.manifesto,
          positionId: c.positionId,
          imageUrl: c.imageUrl 
        }))
      }))
    });

  } catch (err: any) {
    LoggingService.logError(err, { context: "getAllPositionsWithCandidates" });
    return res.status(500).json({ error: "Failed to fetch election positions and candidates." });
  }
};

// --- END NEW CONTROLLER ---


export const getElectionStatus = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only super_admin and admin can view election status
    if (!['super_admin', 'admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const electionStatus = await ElectionService.getElectionStatus();

    return res.status(200).json({
      electionStatus: {
        id: electionStatus.id,
        status: electionStatus.status,
        startedAt: electionStatus.startedAt,
        pausedAt: electionStatus.pausedAt,
        completedAt: electionStatus.completedAt,
        cancelledAt: electionStatus.cancelledAt,
        settings: electionStatus.settings,
        createdAt: electionStatus.createdAt,
        updatedAt: electionStatus.updatedAt
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getElectionStatus' });
    return res.status(500).json({ error: "Failed to fetch election status" });
  }
};

export const startElection = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can start elections" });
    }

    const electionStatus = await ElectionService.startElection();

    return res.status(200).json({
      message: "Election started successfully",
      electionStatus: {
        id: electionStatus.id,
        status: electionStatus.status,
        startedAt: electionStatus.startedAt,
        settings: electionStatus.settings
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'startElection' });
    return res.status(500).json({ error: err.message || "Failed to start election" });
  }
};

export const pauseElection = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can pause elections" });
    }

    const electionStatus = await ElectionService.pauseElection();

    return res.status(200).json({
      message: "Election paused successfully",
      electionStatus: {
        id: electionStatus.id,
        status: electionStatus.status,
        pausedAt: electionStatus.pausedAt
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'pauseElection' });
    return res.status(500).json({ error: err.message || "Failed to pause election" });
  }
};

export const completeElection = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can complete elections" });
    }

    const electionStatus = await ElectionService.completeElection();

    return res.status(200).json({
      message: "Election completed successfully",
      electionStatus: {
        id: electionStatus.id,
        status: electionStatus.status,
        completedAt: electionStatus.completedAt
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'completeElection' });
    return res.status(500).json({ error: err.message || "Failed to complete election" });
  }
};

export const cancelElection = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can cancel elections" });
    }

    const electionStatus = await ElectionService.cancelElection();

    return res.status(200).json({
      message: "Election cancelled successfully",
      electionStatus: {
        id: electionStatus.id,
        status: electionStatus.status,
        cancelledAt: electionStatus.cancelledAt
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'cancelElection' });
    return res.status(500).json({ error: err.message || "Failed to cancel election" });
  }
};

export const updateElectionSettings = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { allowVoting, showResults, requireVerification } = req.body;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can update election settings" });
    }

    const settingsToUpdate: any = {};
    if (typeof allowVoting === 'boolean') settingsToUpdate.allowVoting = allowVoting;
    if (typeof showResults === 'boolean') settingsToUpdate.showResults = showResults;
    if (typeof requireVerification === 'boolean') settingsToUpdate.requireVerification = requireVerification;

    if (Object.keys(settingsToUpdate).length === 0) {
      return res.status(400).json({ error: "No valid settings provided" });
    }

    const electionStatus = await ElectionService.updateElectionSettings(settingsToUpdate);

    return res.status(200).json({
      message: "Election settings updated successfully",
      electionStatus: {
        id: electionStatus.id,
        status: electionStatus.status,
        settings: electionStatus.settings
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'updateElectionSettings' });
    return res.status(500).json({ error: "Failed to update election settings" });
  }
};

export const getElectionHistory = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only super_admin and admin can view election history
    if (!['super_admin', 'admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const electionHistory = await ElectionService.getElectionHistory();

    return res.status(200).json({
      electionHistory: electionHistory.map(election => ({
        id: election.id,
        status: election.status,
        startedAt: election.startedAt,
        pausedAt: election.pausedAt,
        completedAt: election.completedAt,
        cancelledAt: election.cancelledAt,
        settings: election.settings,
        createdAt: election.createdAt,
        updatedAt: election.updatedAt
      }))
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getElectionHistory' });
    return res.status(500).json({ error: "Failed to fetch election history" });
  }
};