const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

exports.authenticateCustomer = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Customer login required.' });
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(503).json({ message: 'Authentication is not configured on the server.' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'milk-record-api' });
    if (payload.role !== 'customer' || payload.sessionType !== 'customer') {
      return res.status(403).json({ message: 'Customer access only.' });
    }
    const customer = await Customer.findOne({ _id: payload.sub, user: payload.ownerId }).select('_id name whatsapp user');
    if (!customer) return res.status(401).json({ message: 'Customer account is no longer available.' });
    req.authCustomer = customer;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Customer session expired. Please login again.' });
    }
    next(error);
  }
};
