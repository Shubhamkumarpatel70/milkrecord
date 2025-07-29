const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');
require('dotenv').config();

async function distributeCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Get all users and customers
    const users = await User.find();
    const customers = await Customer.find();
    
    console.log('Users:', users.map(u => ({ id: u._id, name: u.name, mobile: u.mobile })));
    console.log('Customers before distribution:', customers.map(c => ({ name: c.name, whatsapp: c.whatsapp, user: c.user })));

    // Create a mapping of customer names to user IDs
    // This is a simple mapping - in a real scenario, you'd want more sophisticated logic
    const customerUserMapping = {
      'Manoj': users.find(u => u.name === 'Manoj')?._id,
      'Ayush': users.find(u => u.name === 'Ayush')?._id,
      'Sumit': users.find(u => u.name === 'Sujal')?._id, // Assign Sumit to Sujal
    };

    // Update customers with correct user assignments
    for (const customer of customers) {
      const targetUserId = customerUserMapping[customer.name];
      if (targetUserId) {
        await Customer.findByIdAndUpdate(customer._id, { user: targetUserId });
        console.log(`Assigned customer ${customer.name} to user ${users.find(u => u._id.toString() === targetUserId.toString())?.name}`);
      } else {
        console.log(`No mapping found for customer ${customer.name}, keeping with current user`);
      }
    }

    // Verify the distribution
    console.log('\nAfter distribution:');
    for (const user of users) {
      const userCustomers = await Customer.find({ user: user._id });
      console.log(`Customers for user ${user.name}:`, userCustomers.map(c => ({ name: c.name, whatsapp: c.whatsapp })));
    }

  } catch (error) {
    console.error('Distribution error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

distributeCustomers(); 