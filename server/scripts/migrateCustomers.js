const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');
require('dotenv').config();

async function migrateCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Get all customers without user field
    const customersWithoutUser = await Customer.find({ user: { $exists: false } });
    console.log(`Found ${customersWithoutUser.length} customers without user field`);

    if (customersWithoutUser.length === 0) {
      console.log('No customers need migration');
      return;
    }

    // Get the first user (or create one if none exists)
    let defaultUser = await User.findOne();
    if (!defaultUser) {
      console.log('No users found. Creating a default user...');
      defaultUser = new User({
        name: 'Default User',
        mobile: '0000000000',
        mpin: '00000'
      });
      await defaultUser.save();
      console.log('Created default user:', defaultUser._id);
    }

    // Update all customers without user field
    const updatePromises = customersWithoutUser.map(customer => 
      Customer.findByIdAndUpdate(customer._id, { user: defaultUser._id })
    );

    await Promise.all(updatePromises);
    console.log(`Updated ${customersWithoutUser.length} customers with user field`);

    // Verify the migration
    const allCustomers = await Customer.find();
    console.log('All customers after migration:', allCustomers.map(c => ({ name: c.name, whatsapp: c.whatsapp, user: c.user })));

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

migrateCustomers(); 