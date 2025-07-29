const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function listAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    console.log('\n=== ADMIN USERS ===');
    if (adminUsers.length === 0) {
      console.log('No admin users found.');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. Admin User:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Mobile: ${user.mobile}`);
        console.log(`   MPIN: ${user.mpin}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      });
    }

    console.log('\n=== LOGIN INSTRUCTIONS ===');
    console.log('To login as admin:');
    console.log('1. Go to the application login page');
    console.log('2. Enter any of the above mobile numbers');
    console.log('3. Enter the corresponding MPIN');
    console.log('4. You will be redirected to the admin dashboard');

  } catch (error) {
    console.error('Error listing admins:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

listAdmins(); 