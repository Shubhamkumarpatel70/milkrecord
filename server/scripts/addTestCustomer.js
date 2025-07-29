const mongoose = require('mongoose');
const Customer = require('../models/Customer');
require('dotenv').config();

async function addTestCustomer() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/milk-record');
    console.log('Connected to MongoDB');

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ whatsapp: '0987654321' });
    if (existingCustomer) {
      console.log('Test customer already exists:', existingCustomer);
      return;
    }

    // Create test customer
    const testCustomer = new Customer({
      name: 'Test Customer',
      whatsapp: '0987654321'
    });

    await testCustomer.save();
    console.log('Test customer created successfully:', testCustomer);

    // List all customers
    const allCustomers = await Customer.find();
    console.log('All customers in database:', allCustomers);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

addTestCustomer(); 