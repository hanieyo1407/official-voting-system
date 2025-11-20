// api/src/utils/sanitizer.ts

import validator from 'validator';

export class InputSanitizer {
  /**
   * Sanitize email input
   * - Trim whitespace
   * - Convert to lowercase
   * - Validate email format
   * - Remove dangerous characters
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email input');
    }

    // Trim and lowercase
    let sanitized = email.trim().toLowerCase();

    // Validate email format
    if (!validator.isEmail(sanitized)) {
      throw new Error('Invalid email format');
    }

    // Additional security: escape any HTML/SQL injection attempts
    sanitized = validator.escape(sanitized);

    // Max length check (prevent DoS)
    if (sanitized.length > 254) { // RFC 5321
      throw new Error('Email too long');
    }

    return sanitized;
  }

  /**
   * Sanitize voucher code
   * - Trim whitespace
   * - Convert to uppercase
   * - Remove non-alphanumeric except hyphens
   * - Validate format
   */
  static sanitizeVoucher(voucher: string): string {
    if (!voucher || typeof voucher !== 'string') {
      throw new Error('Invalid voucher input');
    }

    // Trim and uppercase
    let sanitized = voucher.trim().toUpperCase();

    // Remove any characters that aren't letters, numbers, or hyphens
    sanitized = sanitized.replace(/[^A-Z0-9-]/g, '');

    // Length validation (prevent DoS and invalid formats)
    if (sanitized.length < 5 || sanitized.length > 50) {
      throw new Error('Invalid voucher format');
    }

    // Escape for extra safety
    sanitized = validator.escape(sanitized);

    return sanitized;
  }

  /**
   * Sanitize password (validation only, don't modify)
   * - Check length
   * - Check for null bytes
   * - Prevent excessively long passwords (DoS)
   */
  static validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password input');
    }

    // Check for null bytes (can cause issues in C-based libraries)
    if (password.includes('\0')) {
      throw new Error('Invalid password format');
    }

    // Length checks
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (password.length > 128) {
      throw new Error('Password too long');
    }
  }

  /**
   * Sanitize username
   * - Trim whitespace
   * - Remove dangerous characters
   * - Validate format
   */
  static sanitizeUsername(username: string): string {
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid username input');
    }

    // Trim whitespace
    let sanitized = username.trim();

    // Remove dangerous characters (allow letters, numbers, underscores, hyphens)
    sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '');

    // Length validation
    if (sanitized.length < 3 || sanitized.length > 30) {
      throw new Error('Username must be 3-30 characters');
    }

    // Escape for extra safety
    sanitized = validator.escape(sanitized);

    return sanitized;
  }

  /**
   * Sanitize generic text input (for candidate names, etc.)
   */
  static sanitizeText(text: string, maxLength: number = 255): string {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }

    // Trim whitespace
    let sanitized = text.trim();

    // Length validation
    if (sanitized.length === 0 || sanitized.length > maxLength) {
      throw new Error(`Text must be 1-${maxLength} characters`);
    }

    // Escape HTML/XSS
    sanitized = validator.escape(sanitized);

    return sanitized;
  }

  /**
   * Sanitize integer input (for IDs)
   */
  static sanitizeInteger(value: any, fieldName: string = 'value'): number {
    const parsed = parseInt(value);
    
    if (isNaN(parsed) || parsed <= 0 || parsed > 2147483647) {
      throw new Error(`Invalid ${fieldName}`);
    }

    return parsed;
  }
}