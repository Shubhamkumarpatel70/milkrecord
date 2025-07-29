const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');
const MilkRecord = require('../models/MilkRecord');
require('dotenv').config();

async function fixMilkRecords() {
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
    console.log('\n=== FIXING MILK RECORDS ===');
    
    let fixedCount = 0;
    let skippedCount = 0;

    for (const record of allRecords) {
      const recordUser = users.find(u => u._id.toString() === record.user.toString());
      const customer = await Customer.findOne({ name: record.customer });
      
      if (customer) {
        const customerUser = users.find(u => u._id.toString() === customer.user.toString());
        
        if (recordUser?.name !== customerUser?.name) {
          console.log(`🔧 FIXING: Record for customer ${record.customer} (created by ${recordUser?.name}, belongs to ${customerUser?.name})`);
          
          // Update the record to belong to the correct user
          await MilkRecord.findByIdAndUpdate(record._id, { user: customer.user });
          fixedCount++;
        } else {
          console.log(`✅ CORRECT: Record for customer ${record.customer} (created by ${recordUser?.name}, belongs to ${customerUser?.name})`);
          skippedCount++;
        }
      } else {
        console.log(`⚠️  NO CUSTOMER: Record for customer ${record.customer} (created by ${recordUser?.name}) - customer not found`);
        skippedCount++;
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Fixed records: ${fixedCount}`);
    console.log(`Skipped records: ${skippedCount}`);
    console.log(`Total records processed: ${allRecords.length}`);

    // Verify the fix
    console.log('\n=== VERIFICATION ===');
    for (const user of users) {
      const userRecords = await MilkRecord.find({ user: user._id });
      console.log(`Records for ${user.name}: ${userRecords.length}`);
      if (userRecords.length > 0) {
        console.log('  Sample records:', userRecords.slice(0, 3).map(r => ({
          customer: r.customer,
          amount: r.amount,
          date: r.createdAt.toISOString().slice(0, 10)
        })));
      }
    }

  } catch (error) {
    console.error('Fix error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

fixMilkRecords(); 