import rateLimit from "express-rate-limit";
import { generateApiResponse } from "./utilities.service.js";
import { StatusCodes } from "http-status-codes";

// ════════════════════════════════════════════════════════════════
// Rate Limiter Service
// ════════════════════════════════════════════════════════════════

/**
 * Create a rate limiter with custom options.
 *
 * @param {Object} opts
 * @param {number} [opts.windowMs]  - Time window in milliseconds (default: 15 min)
 * @param {number} [opts.max]       - Max requests per window (default: 100)
 * @param {string} [opts.message]   - Error message
 * @param {Function} [opts.keyGenerator] - Custom key generator
 * @returns {Function} Express middleware
 */
export function createRateLimiter(opts = {}) {
  const config = {
    windowMs: opts.windowMs || 15 * 60 * 1000,
    max: opts.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return generateApiResponse(
        res,
        StatusCodes.TOO_MANY_REQUESTS,
        false,
        opts.message || "Too many requests. Please try again later."
      );
    },
  };

  if (opts.keyGenerator) {
    config.keyGenerator = opts.keyGenerator;
  }

  return rateLimit(config);
}

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
});

/**
 * Auth rate limiter — 10 attempts per 15 minutes per IP.
 * Use on login / register / OTP routes.
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again later.",
});

/**
 * Upload rate limiter — 20 uploads per 15 minutes per IP.
 */
export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many uploads. Please try again later.",
});
