const mongoose = require('mongoose');
const MilkRecord = require('../models/MilkRecord');
const Customer = require('../models/Customer');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const customers = await Customer.find();
  const customerNames = new Set(customers.map(c => c.name));
  const orphaned = await MilkRecord.find({ customer: { $nin: Array.from(customerNames) } });
  if (orphaned.length === 0) {
    console.log('No orphaned milk records found.');
  } else {
    console.log('Orphaned milk records:');
    orphaned.forEach(r => console.log(r));
  }
  await mongoose.disconnect();
}

main(); 