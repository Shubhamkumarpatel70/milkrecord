const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Name:', existingAdmin.name);
      console.log('Mobile:', existingAdmin.mobile);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin',
      mobile: '9999999999',
      mpin: '12345',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Name:', adminUser.name);
    console.log('Mobile:', adminUser.mobile);
    console.log('MPIN:', adminUser.mpin);
    console.log('Role:', adminUser.role);
    console.log('\nYou can now login with:');
    console.log('Mobile: 9999999999');
    console.log('MPIN: 12345');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createAdmin(); 