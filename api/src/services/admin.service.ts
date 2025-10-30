import pool from "../db/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { LoggingService } from "./logging.service";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export class AdminService {
  private static SALT_ROUNDS = 12;

  async createAdminUser(username: string, email: string, password: string, role: AdminUser['role'] = 'admin'): Promise<AdminUser> {
    try {
      const hashedPassword = await bcrypt.hash(password, AdminService.SALT_ROUNDS);

      const result = await pool.query(
        `INSERT INTO "AdminUser"(username, email, password_hash, role, is_active, created_at)
         VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING id, username, email, role, is_active, created_at`,
        [username, email, hashedPassword, role, true]
      );

      const admin = result.rows[0];
      LoggingService.logAdminAction('system', 'CREATE_ADMIN', username, { role, email });

      return admin;
    } catch (error: any) {
      LoggingService.logError(error, { context: 'createAdminUser', username, email });
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Username or email already exists');
      }
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
  }

  async authenticateAdmin(email: string, password: string): Promise<{ token: string; admin: AdminUser } | null> {
    try {
      const result = await pool.query(
        `SELECT id, username, email, password_hash, role, is_active, last_login, created_at
         FROM "AdminUser" WHERE email = $1 AND is_active = true`,
        [email]
      );

      if (result.rows.length === 0) {
        LoggingService.logSecurity('ADMIN_LOGIN_FAILED', { email, reason: 'user_not_found' });
        return null;
      }

      const admin = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);

      if (!isValidPassword) {
        LoggingService.logSecurity('ADMIN_LOGIN_FAILED', { email, reason: 'invalid_password' });
        return null;
      }

      // Update last login
      await pool.query(
        `UPDATE "AdminUser" SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
        [admin.id]
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          type: 'admin'
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h' }
      );

      LoggingService.logAuth(admin.id.toString(), 'ADMIN_LOGIN');

      return {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          isActive: admin.is_active,
          lastLogin: admin.last_login,
          createdAt: admin.created_at
        }
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'authenticateAdmin', email });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getAdminById(id: number): Promise<AdminUser | null> {
    try {
      const result = await pool.query(
        `SELECT id, username, email, role, is_active, last_login, created_at
         FROM "AdminUser" WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const admin = result.rows[0];
      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active,
        lastLogin: admin.last_login,
        createdAt: admin.created_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getAdminById', id });
      throw new Error(`Failed to fetch admin: ${error.message}`);
    }
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const result = await pool.query(
        `SELECT id, username, email, role, is_active, last_login, created_at
         FROM "AdminUser" ORDER BY created_at DESC`
      );

      return result.rows.map((admin: any) => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active,
        lastLogin: admin.last_login,
        createdAt: admin.created_at
      }));
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getAllAdmins' });
      throw new Error(`Failed to fetch admins: ${error.message}`);
    }
  }

  async updateAdminRole(adminId: number, newRole: AdminUser['role'], updatedBy: number): Promise<AdminUser> {
    try {
      const result = await pool.query(
        `UPDATE "AdminUser" SET role = $1 WHERE id = $2 AND is_active = true
         RETURNING id, username, email, role, is_active, last_login, created_at`,
        [newRole, adminId]
      );

      if (result.rows.length === 0) {
        throw new Error('Admin not found or inactive');
      }

      const admin = result.rows[0];
      LoggingService.logAdminAction(updatedBy.toString(), 'UPDATE_ADMIN_ROLE', adminId.toString(), { newRole });

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active,
        lastLogin: admin.last_login,
        createdAt: admin.created_at
      };
    } catch (error: any) {
      LoggingService.logError(error, { context: 'updateAdminRole', adminId, newRole, updatedBy });
      throw new Error(`Failed to update admin role: ${error.message}`);
    }
  }

  async deactivateAdmin(adminId: number, deactivatedBy: number): Promise<void> {
    try {
      const result = await pool.query(
        `UPDATE "AdminUser" SET is_active = false WHERE id = $1`,
        [adminId]
      );

      if (result.rowCount === 0) {
        throw new Error('Admin not found');
      }

      LoggingService.logAdminAction(deactivatedBy.toString(), 'DEACTIVATE_ADMIN', adminId.toString());
    } catch (error: any) {
      LoggingService.logError(error, { context: 'deactivateAdmin', adminId, deactivatedBy });
      throw new Error(`Failed to deactivate admin: ${error.message}`);
    }
  }

  async changePassword(adminId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get current admin with password hash
      const result = await pool.query(
        `SELECT password_hash FROM "AdminUser" WHERE id = $1 AND is_active = true`,
        [adminId]
      );

      if (result.rows.length === 0) {
        throw new Error('Admin not found');
      }

      const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, AdminService.SALT_ROUNDS);

      await pool.query(
        `UPDATE "AdminUser" SET password_hash = $1 WHERE id = $2`,
        [hashedNewPassword, adminId]
      );

      LoggingService.logAdminAction(adminId.toString(), 'PASSWORD_CHANGE');
    } catch (error: any) {
      LoggingService.logError(error, { context: 'changePassword', adminId });
      throw error;
    }
  }

  async getAdminStats(): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT
          COUNT(*) as total_admins,
          COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_today,
          COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
          COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators
         FROM "AdminUser" WHERE is_active = true`
      );

      return result.rows[0];
    } catch (error: any) {
      LoggingService.logError(error, { context: 'getAdminStats' });
      throw new Error(`Failed to fetch admin stats: ${error.message}`);
    }
  }
}

export default new AdminService();