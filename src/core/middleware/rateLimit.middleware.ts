/** @format */

import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for USSD webhooks (AT sends at high frequency)
export const ussdLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500, // 500 requests per minute (USSD sessions)
  skip: (req) => {
    // Don't rate limit if request has valid API key
    return req.headers["x-api-key"] === process.env.API_KEY;
  },
});
