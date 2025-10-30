import pool from "../db/config";
import { LoggingService } from "./logging.service";

export interface ElectionStatus {
  id: number;
  status: 'not_started' | 'active' | 'paused' | 'completed' | 'cancelled';
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  settings: {
    allowVoting: boolean;
    showResults: boolean;
    requireVerification: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ElectionService {
  async getElectionStatus(): Promise<ElectionStatus> {
    try {
      const result = await pool.query(
        'SELECT id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at FROM "ElectionStatus" ORDER BY id DESC LIMIT 1'
      );

      if (result.rows.length === 0) {
        // Create default election status if none exists
        return await this.createDefaultElectionStatus();
      }

      const status = result.rows[0];
      return {
        id: status.id,
        status: status.status,
        startedAt: status.started_at,
        pausedAt: status.paused_at,
        completedAt: status.completed_at,
        cancelledAt: status.cancelled_at,
        settings: status.settings || {
          allowVoting: false,
          showResults: false,
          requireVerification: true
        },
        createdAt: status.created_at,
        updatedAt: status.updated_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getElectionStatus' });
      throw new Error(`Failed to get election status: ${error.message}`);
    }
  }

  async createDefaultElectionStatus(): Promise<ElectionStatus> {
    try {
      const result = await pool.query(
        `INSERT INTO "ElectionStatus"(status, settings, created_at, updated_at)
         VALUES($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at`,
        ['not_started', {
          allowVoting: false,
          showResults: false,
          requireVerification: true
        }]
      );

      const status = result.rows[0];
      LoggingService.logAdminAction('system', 'CREATE_ELECTION_STATUS', 'default', { status: status.status });

      return {
        id: status.id,
        status: status.status,
        startedAt: status.started_at,
        pausedAt: status.paused_at,
        completedAt: status.completed_at,
        cancelledAt: status.cancelled_at,
        settings: status.settings,
        createdAt: status.created_at,
        updatedAt: status.updated_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'createDefaultElectionStatus' });
      throw new Error(`Failed to create election status: ${error.message}`);
    }
  }

  async startElection(): Promise<ElectionStatus> {
    try {
      // Update current election status to active
      const result = await pool.query(
        `UPDATE "ElectionStatus"
         SET status = 'active', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE status IN ('not_started', 'paused')
         RETURNING id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at`
      );

      if (result.rows.length === 0) {
        throw new Error('No election found to start');
      }

      const status = result.rows[0];
      LoggingService.logAdminAction('system', 'START_ELECTION', status.id.toString());

      return {
        id: status.id,
        status: status.status,
        startedAt: status.started_at,
        pausedAt: status.paused_at,
        completedAt: status.completed_at,
        cancelledAt: status.cancelled_at,
        settings: status.settings,
        createdAt: status.created_at,
        updatedAt: status.updated_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'startElection' });
      throw new Error(`Failed to start election: ${error.message}`);
    }
  }

  async pauseElection(): Promise<ElectionStatus> {
    try {
      const result = await pool.query(
        `UPDATE "ElectionStatus"
         SET status = 'paused', paused_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE status = 'active'
         RETURNING id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at`
      );

      if (result.rows.length === 0) {
        throw new Error('No active election found to pause');
      }

      const status = result.rows[0];
      LoggingService.logAdminAction('system', 'PAUSE_ELECTION', status.id.toString());

      return {
        id: status.id,
        status: status.status,
        startedAt: status.started_at,
        pausedAt: status.paused_at,
        completedAt: status.completed_at,
        cancelledAt: status.cancelled_at,
        settings: status.settings,
        createdAt: status.created_at,
        updatedAt: status.updated_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'pauseElection' });
      throw new Error(`Failed to pause election: ${error.message}`);
    }
  }

  async completeElection(): Promise<ElectionStatus> {
    try {
      const result = await pool.query(
        `UPDATE "ElectionStatus"
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE status = 'active'
         RETURNING id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at`
      );

      if (result.rows.length === 0) {
        throw new Error('No active election found to complete');
      }

      const status = result.rows[0];
      LoggingService.logAdminAction('system', 'COMPLETE_ELECTION', status.id.toString());

      return {
        id: status.id,
        status: status.status,
        startedAt: status.started_at,
        pausedAt: status.paused_at,
        completedAt: status.completed_at,
        cancelledAt: status.cancelled_at,
        settings: status.settings,
        createdAt: status.created_at,
        updatedAt: status.updated_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'completeElection' });
      throw new Error(`Failed to complete election: ${error.message}`);
    }
  }

  async cancelElection(): Promise<ElectionStatus> {
    try {
      const result = await pool.query(
        `UPDATE "ElectionStatus"
         SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE status IN ('not_started', 'active', 'paused')
         RETURNING id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at`
      );

      if (result.rows.length === 0) {
        throw new Error('No election found to cancel');
      }

      const status = result.rows[0];
      LoggingService.logAdminAction('system', 'CANCEL_ELECTION', status.id.toString());

      return {
        id: status.id,
        status: status.status,
        startedAt: status.started_at,
        pausedAt: status.paused_at,
        completedAt: status.completed_at,
        cancelledAt: status.cancelled_at,
        settings: status.settings,
        createdAt: status.created_at,
        updatedAt: status.updated_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'cancelElection' });
      throw new Error(`Failed to cancel election: ${error.message}`);
    }
  }

  async updateElectionSettings(settings: Partial<ElectionStatus['settings']>): Promise<ElectionStatus> {
    try {
      // Get current settings
      const currentStatus = await this.getElectionStatus();
      const updatedSettings = { ...currentStatus.settings, ...settings };

      const result = await pool.query(
        `UPDATE "ElectionStatus"
         SET settings = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at`,
        [updatedSettings, currentStatus.id]
      );

      const status = result.rows[0];
      LoggingService.logAdminAction('system', 'UPDATE_ELECTION_SETTINGS', currentStatus.id.toString(), { settings });

      return {
        id: status.id,
        status: status.status,
        startedAt: status.started_at,
        pausedAt: status.paused_at,
        completedAt: status.completed_at,
        cancelledAt: status.cancelled_at,
        settings: status.settings,
        createdAt: status.created_at,
        updatedAt: status.updated_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'updateElectionSettings' });
      throw new Error(`Failed to update election settings: ${error.message}`);
    }
  }

  async getElectionHistory(): Promise<ElectionStatus[]> {
    try {
      const result = await pool.query(
        'SELECT id, status, started_at, paused_at, completed_at, cancelled_at, settings, created_at, updated_at FROM "ElectionStatus" ORDER BY created_at DESC'
      );

      return result.rows.map(row => ({
        id: row.id,
        status: row.status,
        startedAt: row.started_at,
        pausedAt: row.paused_at,
        completedAt: row.completed_at,
        cancelledAt: row.cancelled_at,
        settings: row.settings,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getElectionHistory' });
      throw new Error(`Failed to get election history: ${error.message}`);
    }
  }
}

export default new ElectionService();