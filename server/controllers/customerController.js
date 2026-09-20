const Customer = require('../models/Customer');
const MilkRecord = require('../models/MilkRecord'); // Added this import for getCustomerRecords

exports.createCustomer = async (req, res) => {
  try {
    const { name, whatsapp, userId } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ message: 'Name and userId are required.' });
    }
    
    const customer = new Customer({ name, whatsapp, user: userId });
    await customer.save();
    
    res.status(201).json({ message: 'Customer added successfully!', customer });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A customer with this WhatsApp number already exists for this user.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
    
    const customers = await Customer.find({ user: userId }, 'name whatsapp _id');
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { userId } = req.query;
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // If userId is provided, ensure the customer belongs to that user
    if (userId && customer.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. Customer does not belong to this user.' });
    }
    
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}; 

exports.verifyCustomerAccess = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { whatsapp } = req.body;
    
    if (!whatsapp) {
      return res.status(400).json({ message: 'WhatsApp number is required.' });
    }
    
    // Find customer by ID and verify WhatsApp number
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // Verify WhatsApp number matches
    if (customer.whatsapp !== whatsapp) {
      return res.status(403).json({ message: 'Invalid WhatsApp number. Access denied.' });
    }
    
    res.json({
      success: true,
      message: 'Access verified successfully!',
      customer: {
        _id: customer._id,
        name: customer.name,
        whatsapp: customer.whatsapp,
        userId: customer.user
      }
    });
  } catch (err) {
    console.error('Customer verification error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getCustomerRecords = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM format).' });
    }
    
    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // Get milk records for this customer in the specified month
    const start = new Date(month + '-01');
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    
    const records = await MilkRecord.find({
      customer: customer.name,
      user: customer.user,
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: 1 });
    
    // Build a map of date -> records (array of records for each day)
    const recordMap = {};
    records.forEach(r => {
      const day = r.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!recordMap[day]) {
        recordMap[day] = [];
      }
      recordMap[day].push(r);
    });
    
    // Build all days in the month
    const days = [];
    let totalAmount = 0;
    let totalPaid = 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().slice(0, 10);
      const dayRecords = recordMap[dayStr] || [];
      
      // Calculate total amount for this day
      const dayAmount = dayRecords.reduce((sum, rec) => sum + rec.amount, 0);
      totalAmount += dayAmount;
      
      // Create a combined record for the day
      let combinedRecord = null;
      if (dayRecords.length > 0) {
        const totalQuantityKg = dayRecords.reduce((sum, rec) => sum + (rec.quantityKg || 0), 0);
        const totalPaidAmount = dayRecords.reduce((sum, rec) => sum + (rec.paidAmount || 0), 0);
        totalPaid += totalPaidAmount;
        const allPaid = dayRecords.every(rec => rec.status === 'paid');
        
        combinedRecord = {
          _id: dayRecords[0]._id, // Use first record's ID
          quantityKg: totalQuantityKg,
          amount: dayAmount,
          status: allPaid ? 'paid' : 'unpaid',
          paidAmount: totalPaidAmount,
          createdAt: dayRecords[0].createdAt,
          updatedAt: dayRecords[dayRecords.length - 1].updatedAt,
          dayRecords: dayRecords // Include all records for debugging
        };
      }
      
      days.push({
        date: dayStr,
        record: combinedRecord
      });
    }
    
    res.json({
      customer: {
        _id: customer._id,
        name: customer.name,
        whatsapp: customer.whatsapp
      },
      days,
      records,
      summary: {
        totalAmount,
        totalPaid,
        remainingAmount: totalAmount - totalPaid,
        totalDays: records.length
      }
    });
  } catch (err) {
    console.error('Get customer records error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}; 