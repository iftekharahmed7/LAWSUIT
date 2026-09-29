const rateLimit = require('express-rate-limit');

// Anonymous visitors get a small hourly allowance; logged-in users get more.
// Must run AFTER attachUserIfPresent so req.user is populated.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user ? 60 : 15),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again in a while, or sign in for a higher limit.' },
});

module.exports = { aiLimiter };
