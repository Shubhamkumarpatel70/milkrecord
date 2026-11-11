const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  const name = String(process.env.ADMIN_NAME || '').trim();
  const mobile = String(process.env.ADMIN_MOBILE || '').trim();
  const mpin = String(process.env.ADMIN_MPIN || '');
  if (name.length < 2 || !/^[0-9]{10}$/.test(mobile) || !/^[0-9]{5}$/.test(mpin)) {
    throw new Error('Set ADMIN_NAME, ADMIN_MOBILE (10 digits), and ADMIN_MPIN (5 digits) before running this script.');
  }
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ mobile });
  if (existing && existing.role !== 'admin') throw new Error('This mobile already belongs to a non-admin account. Use a different admin mobile.');
  const passwordHash = await bcrypt.hash(mpin, 12);
  if (existing) {
    existing.name = name;
    existing.mpin = passwordHash;
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log('Existing administrator credentials updated.');
  } else {
    await new User({ name, mobile, mpin: passwordHash, role: 'admin', isActive: true }).save();
    console.log('Administrator account created.');
  }
  console.log('Admin mobile:', mobile);
  console.log('Role: admin');
  console.log('MPIN is stored as a one-way hash and is never printed.');
}
createAdmin()
  .catch(error => { console.error('Admin setup failed:', error.message); process.exitCode = 1; })
  .finally(async () => { if (mongoose.connection.readyState) await mongoose.connection.close(); });
