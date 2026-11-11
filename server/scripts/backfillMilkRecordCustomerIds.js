const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Customer = require('../models/Customer');
const MilkRecord = require('../models/MilkRecord');

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/milk-record';
  await mongoose.connect(mongoUri);

  const pending = await MilkRecord.find({ customerId: { $exists: false } }).select('_id customer user');
  let linked = 0;
  let ambiguous = 0;
  let missing = 0;

  for (const record of pending) {
    const matches = await Customer.find({
      user: record.user,
      name: record.customer
    }).select('_id').limit(2);

    if (matches.length === 1) {
      await MilkRecord.updateOne(
        { _id: record._id, customerId: { $exists: false } },
        { $set: { customerId: matches[0]._id } }
      );
      linked += 1;
    } else if (matches.length > 1) {
      ambiguous += 1;
    } else {
      missing += 1;
    }
  }

  console.log(JSON.stringify({
    scanned: pending.length,
    linked,
    skippedAmbiguous: ambiguous,
    skippedMissingCustomer: missing
  }, null, 2));
}

run()
  .catch(error => {
    console.error('Customer link migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
