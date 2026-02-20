/**
 * Security utilities for TechGeo platform
 * - HTML sanitization
 * - Input validation
 * - NoSQL injection prevention
 */

// Basic HTML sanitization - removes dangerous tags and attributes
export const sanitizeHTML = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<object[^>]*>/gi, '');
  
  return sanitized.trim();
};

// Validate username format
export const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9_-]{3,20}$/;
  return regex.test(username);
};

// Validate email format
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate phone number format
export const validatePhone = (phone) => {
  const regex = /^\+?[0-9\s-()]{7,}$/;
  return regex.test(phone);
};

// Check for NoSQL injection patterns
export const isNoSQLInjectionAttempt = (input) => {
  if (typeof input !== 'string') return false;
  
  const suspiciousPatterns = [
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$regex/i,
    /\$or/i,
    /\$and/i,
    /\$nor/i,
    /\$not/i,
    /\$exists/i,
    /\$elemMatch/i,
    /\$all/i,
    /\$in/i,
    /\$nin/i,
    /\$mod/i,
    /\$text/i,
    /\$where/i,
    /\bdb\./i,
    /\bthis\./i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
};

// Validate sample text for bid (not too short, not too long, sanitized)
export const validateBidSample = (sample) => {
  if (!sample || typeof sample !== 'string') {
    return { valid: false, error: 'Sample text is required' };
  }
  
  if (isNoSQLInjectionAttempt(sample)) {
    return { valid: false, error: 'Invalid characters detected' };
  }
  
  if (sample.length < 50) {
    return { valid: false, error: 'Sample must be at least 50 characters' };
  }
  
  if (sample.length > 2000) {
    return { valid: false, error: 'Sample must not exceed 2000 characters' };
  }
  
  return { valid: true, sanitized: sanitizeHTML(sample) };
};

// Validate submission content (blog/survey)
export const validateSubmissionContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }
  
  if (isNoSQLInjectionAttempt(content)) {
    return { valid: false, error: 'Invalid characters detected' };
  }
  
  if (content.length < 300) {
    return { valid: false, error: 'Content must be at least 300 characters' };
  }
  
  if (content.length > 50000) {
    return { valid: false, error: 'Content must not exceed 50000 characters' };
  }
  
  return { valid: true, sanitized: sanitizeHTML(content) };
};

export default {
  sanitizeHTML,
  validateUsername,
  validateEmail,
  validatePhone,
  isNoSQLInjectionAttempt,
  validateBidSample,
  validateSubmissionContent
};
