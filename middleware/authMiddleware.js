const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const attachUserIfPresent = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // invalid/expired token on an optional route - proceed as anonymous
    }
  }
  next();
};

// The role inside a login token is up to 7 days old, so privileged routes
// re-check it against the database. A demoted or deleted account loses
// access immediately instead of when its token expires.
const requireRole = (...roles) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    const current = await User.findById(req.user.id).select('role');
    if (!current || !roles.includes(current.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    req.user.role = current.role;
    next();
  } catch (error) {
    console.error('[auth:requireRole]', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = protect;
module.exports.protect = protect;
module.exports.attachUserIfPresent = attachUserIfPresent;
module.exports.requireRole = requireRole;
