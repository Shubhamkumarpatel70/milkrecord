const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createNewAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Create new admin user
    const adminUser = new User({
      name: 'Super Admin',
      mobile: '9999999999',
      mpin: '12345',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('New Admin user created successfully!');
    console.log('Name:', adminUser.name);
    console.log('Mobile:', adminUser.mobile);
    console.log('MPIN:', adminUser.mpin);
    console.log('Role:', adminUser.role);
    console.log('\nYou can now login with:');
    console.log('Mobile: 9999999999');
    console.log('MPIN: 12345');

  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin user with mobile 9999999999 already exists!');
      console.log('You can use these credentials to login:');
      console.log('Mobile: 9999999999');
      console.log('MPIN: 12345');
    } else {
      console.error('Error creating admin:', error);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createNewAdmin(); 