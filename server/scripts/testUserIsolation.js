const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');
const MilkRecord = require('../models/MilkRecord');
require('dotenv').config();

async function testUserIsolation() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log('\n=== USERS ===');
    users.forEach(user => {
      console.log(`User: ${user.name} (ID: ${user._id})`);
    });

    // Get all customers with their user associations
    const allCustomers = await Customer.find();
    console.log('\n=== ALL CUSTOMERS ===');
    allCustomers.forEach(customer => {
      const user = users.find(u => u._id.toString() === customer.user.toString());
      console.log(`Customer: ${customer.name} (WhatsApp: ${customer.whatsapp}) -> User: ${user?.name || 'Unknown'}`);
    });

    // Test user-specific customer queries
    console.log('\n=== USER-SPECIFIC CUSTOMER TESTS ===');
    for (const user of users) {
      console.log(`\n--- Testing User: ${user.name} ---`);
      
      // Get customers for this user
      const userCustomers = await Customer.find({ user: user._id });
      console.log(`Customers for ${user.name}:`, userCustomers.map(c => c.name));
      
      // Get milk records for this user
      const userRecords = await MilkRecord.find({ user: user._id });
      console.log(`Milk records for ${user.name}:`, userRecords.length);
      
      // Get unique customer names from milk records
      const customerNamesFromRecords = [...new Set(userRecords.map(r => r.customer))];
      console.log(`Customer names from milk records for ${user.name}:`, customerNamesFromRecords);
      
      // Test the getAllCustomers logic
      const customersFromRecords = await Customer.find({ 
        name: { $in: customerNamesFromRecords },
        user: user._id 
      });
      console.log(`Customers found using milk records for ${user.name}:`, customersFromRecords.map(c => c.name));
    }

    // Test milk record isolation
    console.log('\n=== MILK RECORD ISOLATION TESTS ===');
    for (const user of users) {
      console.log(`\n--- Milk Records for User: ${user.name} ---`);
      const userRecords = await MilkRecord.find({ user: user._id });
      console.log(`Total records: ${userRecords.length}`);
      if (userRecords.length > 0) {
        console.log('Sample records:', userRecords.slice(0, 3).map(r => ({
          customer: r.customer,
          amount: r.amount,
          date: r.createdAt.toISOString().slice(0, 10)
        })));
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testUserIsolation(); 