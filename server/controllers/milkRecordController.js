const MilkRecord = require('../models/MilkRecord');
const User = require('../models/User');
const Customer = require('../models/Customer');
const moment = require('moment');

exports.createMilkRecord = async (req, res) => {
  try {
    const { customer, quantityKg, amount, whatsapp, createdAt, shift = 'morning' } = req.body;
    const ownerId = req.authUser._id;
    const quantity = Number(quantityKg), totalAmount = Number(amount);
    if (!String(customer || '').trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(totalAmount) || totalAmount < 0 || !['morning', 'evening'].includes(shift)) {
      return res.status(400).json({ message: 'Enter a customer, valid user, positive quantity and non-negative amount.' });
    }
    const entryDate = createdAt ? new Date(createdAt) : new Date();
    if (Number.isNaN(entryDate.getTime()) || entryDate > new Date(Date.now() + 5 * 60 * 1000)) return res.status(400).json({ message: 'Invalid milk record date.' });
    
    // Verify that the customer belongs to the user
    const customerMatches = await Customer.find({ name: String(customer).trim(), user: ownerId }).limit(2);
    if (customerMatches.length > 1) return res.status(409).json({ message: 'More than one customer has this name. Rename duplicates before adding milk records.' });
    const customerDoc = customerMatches[0];
    if (!customerDoc) {
      return res.status(403).json({ message: 'You can only create records for your own customers.' });
    }
    
    const record = new MilkRecord({ customer: String(customer).trim(), customerId: customerDoc._id, quantityKg: quantity, amount: totalAmount, user: ownerId, whatsapp: whatsapp || customerDoc.whatsapp, shift, createdAt: entryDate });
    await record.save();
    res.status(201).json({ message: 'Milk record saved successfully.', record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateMilkRecord = async (req, res) => {
  try {
    const ownerId = req.authUser._id;
    const { customer, quantityKg, amount, shift, createdAt } = req.body;
    const quantity = Number(quantityKg);
    const totalAmount = Number(amount);
    const entryDate = new Date(createdAt);

    if (!String(customer || '').trim() || !Number.isFinite(quantity) || quantity <= 0 ||
        !Number.isFinite(totalAmount) || totalAmount < 0 ||
        !['morning', 'evening'].includes(shift) || Number.isNaN(entryDate.getTime()) ||
        entryDate > new Date(Date.now() + 5 * 60 * 1000)) {
      return res.status(400).json({ message: 'Enter valid customer, quantity, amount, shift and date.' });
    }

    const record = await MilkRecord.findOne({ _id: req.params.recordId, user: ownerId });
    if (!record) return res.status(404).json({ message: 'Milk record not found.' });
    if (totalAmount < Number(record.paidAmount || 0)) {
      return res.status(400).json({ message: 'Amount cannot be lower than the payment already received.' });
    }

    const customerMatches = await Customer.find({ name: String(customer).trim(), user: ownerId }).limit(2);
    if (customerMatches.length > 1) return res.status(409).json({ message: 'More than one customer has this name. Rename duplicates before editing this record.' });
    const customerDoc = customerMatches[0];
    if (!customerDoc) return res.status(400).json({ message: 'Select a customer from your customer list.' });

    record.customer = customerDoc.name;
    record.customerId = customerDoc._id;
    record.whatsapp = customerDoc.whatsapp;
    record.quantityKg = quantity;
    record.amount = totalAmount;
    record.shift = shift;
    record.createdAt = entryDate;
    record.status = Number(record.paidAmount || 0) >= totalAmount ? 'paid' : 'unpaid';
    await record.save();

    return res.json({ message: 'Milk record updated successfully.', record });
  } catch (err) {
    console.error('Update milk record error:', err);
    return res.status(500).json({ message: 'Unable to update milk record.' });
  }
};

// Get all users with name, month, total days, total amount
exports.getAllUserSummaries = async (req, res) => {
  try {
    const userId = String(req.authUser._id);
    
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
    const customerIdMap = {};
    customerDocs.forEach(c => { customerWhatsAppMap[c.name] = c.whatsapp; customerIdMap[c.name] = String(c._id); });

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
          _id: customerIdMap[customerName] || null,
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
    const userId = String(req.authUser._id);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get all milk records for this user to find their customers
    const userRecords = await MilkRecord.find({ user: userId });
    
    // Extract unique customer names from the user's records
    const customerNames = [...new Set(userRecords.map(record => record.customer))];
    
    // Get customer details for these customers (only for this user)
    const customers = await Customer.find({ 
      name: { $in: customerNames },
      user: userId 
    }, '_id name');
        
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get today's total milk quantity across all customers
exports.getTodaysMilkQuantity = async (req, res) => {
  try {
    const userId = String(req.authUser._id);
    
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
    const userId = String(req.authUser._id);
    
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
    const userId = String(req.authUser._id);
    const { month, customerName } = req.query; // month: YYYY-MM
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
    const userId = String(req.authUser._id);
        
    if (!recordId) {
      return res.status(400).json({ message: 'Record ID is required.' });
    }
    
    const record = await MilkRecord.findOne({ _id: recordId, user: userId });
    if (!record) return res.status(404).json({ message: 'Record not found.' });
    
    if (status !== undefined && !['paid', 'unpaid'].includes(status)) return res.status(400).json({ message: 'Invalid payment status.' });
    if (paidAmount !== undefined && (!Number.isFinite(Number(paidAmount)) || Number(paidAmount) < 0 || Number(paidAmount) > record.amount)) return res.status(400).json({ message: 'Paid amount must be between zero and the record amount.' });
    if (paidAmount !== undefined) record.paidAmount = Number(paidAmount);
    else if (status === 'paid') record.paidAmount = record.amount;
    else if (status === 'unpaid') record.paidAmount = 0;
    
    // Ensure status is consistent with paid amount
    if (record.paidAmount >= record.amount) {
      record.status = 'paid';
      record.paidAmount = record.amount; // Ensure we don't overpay
    } else if (record.paidAmount < record.amount) {
      record.status = 'unpaid';
    }
    
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
    const userId = String(req.authUser._id);
    const paymentAmount = Math.round(Number(amount) * 100) / 100;

    if (!customerId || !Number.isFinite(paymentAmount) || paymentAmount <= 0 || !/^[0-9]{4}-[0-9]{2}$/.test(String(month || ''))) {
      return res.status(400).json({ message: 'Enter a valid customer, payment amount, and month (YYYY-MM).' });
    }

    const customer = await Customer.findOne({ _id: customerId, user: userId });
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    const start = moment(month + '-01');
    if (!start.isValid() || start.format('YYYY-MM') !== month) {
      return res.status(400).json({ message: 'Invalid payment month.' });
    }
    const end = start.clone().add(1, 'month');

    const sameNameCustomers = await Customer.find({ user: userId, name: customer.name }).select('_id');
    const recordMatch = sameNameCustomers.length === 1
      ? { $or: [{ customerId: customer._id }, { customerId: { $exists: false }, customer: customer.name }] }
      : { customerId: customer._id };
    const records = await MilkRecord.find({
      user: userId,
      ...recordMatch,
      createdAt: { $gte: start.toDate(), $lt: end.toDate() }
    }).sort({ createdAt: 1, _id: 1 });

    if (!records.length) return res.status(404).json({ message: 'No records found for this month.' });

    const totalAmount = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const totalPaid = records.reduce((sum, record) => sum + Number(record.paidAmount || 0), 0);
    const remainingAmount = Math.max(0, Math.round((totalAmount - totalPaid) * 100) / 100);
    if (paymentAmount > remainingAmount) {
      return res.status(400).json({ message: 'Payment amount exceeds remaining balance.', remainingAmount });
    }

    let remainingPayment = paymentAmount;
    for (const record of records) {
      if (remainingPayment <= 0) break;
      const recordRemaining = Math.max(0, Math.round((Number(record.amount || 0) - Number(record.paidAmount || 0)) * 100) / 100);
      if (recordRemaining <= 0) continue;
      const applied = Math.min(remainingPayment, recordRemaining);
      record.paidAmount = Math.round((Number(record.paidAmount || 0) + applied) * 100) / 100;
      record.status = record.paidAmount >= Number(record.amount || 0) ? 'paid' : 'unpaid';
      await record.save();
      remainingPayment = Math.round((remainingPayment - applied) * 100) / 100;
    }

    const newRemaining = Math.max(0, Math.round((remainingAmount - paymentAmount) * 100) / 100);
    return res.json({
      success: true,
      message: `Payment of ₹${paymentAmount.toFixed(2)} recorded successfully.`,
      totalPaid: Math.round((totalPaid + paymentAmount) * 100) / 100,
      remainingAmount: newRemaining
    });
  } catch (err) {
    console.error('Customer payment error:', err);
    return res.status(500).json({ message: 'Unable to process payment. Please try again.' });
  }
};
