const express = require('express');
const router = express.Router();
const milkRecordController = require('../controllers/milkRecordController');
const { authenticate } = require('../middleware/auth');

// Every dairy-owner milk-record operation is protected by a signed session.
router.use(authenticate);
router.post('/', milkRecordController.createMilkRecord);
router.get('/', milkRecordController.getAllUserSummaries);
router.get('/customers', milkRecordController.getAllCustomers);
router.get('/today', milkRecordController.getTodaysMilkQuantity);
router.get('/total', milkRecordController.getTotalMilkQuantity);
router.get('/details', milkRecordController.getCustomerDetails);
router.put('/status', milkRecordController.updateMilkRecordStatus);
router.put('/:recordId', milkRecordController.updateMilkRecord);
router.delete('/:recordId', milkRecordController.deleteMilkRecord);
router.post('/payment', milkRecordController.customerPayment);

module.exports = router;
