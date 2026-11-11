const Customer = require('../models/Customer');
const MilkRecord = require('../models/MilkRecord');

exports.getMyRecords = async (req, res) => {
  try {
    const month = String(req.query.month || new Date().toISOString().slice(0, 7));
    if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ message: 'Month parameter must use YYYY-MM format.' });
    }
    const customer = req.authCustomer;
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const nextMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    const sameNameCount = await Customer.countDocuments({ user: customer.user, name: customer.name });
    const ownershipFilter = [
      { customerId: customer._id },
      ...(sameNameCount === 1 ? [{ customerId: { $exists: false }, customer: customer.name }] : [])
    ];
    const records = await MilkRecord.find({
      user: customer.user,
      $or: ownershipFilter,
      createdAt: { $gte: start, $lt: nextMonth }
    }).sort({ createdAt: 1 }).select('customer customerId quantityKg amount status paidAmount shift createdAt');
    const totalAmount = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const totalPaid = records.reduce((sum, record) => sum + Number(record.paidAmount || 0), 0);
    return res.json({
      customer: { id: String(customer._id), name: customer.name, mobile: customer.whatsapp },
      month,
      records,
      summary: {
        totalAmount,
        totalPaid,
        remainingAmount: Math.max(0, totalAmount - totalPaid),
        totalQuantityKg: records.reduce((sum, record) => sum + Number(record.quantityKg || 0), 0)
      }
    });
  } catch (error) {
    console.error('Customer portal records error:', error.message);
    return res.status(500).json({ message: 'Unable to load customer records.' });
  }
};
