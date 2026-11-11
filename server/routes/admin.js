const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All administrative APIs require a valid token and admin role.
router.use(authenticate, requireAdmin);
router.get('/users', adminController.getAllUsers);
router.get('/customers', adminController.getAllCustomers);
router.get('/milk-records', adminController.getAllMilkRecords);
router.put('/users/:userId', adminController.updateUser);
router.patch('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/stats/system', adminController.getSystemStats);
router.get('/stats/user/:userId', adminController.getUserStats);
router.get('/stats/transactions', adminController.getTransactionStats);

module.exports = router;
