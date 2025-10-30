import request from 'supertest';
import { Application } from 'express';
import jwt from 'jsonwebtoken';

export interface TestUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Create test app instance for testing
 */
export function createTestApp(app: Application) {
  return request(app);
}

/**
 * Generate test JWT token
 */
export function generateTestToken(payload: any, secret: string = 'test-secret'): string {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

/**
 * Create test admin user token
 */
export function createAdminToken(user: Partial<TestUser> = {}): string {
  const defaultUser = {
    id: 1,
    username: 'testadmin',
    email: 'admin@test.com',
    role: 'admin',
    ...user
  };

  return generateTestToken(defaultUser);
}

/**
 * Create test voter token
 */
export function createVoterToken(voucher: string = 'TEST1234'): string {
  return generateTestToken({
    voucher,
    type: 'voter'
  });
}

/**
 * Test database helper
 */
export class TestDatabase {
  private pool: any;

  constructor(connectionString?: string) {
    // Initialize test database connection
    // This would typically use a test database
  }

  async clean() {
    // Clean all test data
    // This would truncate tables or reset database state
  }

  async close() {
    // Close database connections
  }
}

/**
 * Common test data factories
 */
export const TestDataFactory = {
  user: (overrides = {}) => ({
    id: 1,
    voucher: 'TEST1234',
    ...overrides
  }),

  position: (overrides = {}) => ({
    id: 1,
    position_name: 'President',
    ...overrides
  }),

  candidate: (overrides = {}) => ({
    id: 1,
    name: 'John Doe',
    position_id: 1,
    manifesto: 'I will lead with integrity',
    ...overrides
  }),

  vote: (overrides = {}) => ({
    id: 1,
    voucher: 'TEST1234',
    candidate_id: 1,
    position_id: 1,
    verification_code: 'VER123456',
    ...overrides
  }),

  adminUser: (overrides = {}) => ({
    id: 1,
    username: 'testadmin',
    email: 'admin@test.com',
    password_hash: 'hashedpassword',
    role: 'admin',
    is_active: true,
    ...overrides
  })
};

/**
 * Wait for a specified time (useful for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random string for testing
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random voucher code
 */
export function randomVoucher(): string {
  return randomString(8);
}

/**
 * Generate random verification code
 */
export function randomVerificationCode(): string {
  return randomString(10);
}