const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');
require('dotenv').config();

async function testUserCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log('All users:', users.map(u => ({ id: u._id, name: u.name, mobile: u.mobile })));

    // Get all customers
    const allCustomers = await Customer.find();
    console.log('All customers:', allCustomers.map(c => ({ name: c.name, whatsapp: c.whatsapp, user: c.user })));

    // Test user-specific customer queries
    for (const user of users) {
      const userCustomers = await Customer.find({ user: user._id });
      console.log(`\nCustomers for user ${user.name} (${user._id}):`, userCustomers.map(c => ({ name: c.name, whatsapp: c.whatsapp })));
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

testUserCustomers(); 