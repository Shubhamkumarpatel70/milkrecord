const User = require('../models/User');
const Customer = require('../models/Customer');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const issueToken = user => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  return jwt.sign({ sub: String(user._id), role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '7d', issuer: 'milk-record-api' });
};

const validMobile = value => typeof value === 'string' && /^[0-9]{10}$/.test(value);
const validMpin = value => typeof value === 'string' && /^[0-9]{5}$/.test(value);

exports.register = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const mobile = String(req.body.mobile || '').trim();
    const mpin = String(req.body.mpin || '');
    if (name.length < 2 || name.length > 80 || !validMobile(mobile) || !validMpin(mpin)) {
      return res.status(400).json({ message: 'Enter a valid name, 10-digit mobile number and 5-digit MPIN.' });
    }
    if (await User.findOne({ mobile })) return res.status(409).json({ message: 'User already exists.' });
    const user = await new User({ name, mobile, mpin: await bcrypt.hash(mpin, 12) }).save();
    return res.status(201).json({ message: 'Registration successful!', token: issueToken(user), userId: user._id, userRole: user.role || 'user', userName: user.name });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'User already exists.' });
    console.error('Registration error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const mobile = String(req.body.mobile || '').trim();
    const mpin = String(req.body.mpin || '');
    if (!validMobile(mobile) || !validMpin(mpin)) return res.status(400).json({ message: 'Enter a valid mobile number and 5-digit MPIN.' });
    const user = await User.findOne({ mobile });
    if (!user || user.isActive === false) return res.status(401).json({ message: 'Invalid credentials or disabled account.' });
    const hashed = /^\$2[aby]\$/.test(user.mpin);
    const match = hashed ? await bcrypt.compare(mpin, user.mpin) : mpin === user.mpin;
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });
    if (!hashed) { user.mpin = await bcrypt.hash(mpin, 12); await user.save(); }
    return res.json({ message: 'Login successful!', token: issueToken(user), userId: user._id, userRole: user.role || 'user', userName: user.name });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.customerLogin = async (req, res) => {
  try {
    const whatsapp = String(req.body.whatsapp || '').trim();
    if (!validMobile(whatsapp)) return res.status(400).json({ message: 'Enter a valid 10-digit WhatsApp number.' });
    const matches = await Customer.find({ whatsapp }).limit(2);
    if (!matches.length) return res.status(404).json({ message: 'Customer not found.' });
    if (matches.length > 1) return res.status(409).json({ message: 'This number is linked to multiple accounts. Contact the dairy owner.' });
    const customer = matches[0];
    return res.json({ success: true, message: 'Login successful!', customer: { _id: customer._id, name: customer.name, whatsapp: customer.whatsapp, userId: customer.user } });
  } catch (err) {
    console.error('Customer login error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.addPaymentOption = async (req, res) => {
  try {
    const { userId } = req.body;
    const upiId = String(req.body.upiId || '').trim();
    if (!userId || !/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upiId)) return res.status(400).json({ message: 'Enter a valid UPI ID and user ID.' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.paymentOptions.upiId = upiId;
    user.paymentOptions.hasPaymentOption = true;
    await user.save();
    return res.json({ message: 'Payment option added successfully!', paymentOptions: user.paymentOptions });
  } catch (err) {
    console.error('Add payment option error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.getPaymentOption = async (req, res) => {
  try {
    const user = await User.findById(req.authUser._id).select('paymentOptions');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ paymentOptions: user.paymentOptions });
  } catch (err) { return res.status(400).json({ message: 'Invalid user ID.' }); }
};

exports.generatePaymentQR = async (req, res) => {
  try {
    const { userId } = req.body;
    const amount = Number(req.body.amount);
    if (!userId || !Number.isFinite(amount) || amount <= 0 || amount > 10000000) return res.status(400).json({ message: 'Enter a valid payment amount.' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.paymentOptions?.hasPaymentOption || !user.paymentOptions?.upiId) return res.status(400).json({ message: 'Payment option not configured.' });
    const upiUrl = `upi://pay?pa=${encodeURIComponent(user.paymentOptions.upiId)}&pn=${encodeURIComponent(user.name)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Milk Payment')}`;
    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, { width: 300, margin: 2 });
    return res.json({ upiUrl, qrCodeDataUrl, upiId: user.paymentOptions.upiId, userName: user.name, amount });
  } catch (err) {
    console.error('Generate payment QR error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};
