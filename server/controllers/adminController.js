const User = require('../models/User');
const Customer = require('../models/Customer');
const MilkRecord = require('../models/MilkRecord');

// Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-mpin'); // Exclude MPIN for security
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all customers for admin
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate('user', 'name');
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all milk records for admin
exports.getAllMilkRecords = async (req, res) => {
  try {
    const records = await MilkRecord.find().populate('user', 'name');
    res.json(records);
  } catch (err) {
    console.error('Error fetching milk records:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update user by admin
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, mobile, mpin, upiId, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update basic fields
    user.name = name;
    user.mobile = mobile;
    if (mpin) user.mpin = mpin;
    user.isActive = isActive;

    // Update payment options
    if (!user.paymentOptions) {
      user.paymentOptions = {};
    }
    if (upiId !== undefined) {
      user.paymentOptions.upiId = upiId;
      user.paymentOptions.hasPaymentOption = !!upiId;
    }

    await user.save();
    res.json({ message: 'User updated successfully.', user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Toggle user status (enable/disable)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ 
      message: `User ${isActive ? 'enabled' : 'disabled'} successfully.`,
      user: { _id: user._id, name: user.name, isActive: user.isActive }
    });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete user by admin
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if user has any associated data
    const customerCount = await Customer.countDocuments({ user: userId });
    const recordCount = await MilkRecord.countDocuments({ user: userId });

    if (customerCount > 0 || recordCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete user. User has ${customerCount} customers and ${recordCount} milk records.` 
      });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalRecords = await MilkRecord.countDocuments();
    
    const totalAmount = await MilkRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalMilkQuantity = await MilkRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$quantityKg' } } }
    ]);

    const activeUsers = await User.countDocuments({ isActive: { $ne: false } });
    const usersWithPaymentOptions = await User.countDocuments({ 'paymentOptions.hasPaymentOption': true });

    res.json({
      totalUsers,
      activeUsers,
      totalCustomers,
      totalRecords,
      totalAmount: totalAmount[0]?.total || 0,
      totalMilkQuantity: totalMilkQuantity[0]?.total || 0,
      usersWithPaymentOptions
    });
  } catch (err) {
    console.error('Error fetching system stats:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const customerCount = await Customer.countDocuments({ user: userId });
    const recordCount = await MilkRecord.countDocuments({ user: userId });
    
    const totalAmount = await MilkRecord.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalMilkQuantity = await MilkRecord.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$quantityKg' } } }
    ]);

    const recentRecords = await MilkRecord.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        isActive: user.isActive,
        paymentOptions: user.paymentOptions
      },
      stats: {
        customerCount,
        recordCount,
        totalAmount: totalAmount[0]?.total || 0,
        totalMilkQuantity: totalMilkQuantity[0]?.total || 0
      },
      recentRecords
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilter = { createdAt: { $gte: today, $lt: tomorrow } };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    const records = await MilkRecord.find(dateFilter).populate('user', 'name');
    const totalAmount = records.reduce((sum, record) => sum + (record.amount || 0), 0);
    const totalQuantity = records.reduce((sum, record) => sum + (record.quantityKg || 0), 0);

    // Group by user
    const userStats = await MilkRecord.aggregate([
      { $match: dateFilter },
      { $group: { 
        _id: '$user', 
        totalAmount: { $sum: '$amount' },
        totalQuantity: { $sum: '$quantityKg' },
        recordCount: { $sum: 1 }
      }},
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' }},
      { $unwind: '$user' },
      { $project: { 
        userName: '$user.name',
        totalAmount: 1,
        totalQuantity: 1,
        recordCount: 1
      }}
    ]);

    res.json({
      period,
      totalRecords: records.length,
      totalAmount,
      totalQuantity,
      userStats
    });
  } catch (err) {
    console.error('Error fetching transaction stats:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}; 