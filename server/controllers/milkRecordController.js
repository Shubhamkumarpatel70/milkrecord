const MilkRecord = require('../models/MilkRecord');
const User = require('../models/User');
const Customer = require('../models/Customer');
const moment = require('moment');

exports.createMilkRecord = async (req, res) => {
  try {
    const { customer, quantityKg, amount, user, whatsapp } = req.body;
    if (!customer || !quantityKg || !amount || !user) {
      return res.status(400).json({ message: 'Customer, quantity in kg, amount, and user are required.' });
    }
    
    // Verify that the customer belongs to the user
    const customerDoc = await Customer.findOne({ name: customer, user: user });
    if (!customerDoc) {
      return res.status(403).json({ message: 'You can only create records for your own customers.' });
    }
    
    const record = new MilkRecord({ customer, quantityKg, amount, user, whatsapp });
    await record.save();
    res.status(201).json({ message: 'Milk record saved successfully.', record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all users with name, month, total days, total amount
exports.getAllUserSummaries = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get all milk records for this specific user
    const userRecords = await MilkRecord.find({ user: userId });
    
    // Group records by customer and month
    const customerMonthMap = {};
    
    userRecords.forEach(record => {
      const month = record.createdAt.toISOString().slice(0,7); // YYYY-MM
      const customerName = record.customer;
      
      if (!customerMonthMap[customerName]) {
        customerMonthMap[customerName] = {};
      }
      
      if (!customerMonthMap[customerName][month]) {
        customerMonthMap[customerName][month] = { 
          days: new Set(), 
          totalAmount: 0, 
          paidAmount: 0,
          records: []
        };
      }
      
      customerMonthMap[customerName][month].days.add(record.createdAt.toISOString().slice(0,10));
      customerMonthMap[customerName][month].totalAmount += record.amount;
      customerMonthMap[customerName][month].paidAmount += (record.paidAmount || 0);
      customerMonthMap[customerName][month].records.push(record);
    });
    
    // Always include current month for all customers, even if no records exist
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}`;
    
    // Get all customers that this user has records for
    const customerNames = Object.keys(customerMonthMap);

    // Fetch WhatsApp numbers for these customers (only for this user)
    const customerDocs = await Customer.find({ 
      name: { $in: customerNames },
      user: userId 
    });
    const customerWhatsAppMap = {};
    customerDocs.forEach(c => { customerWhatsAppMap[c.name] = c.whatsapp; });

    // For each customer, ensure current month exists
    customerNames.forEach(customerName => {
      if (!customerMonthMap[customerName][currentMonth]) {
        customerMonthMap[customerName][currentMonth] = {
          days: new Set(),
          totalAmount: 0,
          paidAmount: 0,
          records: []
        };
      }
    });
    
    // Convert to summary format
    const summaries = [];
    
    Object.entries(customerMonthMap).forEach(([customerName, months]) => {
      Object.entries(months).forEach(([month, data]) => {
        const status = data.paidAmount >= data.totalAmount ? 'paid' : 'unpaid';
        summaries.push({
          name: customerName,
          whatsapp: customerWhatsAppMap[customerName] || '',
          month,
          totalDays: data.days.size,
          totalAmount: data.totalAmount,
          paidAmount: data.paidAmount,
          status,
          userId: userId // Use the logged-in user's ID
        });
      });
    });
    
    // Sort by month (newest first)
    summaries.sort((a, b) => b.month.localeCompare(a.month));
    
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log('=== getAllCustomers Debug ===');
    console.log('Requested userId:', userId);
    
    // Get all milk records for this user to find their customers
    const userRecords = await MilkRecord.find({ user: userId });
    console.log('User records found:', userRecords.length);
    console.log('User records:', userRecords.map(r => ({ customer: r.customer, amount: r.amount, date: r.createdAt })));
    
    // Extract unique customer names from the user's records
    const customerNames = [...new Set(userRecords.map(record => record.customer))];
    console.log('Unique customer names from user records:', customerNames);
    
    // Get customer details for these customers (only for this user)
    const customers = await Customer.find({ 
      name: { $in: customerNames },
      user: userId 
    }, '_id name');
    console.log('Customers found in database:', customers.length, customers.map(c => c.name));
    
    // Also check all customers in database for comparison
    const allCustomers = await Customer.find({}, '_id name');
    console.log('All customers in database:', allCustomers.length, allCustomers.map(c => c.name));
    
    console.log('=== End Debug ===');
    
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get today's total milk quantity across all customers
exports.getTodaysMilkQuantity = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all milk records for today for this specific user
    const todaysRecords = await MilkRecord.find({
      user: userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Calculate total quantity in kg only
    const totalQuantityKg = todaysRecords.reduce((sum, record) => sum + (record.quantityKg || 0), 0);
    
    console.log(`Today's total milk quantity for user ${userId}: ${totalQuantityKg}kg from ${todaysRecords.length} records`);
    
    res.json({
      totalQuantityKg: totalQuantityKg,
      recordCount: todaysRecords.length,
      date: today.toISOString().slice(0, 10)
    });
  } catch (err) {
    console.error('Error fetching today\'s milk quantity:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get total milk quantity across all records (all-time)
exports.getTotalMilkQuantity = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get all milk records for this specific user
    const allRecords = await MilkRecord.find({ user: userId });
    
    // Calculate total quantity in kg only
    const totalQuantityKg = allRecords.reduce((sum, record) => sum + (record.quantityKg || 0), 0);
    
    console.log(`Total milk quantity (all-time) for user ${userId}: ${totalQuantityKg}kg from ${allRecords.length} records`);
    
    res.json({
      totalQuantityKg: totalQuantityKg,
      recordCount: allRecords.length
    });
  } catch (err) {
    console.error('Error fetching total milk quantity:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getCustomerDetails = async (req, res) => {
  try {
    const { userId, month, customerName } = req.query; // month: YYYY-MM
    console.log('getCustomerDetails userId:', userId, 'month:', month, 'customerName:', customerName);
    if (!month) return res.status(400).json({ message: 'month is required.' });
    
    // If customerName is provided, we can work without userId (for customer dashboard)
    // If userId is provided, we can work with or without customerName
    const start = moment(month + '-01');
    const end = start.clone().endOf('month');
    
    let records;
    if (customerName && !userId) {
      // Get records for a specific customer without user filter (for customer dashboard)
      records = await MilkRecord.find({
        customer: customerName,
        createdAt: { $gte: start.toDate(), $lte: end.toDate() }
      });
    } else if (customerName && userId) {
      // Get records for a specific customer and user
      records = await MilkRecord.find({
        customer: customerName,
        user: userId,
        createdAt: { $gte: start.toDate(), $lte: end.toDate() }
      });
    } else if (userId) {
      // Get all records for this user in the month
      records = await MilkRecord.find({
        user: userId,
        createdAt: { $gte: start.toDate(), $lte: end.toDate() }
      });
    } else {
      return res.status(400).json({ message: 'Either userId or customerName is required.' });
    }
    // Build a map of date -> records (array of records for each day)
    const recordMap = {};
    records.forEach(r => {
      const day = moment(r.createdAt).format('YYYY-MM-DD');
      if (!recordMap[day]) {
        recordMap[day] = [];
      }
      recordMap[day].push(r);
    });
    
    // Build all days in the month
    const days = [];
    let totalAmount = 0;
    for (let d = start.clone(); d.isSameOrBefore(end); d.add(1, 'day')) {
      const dayStr = d.format('YYYY-MM-DD');
      const dayRecords = recordMap[dayStr] || [];
      
      // Calculate total amount for this day
      const dayAmount = dayRecords.reduce((sum, rec) => sum + rec.amount, 0);
      totalAmount += dayAmount;
      
      // Create a combined record for the day
      let combinedRecord = null;
      if (dayRecords.length > 0) {
        const totalQuantityKg = dayRecords.reduce((sum, rec) => sum + (rec.quantityKg || 0), 0);
        const totalPaidAmount = dayRecords.reduce((sum, rec) => sum + (rec.paidAmount || 0), 0);
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
    
    // If no customerName was provided, this is a user view, so we need to group by customer
    if (!customerName) {
      // Group records by customer for user view
      const customerGroups = {};
      records.forEach(record => {
        if (!customerGroups[record.customer]) {
          customerGroups[record.customer] = [];
        }
        customerGroups[record.customer].push(record);
      });
      
      // Calculate totals per customer
      const customerTotals = {};
      Object.keys(customerGroups).forEach(customer => {
        const customerRecords = customerGroups[customer];
        customerTotals[customer] = {
          totalAmount: customerRecords.reduce((sum, rec) => sum + rec.amount, 0),
          totalPaid: customerRecords.reduce((sum, rec) => sum + (rec.paidAmount || 0), 0),
          totalDays: customerRecords.length
        };
      });
      
      res.json({
        days,
        totalDays: records.length,
        totalAmount,
        records: records,
        customerGroups: customerGroups,
        customerTotals: customerTotals
      });
    } else {
      res.json({
        days,
        totalDays: records.length,
        totalAmount,
        records: records
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateMilkRecordStatus = async (req, res) => {
  try {
    const { recordId, status, paidAmount } = req.body;
    console.log('Updating record:', recordId, 'with status:', status, 'paidAmount:', paidAmount);
    
    if (!recordId) {
      return res.status(400).json({ message: 'Record ID is required.' });
    }
    
    const record = await MilkRecord.findById(recordId);
    if (!record) return res.status(404).json({ message: 'Record not found.' });
    
    // Update the record with the provided values
    if (status !== undefined) {
      record.status = status;
    }
    if (paidAmount !== undefined) {
      record.paidAmount = paidAmount;
    }
    
    // Ensure status is consistent with paid amount
    if (record.paidAmount >= record.amount) {
      record.status = 'paid';
      record.paidAmount = record.amount; // Ensure we don't overpay
    } else if (record.paidAmount < record.amount) {
      record.status = 'unpaid';
    }
    
    console.log('Saving record with status:', record.status, 'paidAmount:', record.paidAmount);
    await record.save();
    
    res.json({ message: 'Status updated.', record });
  } catch (err) {
    console.error('Error updating milk record status:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}; 

// Customer payment functionality
exports.customerPayment = async (req, res) => {
  try {
    const { customerId, amount, month } = req.body;
    
    if (!customerId || !amount || !month) {
      return res.status(400).json({ message: 'Customer ID, amount, and month are required.' });
    }
    
    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    
    // Get all records for the customer in the specified month
    const start = moment(month + '-01');
    const end = start.clone().endOf('month');
    
    const records = await MilkRecord.find({
      customer: customer.name,
      createdAt: { $gte: start.toDate(), $lte: end.toDate() }
    });
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found for this month.' });
    }
    
    // Calculate total amount and paid amount
    const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
    const totalPaid = records.reduce((sum, record) => sum + (record.paidAmount || 0), 0);
    const remainingAmount = totalAmount - totalPaid;
    
    if (amount > remainingAmount) {
      return res.status(400).json({ message: 'Payment amount exceeds remaining balance.' });
    }
    
    // Distribute payment across records (prioritize older records)
    let remainingPayment = amount;
    for (const record of records) {
      if (remainingPayment <= 0) break;
      
      const recordRemaining = record.amount - (record.paidAmount || 0);
      if (recordRemaining > 0) {
        const paymentForThisRecord = Math.min(remainingPayment, recordRemaining);
        record.paidAmount = (record.paidAmount || 0) + paymentForThisRecord;
        record.status = record.paidAmount >= record.amount ? 'paid' : 'unpaid';
        await record.save();
        remainingPayment -= paymentForThisRecord;
      }
    }
    
    res.json({
      success: true,
      message: `Payment of ₹${amount} processed successfully.`,
      totalPaid: totalPaid + amount,
      remainingAmount: remainingAmount - amount
    });
    
  } catch (err) {
    console.error('Customer payment error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}; 