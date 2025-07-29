const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');
const MilkRecord = require('../models/MilkRecord');
require('dotenv').config();

async function checkMilkRecords() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log('\n=== USERS ===');
    users.forEach(user => {
      console.log(`User: ${user.name} (ID: ${user._id})`);
    });

    // Get all milk records
    const allRecords = await MilkRecord.find();
    console.log('\n=== ALL MILK RECORDS ===');
    allRecords.forEach(record => {
      const user = users.find(u => u._id.toString() === record.user.toString());
      console.log(`Record: Customer=${record.customer}, Amount=${record.amount}, User=${user?.name || 'Unknown'}, Date=${record.createdAt.toISOString().slice(0, 10)}`);
    });

    // Check for mismatched records
    console.log('\n=== CHECKING FOR MISMATCHES ===');
    for (const record of allRecords) {
      const recordUser = users.find(u => u._id.toString() === record.user.toString());
      const customer = await Customer.findOne({ name: record.customer });
      
      if (customer) {
        const customerUser = users.find(u => u._id.toString() === customer.user.toString());
        if (recordUser?.name !== customerUser?.name) {
          console.log(`❌ MISMATCH: Record created by ${recordUser?.name} for customer ${record.customer} (belongs to ${customerUser?.name})`);
        } else {
          console.log(`✅ MATCH: Record created by ${recordUser?.name} for customer ${record.customer} (belongs to ${customerUser?.name})`);
        }
      } else {
        console.log(`⚠️  NO CUSTOMER: Record created by ${recordUser?.name} for customer ${record.customer} (customer not found in database)`);
      }
    }

  } catch (error) {
    console.error('Check error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkMilkRecords(); 