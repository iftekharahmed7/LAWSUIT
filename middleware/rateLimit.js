const rateLimit = require('express-rate-limit');

const make = (windowMs, limit, message, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    ...extra,
  });

// AI endpoints: anonymous visitors get a small hourly allowance; logged-in
// users get more. Must run AFTER attachUserIfPresent so req.user is populated.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user ? 60 : 15),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again in a while, or sign in for a higher limit.' },
});

// Auth endpoints (per IP)
const loginLimiter = make(
  15 * 60 * 1000, 10,
  'Too many login attempts. Please wait 15 minutes and try again.',
  { skipSuccessfulRequests: true } // only failed attempts count
);
const signupLimiter = make(60 * 60 * 1000, 10, 'Too many sign-up attempts. Please try again later.');
const forgotLimiter = make(60 * 60 * 1000, 5, 'Too many reset requests. Please try again later.');
const resetLimiter = make(60 * 60 * 1000, 10, 'Too many attempts. Please try again later.');

module.exports = { aiLimiter, loginLimiter, signupLimiter, forgotLimiter, resetLimiter };
