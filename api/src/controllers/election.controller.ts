// api/src/controllers/election.controller.ts

import { Request, Response } from "express";
import ElectionService from "../services/election.service";
import { LoggingService } from "../services/logging.service";

// --- Election schedule controller (add to src/controllers/election.controller.ts) ---
import pool from "../db/config"; // add this near other imports if not already present
const ELECTION_KEY = 'students_2025';

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const q = `
      SELECT election_key, start_date, end_date, results_announcement, updated_at, updated_by
      FROM election_schedule
      WHERE election_key = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(q, [ELECTION_KEY]);
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'not_configured' });

    return res.status(200).json({
      electionKey: row.election_key,
      startDate: row.start_date ? row.start_date.toISOString() : null,
      endDate: row.end_date ? row.end_date.toISOString() : null,
      resultsAnnouncement: row.results_announcement ? row.results_announcement.toISOString() : null,
      updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
      updatedBy: row.updated_by || null
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getSchedule' });
    return res.status(500).json({ error: 'server_error' });
  }
};

export const upsertSchedule = async (req: Request, res: Response) => {
  try {
    // =============================================
    // AUTHENTICATION COMPLETELY DISABLED
    // Remove or comment these lines – no token/admin required anymore
    // const requestingAdmin = (req as any).admin;
    // if (!requestingAdmin) return res.status(401).json({ error: 'Unauthorized' });
    // =============================================

    // Hardcode a valid admin for the "updated_by" column
    // Change id: 1 to whatever admin ID you want to appear in the DB
    const requestingAdmin = { id: 1, role: 'super_admin' };

    const { startDate, endDate, resultsAnnouncement } = req.body || {};
    if (!startDate || !endDate) 
      return res.status(400).json({ error: 'startDate_and_endDate_required' });

    const s = new Date(startDate);
    const e = new Date(endDate);
    const r = resultsAnnouncement ? new Date(resultsAnnouncement) : null;

    if (isNaN(s.getTime()) || isNaN(e.getTime())) 
      return res.status(400).json({ error: 'invalid_date_format' });
    if (e <= s) 
      return res.status(400).json({ error: 'end_must_be_after_start' });
    if (r && isNaN(r.getTime())) 
      return res.status(400).json({ error: 'invalid_resultsAnnouncement' });

    const upsertSql = `
      INSERT INTO election_schedule (election_key, start_date, end_date, results_announcement, updated_at, updated_by)
      VALUES ($1, $2, $3, $4, now(), $5)
      ON CONFLICT (election_key) DO UPDATE SET
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        results_announcement = EXCLUDED.results_announcement,
        updated_at = now(),
        updated_by = EXCLUDED.updated_by
      RETURNING election_key, start_date, end_date, results_announcement, updated_at, updated_by;
    `;

    const vals = [
      ELECTION_KEY,
      s.toISOString(),
      e.toISOString(),
      r ? r.toISOString() : null,
      requestingAdmin.id
    ];

    const { rows } = await pool.query(upsertSql, vals);
    const saved = rows[0];

    return res.status(200).json({
      electionKey: saved.election_key,
      startDate: saved.start_date,
      endDate: saved.end_date,
      resultsAnnouncement: saved.results_announcement,
      updatedAt: saved.updated_at,
      updatedBy: saved.updated_by
    });

  } catch (err: any) {
    LoggingService.logError(err, { context: 'upsertSchedule' });
    return res.status(500).json({ error: 'server_error' });
  }
};


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