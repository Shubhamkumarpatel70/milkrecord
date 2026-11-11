const Customer = require('../models/Customer');
const MilkRecord = require('../models/MilkRecord'); // Added this import for getCustomerRecords

exports.createCustomer = async (req, res) => {
  try {
    const { name, whatsapp } = req.body;
    const normalizedName = String(name || '').trim();
    const normalizedWhatsApp = String(whatsapp || '').replace(/[^0-9]/g, '');
    if (!normalizedName) {
      return res.status(400).json({ message: 'Customer name is required.' });
    }
    if (!normalizedWhatsApp) {
      return res.status(400).json({ message: 'WhatsApp number is required.' });
    }
    if (!/^[6-9][0-9]{9}$/.test(normalizedWhatsApp)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian WhatsApp number.' });
    }
    const ownerId = req.authUser._id;
    const duplicate = await Customer.findOne({ user: ownerId, name: normalizedName });
    if (duplicate) return res.status(409).json({ message: 'A customer with this name already exists.' });
    const customer = new Customer({ name: normalizedName, whatsapp: normalizedWhatsApp, user: ownerId });
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
    const userId = String(req.authUser._id);
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
    const userId = String(req.authUser._id);
    const customer = await Customer.findOne({ _id: req.params.id, user: req.authUser._id });
    
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
    const customer = await Customer.findOne({ _id: customerId, user: req.authUser._id });
    
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
    
    if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(String(month || ''))) {
      return res.status(400).json({ message: 'Month parameter must use YYYY-MM format.' });
    }
    
    // Get customer details
    const customer = await Customer.findOne({ _id: customerId, user: req.authUser._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // Get milk records for this customer in the specified month
    const start = new Date(month + '-01');
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    
    const sameNameCustomers = await Customer.find({ user: customer.user, name: customer.name }).select('_id');
    if (sameNameCustomers.length > 1) {
      return res.status(409).json({ message: 'This customer name is shared by multiple customers. Resolve duplicate names before viewing legacy history.' });
    }
    const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const records = await MilkRecord.find({
      user: customer.user,
      $or: [{ customerId: customer._id }, { customerId: { $exists: false }, customer: customer.name }],
      createdAt: { $gte: start, $lt: nextMonth }
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

exports.deleteCustomer = async (req, res) => {
  try {
    const userId = String(req.authUser._id);
    if (!userId) return res.status(400).json({ message: 'userId is required.' });
    const customer = await Customer.findOne({ _id: req.params.customerId, user: userId });
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    // MilkRecord currently stores customer names rather than a stable customerId.
    // Deleting records by name can erase another customer's history when names repeat.
    // Preserve historical milk records until they can be linked by customerId safely.
    await customer.deleteOne();
    return res.json({ message: 'Customer deleted. Historical milk records were preserved.' });
  } catch (err) {
    console.error('Delete customer error:', err.message);
    return res.status(400).json({ message: 'Unable to delete customer.' });
  }
};
