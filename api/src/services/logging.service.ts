// api/src/services/logging.service.ts

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` | ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

const dailyRotateFileTransport = new DailyRotateFile({
  filename: 'logs/voting-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let log = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(meta).length > 0) {
        log += ` | ${JSON.stringify(meta)}`;
      }
      return log;
    })
  ),
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'voting-system' },
  transports: [
    consoleTransport,
    dailyRotateFileTransport,
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

export class LoggingService {
  static logAuth(userId: string, action: string, ip?: string, userAgent?: string) {
    logger.info('Authentication Event', {
      userId,
      action,
      ip,
      userAgent,
      category: 'AUTH',
    });
  }

  static logVote(voucher: string, candidateId: number, positionId: number, verificationCode: string, ip?: string) {
    logger.info('Vote Cast', {
      voucher,
      candidateId,
      positionId,
      verificationCode,
      ip,
      category: 'VOTE',
    });
  }

  static logAdminAction(adminId: string, action: string, target?: string, details?: any) {
    logger.info('Admin Action', {
      adminId,
      action,
      target,
      details,
      category: 'ADMIN',
    });
  }

  static logSecurity(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') {
    logger.warn('Security Event', {
      event,
      details,
      severity,
      category: 'SECURITY',
    });
  }

  static logError(error: Error, context?: any) {
    logger.error('Application Error', {
      error: error.message,
      stack: error.stack,
      context,
      category: 'ERROR',
    });
  }

  static logStats(stats: any) {
    logger.info('Statistics Generated', {
      stats,
      category: 'STATS',
    });
  }

  static logAudit(auditEvent: string, details: any) {
    logger.info('Audit Event', {
      auditEvent,
      details,
      category: 'AUDIT',
    });
  }
}

export default logger;