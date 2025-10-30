// api/src/controllers/audit.controller.ts

import { Request, Response } from "express";
import AuditService from "../services/audit.service";
import { LoggingService } from "../services/logging.service";
import fs from 'fs';
import path from 'path';
import readline from 'readline';

export const auditSingleVote = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { voteId } = req.params;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // Only admin and super_admin can audit votes
    if (!['admin', 'super_admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (!voteId) {
      return res.status(400).json({ error: "Vote ID is required" });
    }

    const auditResult = await AuditService.auditVote(parseInt(voteId));

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'AUDIT_VOTE',
      voteId,
      {
        isValid: auditResult.isValid,
        riskScore: auditResult.riskScore,
        issues: auditResult.issues.length
      }
    );

    return res.status(200).json({
      success: true,
      data: auditResult
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'auditSingleVote', voteId: req.params.voteId });
    return res.status(500).json({
      error: "Failed to audit vote",
      message: err.message
    });
  }
};

export const auditAllVotes = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // Only super_admin can perform full audit
    if (requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const auditReport = await AuditService.auditAllVotes();

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'FULL_AUDIT',
      'all_votes',
      {
        totalAudited: auditReport.totalVotesAudited,
        validVotes: auditReport.validVotes,
        suspiciousVotes: auditReport.suspiciousVotes,
        invalidVotes: auditReport.invalidVotes
      }
    );

    return res.status(200).json({
      success: true,
      data: auditReport
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'auditAllVotes' });
    return res.status(500).json({
      error: "Failed to perform full audit",
      message: err.message
    });
  }
};

export const detectFraud = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // Only admin and super_admin can run fraud detection
    if (!['admin', 'super_admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const fraudResult = await AuditService.detectFraudPatterns();

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'FRAUD_DETECTION',
      'system_wide',
      {
        isSuspicious: fraudResult.isSuspicious,
        riskLevel: fraudResult.riskLevel,
        confidence: fraudResult.confidence,
        riskFactors: fraudResult.riskFactors.length
      }
    );

    return res.status(200).json({
      success: true,
      data: fraudResult
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'detectFraud' });
    return res.status(500).json({
      error: "Failed to run fraud detection",
      message: err.message
    });
  }
};

// ADDED: Helper function to find the latest log file name
const getLatestLogFilePath = () => {
    const logDir = path.join(__dirname, '../../logs');
    
    // Check if the directory exists
    if (!fs.existsSync(logDir)) {
        return null;
    }

    // Get all files, filter for voting logs, and find the latest one
    const logFiles = fs.readdirSync(logDir)
        .filter(file => file.startsWith('voting-') && file.endsWith('.log'))
        .sort() // Sorts them alphabetically, which works for date strings (e.g., '2025-10-27' < '2025-10-28')
        .reverse(); // Newest file is now at index 0
        
    if (logFiles.length === 0) {
        return null;
    }

    return path.join(logDir, logFiles[0]); // Return the full path to the newest log file
};

// CORRECTED IMPLEMENTATION: Reads logs from Winston file
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { limit = 50, offset = 0 } = req.query;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // Only admin and super_admin can view audit logs
    if (!['admin', 'super_admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // CRITICAL FIX: Get the latest log file, regardless of date
    const logFilePath = getLatestLogFilePath();

    // Guard against file not found (e.g., if the server just started or no files exist)
    if (!logFilePath || !fs.existsSync(logFilePath)) {
         return res.status(200).json({
           success: true,
           data: { logs: [], total: 0 } 
         });
    }

    const fileStream = fs.createReadStream(logFilePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const logs: any[] = [];
    
    // Read file line by line
    for await (const line of rl) {
      try {
        // Log entries are saved as JSON per line
        const entry = JSON.parse(line);
        // Filter: Only include entries that the frontend cares about (ADMIN, AUDIT, SECURITY)
        if (entry.category === 'ADMIN' || entry.category === 'AUDIT' || entry.category === 'SECURITY') {
             
             // Map the complex Winston JSON to the simple AuditLogEntry interface
             logs.push({
                 id: entry.timestamp + entry.action, // Use a unique string ID
                 timestamp: new Date(entry.timestamp), // Convert ISO string to Date object
                 adminUsername: entry.adminId || entry.userId || 'system', // Use the best available ID
                 action: entry.action || entry.event,
                 details: JSON.stringify(entry.details || entry.message || entry.error || {}).slice(0, 100), // Summarize details
                 ipAddress: entry.ip || 'N/A'
             });
        }
      } catch (_) {
        // Silently ignore malformed lines
      }
    }
    
    // Reverse logs to show newest first (Winston writes oldest first)
    logs.reverse();

    const start = Number(offset);
    const limitNum = Number(limit);
    const paginated = logs.slice(start, start + limitNum);

    LoggingService.logAdminAction(requestingAdmin.id, 'VIEW_AUDIT_LOGS', 'audit_log_list', { count: paginated.length });

    return res.status(200).json({
      success: true,
      // CRITICAL FIX: Return logs under the 'logs' key as the frontend expects
      data: { logs: paginated, total: logs.length } 
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getAuditLogs' });
    return res.status(500).json({
      error: "Failed to fetch audit logs",
      message: err.message
    });
  }
};


export const getSuspiciousVotes = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { threshold = 30 } = req.query;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // Only admin and super_admin can view suspicious votes
    if (!['admin', 'super_admin'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Get all votes and filter suspicious ones
    const pool = require('../db/config');
    const allVotesQuery = `
      SELECT v.*, u.voucher, c.name as candidate_name, p.position_name
      FROM "Vote" v
      JOIN "User" u ON v.voucher = u.voucher
      JOIN "Candidate" c ON v.candidate_id = c.id
      JOIN "Position" p ON v.position_id = p.id
      ORDER BY v.created_at DESC
    `;

    const allVotesResult = await pool.query(allVotesQuery);

    const suspiciousVotes = [];

    for (const vote of allVotesResult.rows) {
      // Simple heuristic for suspicious votes
      const issues = [];

      // Check for potential duplicates
      const duplicateQuery = `
        SELECT COUNT(*) as count FROM "Vote"
        WHERE voucher = $1 AND position_id = $2 AND id != $3
      `;
      // NOTE: Original code used vote.user_id which is incorrect/not in SELECT. Using vote.voucher.
      const duplicateResult = await pool.query(duplicateQuery, [vote.voucher, vote.position_id, vote.id]); 
      const duplicateCount = parseInt(duplicateResult.rows[0].count);

      if (duplicateCount > 0) {
        issues.push(`Duplicate votes: ${duplicateCount}`);
      }

      // Check timing
      const timingQuery = `
        SELECT COUNT(*) as count FROM "Vote"
        WHERE voucher = $1 AND voted_at >= $2::timestamp - INTERVAL '5 minutes'
      `;
      // NOTE: Original code used vote.user_id and vote.created_at which is incorrect/not in SELECT. Using vote.voucher and vote.voted_at.
      const timingResult = await pool.query(timingQuery, [vote.voucher, vote.voted_at]); 
      const recentVotes = parseInt(timingResult.rows[0].count);

      if (recentVotes > 3) {
        issues.push(`Multiple votes in short time: ${recentVotes}`);
      }

      if (issues.length > 0) {
        suspiciousVotes.push({
          voteId: vote.id,
          voucher: vote.voucher,
          candidateName: vote.candidate_name,
          positionName: vote.position_name,
          timestamp: vote.voted_at,
          issues,
          riskScore: Math.min(issues.length * 25, 100)
        });
      }
    }

    // Filter by threshold
    const filteredVotes = suspiciousVotes.filter(vote => vote.riskScore >= parseInt(threshold as string));

    LoggingService.logAdminAction(
      requestingAdmin.id,
      'VIEW_SUSPICIOUS_VOTES',
      'filtered_list',
      {
        threshold: parseInt(threshold as string),
        totalSuspicious: filteredVotes.length
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        suspiciousVotes: filteredVotes,
        totalCount: filteredVotes.length,
        threshold: parseInt(threshold as string)
      }
    });
  } catch (err: any) {
    LoggingService.logError(err, { context: 'getSuspiciousVotes' });
    return res.status(500).json({
      error: "Failed to fetch suspicious votes",
      message: err.message
    });
  }
};