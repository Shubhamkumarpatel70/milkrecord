const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get all data for admin dashboard
router.get('/users', adminController.getAllUsers);
router.get('/customers', adminController.getAllCustomers);
router.get('/milk-records', adminController.getAllMilkRecords);

// User management
router.put('/users/:userId', adminController.updateUser);
router.patch('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Statistics
router.get('/stats/system', adminController.getSystemStats);
router.get('/stats/user/:userId', adminController.getUserStats);
router.get('/stats/transactions', adminController.getTransactionStats);

module.exports = router; 