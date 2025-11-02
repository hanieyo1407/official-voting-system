// api/src/controllers/audit.controller.ts
// CRITICAL FIX: Updated to parse Winston's actual log format

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

// Helper function to find the latest log file name
// Helper function to find the latest log file name
const getLatestLogFilePath = () => {
    const logDir = path.join(__dirname, '../../logs');
    
    if (!fs.existsSync(logDir)) {
        return null;
    }

    const logFiles = fs.readdirSync(logDir)
        .filter(file => file.startsWith('voting-') && file.endsWith('.log'))
        .sort()
        .reverse();
        
    if (logFiles.length === 0) {
        return null;
    }

    return path.join(logDir, logFiles[0]);
};

// CRITICAL FIX: Parse Winston's actual log format more robustly
// Handles any level (not just [INFO]), adds 'ERROR' category
// Format: "YYYY-MM-DD HH:MM:SS [LEVEL]: Message | {json}"
// Gracefully handles timestamps with 'T' (ISO)
const parseWinstonLogLine = (line: string): any | null => {
    try {
        // Normalize timestamp if it has 'T' (common in Winston ISO)
        let normalizedLine = line.replace(/T/, ' ').replace(/\.\d{3}Z?/, ''); // Remove ms and Z if present

        // Find the pipe separator that comes before the JSON
        const pipeIndex = normalizedLine.indexOf(' | {');
        if (pipeIndex === -1) {
            // No JSON object in this line, skip it
            return null;
        }

        // Extract timestamp (first 19 characters: "YYYY-MM-DD HH:MM:SS")
        const timestamp = normalizedLine.substring(0, 19).trim();
        
        // Extract the JSON part (after " | ")
        const jsonPart = normalizedLine.substring(pipeIndex + 3).trim();
        
        // Parse the JSON
        const logData = JSON.parse(jsonPart);
        
        // Only process logs we care about
        const relevantCategories = ['ADMIN', 'AUDIT', 'SECURITY', 'AUTH', 'ERROR']; // ADDED 'ERROR'
        if (!relevantCategories.includes(logData.category)) {
            return null;
        }

        // Extract action from the message part
        const messagePart = normalizedLine.substring(20, pipeIndex).trim(); // Skip timestamp
        const actionMatch = messagePart.match(/\[\w+\]:\s*(.+?)(?:\s*\|)?$/); // UPDATED regex for any level (e.g., [ERROR], [WARN])
        const action = actionMatch ? actionMatch[1].trim() : 'UNKNOWN';

        // Construct the log entry for frontend
        return {
            timestamp: timestamp,
            category: logData.category,
            action: action,
            service: logData.service || 'voting-system',
            adminId: logData.adminId || logData.userId || null,
            details: logData.details || logData,
            auditEvent: logData.auditEvent
        };
    } catch (err) {
        // Silently skip malformed lines
        return null;
    }
};

// ALTERNATIVE: If your logs are JSON lines (e.g., {"timestamp":"2025-11-02T07:35:19Z","level":"info","message":"Audit Event",...})
// Replace the above parseWinstonLogLine with this and test
// const parseWinstonLogLine = (line: string): any | null => {
//     try {
//         const logData = JSON.parse(line);
//         const relevantCategories = ['ADMIN', 'AUDIT', 'SECURITY', 'AUTH', 'ERROR'];
//         if (!logData.category || !relevantCategories.includes(logData.category)) {
//             return null;
//         }
//         const timestamp = new Date(logData.timestamp).toISOString().replace('T', ' ').slice(0, 19); // Normalize to "YYYY-MM-DD HH:MM:SS"
//         const action = logData.message || 'UNKNOWN';
//         return {
//             timestamp,
//             category: logData.category,
//             action,
//             service: logData.service || 'voting-system',
//             adminId: logData.adminId || logData.userId || null,
//             details: logData.details || logData,
//             auditEvent: logData.auditEvent
//         };
//     } catch (err) {
//         return null;
//     }
// };

// FIXED: Read and parse Winston logs correctly
// FIXED: Read and parse Winston logs correctly
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const requestingAdmin = (req as any).admin;
    const { limit = 100, offset = 0 } = req.query;

    if (!requestingAdmin) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // FIXED: Allow moderator, admin, and super_admin to view audit logs
    if (!['admin', 'super_admin', 'moderator'].includes(requestingAdmin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const logFilePath = getLatestLogFilePath();

    if (!logFilePath || !fs.existsSync(logFilePath)) {
         return res.status(200).json({
           success: true,
           data: { logs: [], total: 0 } 
         });
    }

    const fileStream = fs.createReadStream(logFilePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const parsedLogs: any[] = [];
    
    // Read file line by line
    for await (const line of rl) {
      // TEMP DEBUG: Log first few lines to console to inspect format
      // if (parsedLogs.length < 5) console.log('Raw log line:', line);
      const parsed = parseWinstonLogLine(line);
      if (parsed) {
        parsedLogs.push(parsed);
      }
    }
    
    // Reverse logs to show newest first (Winston writes oldest first)
    parsedLogs.reverse();

    // TEMP DEBUG: Log parsed count
    // console.log(`Parsed ${parsedLogs.length} logs from ${logFilePath}`);

    // Transform to frontend format
    const logs = parsedLogs.map((entry, index) => ({
        id: `${entry.timestamp}-${index}`, // Unique ID
        timestamp: entry.timestamp, // Keep as ISO string
        adminUsername: entry.adminId ? String(entry.adminId) : 'system', // FIXED: Convert adminId to string to avoid TypeError on toLowerCase()
        action: entry.action || entry.auditEvent || 'UNKNOWN',
        details: typeof entry.details === 'string' 
            ? entry.details 
            : JSON.stringify(entry.details).slice(0, 200), // Truncate long details
        ipAddress: entry.details?.ip || 'N/A'
    }));

    const start = Number(offset);
    const limitNum = Number(limit);
    const paginated = logs.slice(start, start + limitNum);

    LoggingService.logAdminAction(
        requestingAdmin.id, 
        'VIEW_AUDIT_LOGS', 
        'audit_log_list', 
        { count: paginated.length, role: requestingAdmin.role }
    );

    return res.status(200).json({
      success: true,
      data: { 
        logs: paginated, 
        total: logs.length 
      } 
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
      const issues = [];

      const duplicateQuery = `
        SELECT COUNT(*) as count FROM "Vote"
        WHERE voucher = $1 AND position_id = $2 AND id != $3
      `;
      const duplicateResult = await pool.query(duplicateQuery, [vote.voucher, vote.position_id, vote.id]); 
      const duplicateCount = parseInt(duplicateResult.rows[0].count);

      if (duplicateCount > 0) {
        issues.push(`Duplicate votes: ${duplicateCount}`);
      }

      const timingQuery = `
        SELECT COUNT(*) as count FROM "Vote"
        WHERE voucher = $1 AND voted_at >= $2::timestamp - INTERVAL '5 minutes'
      `;
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