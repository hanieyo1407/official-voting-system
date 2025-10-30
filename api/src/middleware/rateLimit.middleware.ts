import rateLimit from 'express-rate-limit';
// FIXED: Use CJS require syntax to ensure the standardKeyGenerator utility is correctly loaded
const { standardKeyGenerator } = require('express-rate-limit'); 

import { Request, Response } from 'express';
import CacheService from '../services/cache.service';
import { LoggingService } from '../services/logging.service';

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: standardKeyGenerator, // FIXED: Use the standard key generator utility
  handler: (req, res) => {
    LoggingService.logSecurity('RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      endpoint: req.path,
      limit: 100,
      windowMs: 15 * 60 * 1000
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict voting rate limiter (more restrictive for voting)
export const votingRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 votes per 5 minutes
  message: {
    error: 'Too many voting attempts, please wait before trying again.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: standardKeyGenerator, // FIXED: Use the standard key generator utility
  handler: (req, res) => {
    LoggingService.logSecurity('VOTING_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      endpoint: req.path,
      limit: 3,
      windowMs: 5 * 60 * 1000
    });
    res.status(429).json({
      error: 'Too many voting attempts, please wait before trying again.',
      retryAfter: '5 minutes'
    });
  }
});

// Authentication rate limiter (for login attempts)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: standardKeyGenerator, // FIXED: Use the standard key generator utility
  handler: (req, res) => {
    LoggingService.logSecurity('AUTH_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      endpoint: req.path,
      limit: 5,
      windowMs: 15 * 60 * 1000
    });
    res.status(429).json({
      error: 'Too many login attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Admin rate limiter (more permissive for admin operations)
export const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // Limit each IP to 200 admin requests per 5 minutes
  message: {
    error: 'Too many admin requests, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: standardKeyGenerator, // FIXED: Use the standard key generator utility
  handler: (req, res) => {
    LoggingService.logSecurity('ADMIN_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      endpoint: req.path,
      limit: 200,
      windowMs: 5 * 60 * 1000
    });
    res.status(429).json({
      error: 'Too many admin requests, please try again later.',
      retryAfter: '5 minutes'
    });
  }
});

// Custom rate limiter using cache service for more sophisticated limiting
export class CustomRateLimiter {
  private static instance: CustomRateLimiter;
  private cacheService: typeof CacheService;

  constructor() {
    this.cacheService = CacheService;
  }

  static getInstance(): CustomRateLimiter {
    if (!CustomRateLimiter.instance) {
      CustomRateLimiter.instance = new CustomRateLimiter();
    }
    return CustomRateLimiter.instance;
  }

  // User-based rate limiting for voting
  checkUserVoteLimit(voucher: string, maxVotes: number = 5, windowMs: number = 60 * 60 * 1000): { allowed: boolean; currentCount: number } {
    const key = `ratelimit:vote:user:${voucher}`;
    const currentCount = this.cacheService.incrementRateLimit(key, windowMs);

    return {
      allowed: currentCount <= maxVotes,
      currentCount
    };
  }

  // IP-based rate limiting with custom logic
  checkIPRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 5 * 60 * 1000): { allowed: boolean; currentCount: number; resetTime: number } {
    // Normalize IP address for consistent caching
    const normalizedIP = ip.replace(/:/g, '_').replace(/\./g, '_');
    const key = `ratelimit:ip:${normalizedIP}`;
    const currentCount = this.cacheService.incrementRateLimit(key, windowMs);
    const resetTime = Date.now() + windowMs;

    return {
      allowed: currentCount <= maxRequests,
      currentCount,
      resetTime
    };
  }

  // Position-based rate limiting (prevent spam voting for specific positions)
  checkPositionVoteLimit(positionId: number, maxVotes: number = 100, windowMs: number = 5 * 60 * 1000): { allowed: boolean; currentCount: number } {
    const key = `ratelimit:vote:position:${positionId}`;
    const currentCount = this.cacheService.incrementRateLimit(key, windowMs);

    return {
      allowed: currentCount <= maxVotes,
      currentCount
    };
  }

  // Middleware function for custom rate limiting
  createRateLimitMiddleware(
    maxRequests: number = 10,
    windowMs: number = 5 * 60 * 1000,
    skipSuccessfulRequests: boolean = false
  ) {
    return (req: Request, res: Response, next: any) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const normalizedIP = ip.replace(/:/g, '_').replace(/\./g, '_');
      const rateLimitCheck = this.checkIPRateLimit(normalizedIP, maxRequests, windowMs);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - rateLimitCheck.currentCount),
        'X-RateLimit-Reset': new Date(rateLimitCheck.resetTime).toISOString()
      });

      if (!rateLimitCheck.allowed) {
        LoggingService.logSecurity('CUSTOM_RATE_LIMIT_EXCEEDED', {
          ip,
          endpoint: req.path,
          currentCount: rateLimitCheck.currentCount,
          maxRequests,
          windowMs
        });

        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000),
          currentCount: rateLimitCheck.currentCount,
          limit: maxRequests
        });
      }

      // Store rate limit info in request for potential use in controllers
      (req as any).rateLimit = rateLimitCheck;

      next();
    };
  }
}

// Export singleton instance
export const customRateLimiter = CustomRateLimiter.getInstance();

// Specific middleware instances
export const strictRateLimit = customRateLimiter.createRateLimitMiddleware(5, 60 * 1000); // 5 requests per minute
export const moderateRateLimit = customRateLimiter.createRateLimitMiddleware(50, 5 * 60 * 1000); // 50 requests per 5 minutes
export const looseRateLimit = customRateLimiter.createRateLimitMiddleware(200, 15 * 60 * 1000); // 200 requests per 15 minutes