const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Authentication required. Please sign in.' });
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(503).json({ message: 'Authentication is not configured on the server. Set JWT_SECRET (minimum 32 characters).' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'milk-record-api' });
    const user = await User.findById(payload.sub).select('_id name mobile role isActive');
    if (!user || user.isActive === false) return res.status(401).json({ message: 'Account is unavailable. Please contact the administrator.' });
    req.authUser = user;
    // Legacy controllers read owner IDs from query/body. Never trust the client value.
    req.query.userId = String(user._id);
    req.body = req.body || {};
    req.body.userId = String(user._id);
    req.body.user = String(user._id);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Session expired or invalid. Please sign in again.' });
    }
    next(error);
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.authUser || req.authUser.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required.' });
  }
  next();
};
