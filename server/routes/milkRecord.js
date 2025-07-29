const express = require('express');
const router = express.Router();
const milkRecordController = require('../controllers/milkRecordController');

router.post('/', milkRecordController.createMilkRecord);
router.get('/', milkRecordController.getAllUserSummaries);
router.get('/customers', milkRecordController.getAllCustomers);
router.get('/today', milkRecordController.getTodaysMilkQuantity);
router.get('/total', milkRecordController.getTotalMilkQuantity);
router.get('/details', milkRecordController.getCustomerDetails);
router.put('/status', milkRecordController.updateMilkRecordStatus);
router.post('/payment', milkRecordController.customerPayment);

module.exports = router; 