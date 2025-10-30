import NodeCache from 'node-cache';
import { LoggingService } from './logging.service';

export class CacheService {
  private cache: NodeCache;
  private readonly DEFAULT_TTL = 300; // 5 minutes
  private readonly POSITION_TTL = 600; // 10 minutes
  private readonly CANDIDATE_TTL = 600; // 10 minutes
  private readonly STATS_TTL = 1800; // 30 minutes
  private readonly USER_TTL = 900; // 15 minutes

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.DEFAULT_TTL,
      checkperiod: 60, // Check for expired keys every minute
      useClones: false, // Don't clone objects for better performance
      deleteOnExpire: true,
      maxKeys: 1000 // Maximum number of keys to prevent memory issues
    });

    // Set up event listeners for cache monitoring
    this.cache.on('set', (key, value) => {
      LoggingService.logAudit('CACHE_SET', { key, size: JSON.stringify(value).length });
    });

    this.cache.on('del', (key, value) => {
      LoggingService.logAudit('CACHE_DEL', { key });
    });

    this.cache.on('expired', (key, value) => {
      LoggingService.logAudit('CACHE_EXPIRED', { key });
    });

    this.cache.on('flush', () => {
      LoggingService.logAudit('CACHE_FLUSH', { message: 'Entire cache flushed' });
    });
  }

  // Generic cache methods
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      return this.cache.set(key, value, ttl || this.DEFAULT_TTL);
    } catch (error: any) {
      LoggingService.logError(error, { context: 'cache.set', key });
      return false;
    }
  }

  get<T>(key: string): T | undefined {
    try {
      return this.cache.get<T>(key);
    } catch (error: any) {
      LoggingService.logError(error, { context: 'cache.get', key });
      return undefined;
    }
  }

  del(key: string): number {
    try {
      return this.cache.del(key);
    } catch (error: any) {
      LoggingService.logError(error, { context: 'cache.del', key });
      return 0;
    }
  }

  has(key: string): boolean {
    try {
      return this.cache.has(key);
    } catch (error: any) {
      LoggingService.logError(error, { context: 'cache.has', key });
      return false;
    }
  }

  // Position-specific cache methods
  setPositions(positions: any[]): boolean {
    return this.set('positions:all', positions, this.POSITION_TTL);
  }

  getPositions(): any[] | undefined {
    return this.get<any[]>('positions:all');
  }

  setPositionCandidates(positionId: number, candidates: any[]): boolean {
    return this.set(`position:${positionId}:candidates`, candidates, this.CANDIDATE_TTL);
  }

  getPositionCandidates(positionId: number): any[] | undefined {
    return this.get<any[]>(`position:${positionId}:candidates`);
  }

  // User-specific cache methods
  setUser(userId: number, user: any): boolean {
    return this.set(`user:${userId}`, user, this.USER_TTL);
  }

  getUser(userId: number): any | undefined {
    return this.get<any>(`user:${userId}`);
  }

  setUserByVoucher(voucher: string, user: any): boolean {
    return this.set(`user:voucher:${voucher}`, user, this.USER_TTL);
  }

  getUserByVoucher(voucher: string): any | undefined {
    return this.get<any>(`user:voucher:${voucher}`);
  }

  // Vote verification cache
  setVoteVerification(verificationCode: string, vote: any): boolean {
    return this.set(`vote:verification:${verificationCode}`, vote, this.DEFAULT_TTL);
  }

  getVoteVerification(verificationCode: string): any | undefined {
    return this.get<any>(`vote:verification:${verificationCode}`);
  }

  // Statistics cache
  setOverallStats(stats: any): boolean {
    return this.set('stats:overall', stats, this.STATS_TTL);
  }

  getOverallStats(): any | undefined {
    return this.get<any>('stats:overall');
  }

  setPositionStats(positionId: number, stats: any): boolean {
    return this.set(`stats:position:${positionId}`, stats, this.STATS_TTL);
  }

  getPositionStats(positionId: number): any | undefined {
    return this.get<any>(`stats:position:${positionId}`);
  }

  // Rate limiting cache methods
  setRateLimit(identifier: string, requests: number[], windowMs: number): boolean {
    const rateLimitData = {
      requests,
      windowStart: Date.now(),
      windowMs
    };
    return this.set(`ratelimit:${identifier}`, rateLimitData, Math.ceil(windowMs / 1000));
  }

  getRateLimit(identifier: string): { requests: number[], windowStart: number, windowMs: number } | undefined {
    return this.get(`ratelimit:${identifier}`);
  }

  incrementRateLimit(identifier: string, windowMs: number): number {
    const existing = this.getRateLimit(identifier);
    const now = Date.now();

    if (!existing || (now - existing.windowStart) >= existing.windowMs) {
      // New window
      this.setRateLimit(identifier, [1], windowMs);
      return 1;
    } else {
      // Existing window
      existing.requests.push(now);
      // Remove old requests outside the window
      existing.requests = existing.requests.filter(
        timestamp => (now - timestamp) < existing.windowMs
      );
      this.set(`ratelimit:${identifier}`, existing, Math.ceil(existing.windowMs / 1000));
      return existing.requests.length;
    }
  }

  // Cache management methods
  getStats() {
    return {
      keys: this.cache.getStats().keys,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize
    };
  }

  flushAll(): void {
    this.cache.flushAll();
  }

  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  // Cache warming methods
  async warmPositionsCache(): Promise<void> {
    try {
      const pool = require('../db/config');
      const result = await pool.query('SELECT id, position_name FROM "Position" ORDER BY id');
      this.setPositions(result.rows);
      LoggingService.logAudit('CACHE_WARMED', { type: 'positions', count: result.rows.length });
    } catch (error: any) {
      LoggingService.logError(error, { context: 'warmPositionsCache' });
    }
  }

  async warmCandidatesCache(): Promise<void> {
    try {
      const pool = require('../db/config');
      const positionsResult = await pool.query('SELECT id FROM "Position"');

      for (const position of positionsResult.rows) {
        const candidatesResult = await pool.query(
          'SELECT id, name, manifesto, position_id FROM "Candidate" WHERE position_id = $1 ORDER BY id',
          [position.id]
        );
        this.setPositionCandidates(position.id, candidatesResult.rows);
      }

      LoggingService.logAudit('CACHE_WARMED', {
        type: 'candidates',
        positions: positionsResult.rows.length
      });
    } catch (error: any) {
      LoggingService.logError(error, { context: 'warmCandidatesCache' });
    }
  }

  // Cache invalidation methods
  invalidatePositionCache(positionId?: number): void {
    if (positionId) {
      this.del(`position:${positionId}:candidates`);
      this.del(`stats:position:${positionId}`);
      LoggingService.logAudit('CACHE_INVALIDATED', { type: 'position', positionId });
    } else {
      // Invalidate all position-related cache
      const keys = this.cache.keys();
      const positionKeys = keys.filter(key => key.startsWith('position:') || key.startsWith('stats:position:'));
      positionKeys.forEach(key => this.del(key));
      LoggingService.logAudit('CACHE_INVALIDATED', { type: 'all_positions', count: positionKeys.length });
    }
  }

  invalidateUserCache(userId?: number, voucher?: string): void {
    if (userId) {
      this.del(`user:${userId}`);
    }
    if (voucher) {
      this.del(`user:voucher:${voucher}`);
    }
    if (userId || voucher) {
      LoggingService.logAudit('CACHE_INVALIDATED', { type: 'user', userId, voucher });
    }
  }

  invalidateStatsCache(): void {
    const keys = this.cache.keys();
    const statsKeys = keys.filter(key => key.startsWith('stats:'));
    statsKeys.forEach(key => this.del(key));
    LoggingService.logAudit('CACHE_INVALIDATED', { type: 'stats', count: statsKeys.length });
  }

  // Vote-specific cache operations
  invalidateVoteCache(verificationCode?: string): void {
    if (verificationCode) {
      this.del(`vote:verification:${verificationCode}`);
    }
    // Also invalidate related stats
    this.invalidateStatsCache();
    LoggingService.logAudit('CACHE_INVALIDATED', { type: 'vote', verificationCode });
  }
}

// Export singleton instance
export default new CacheService();