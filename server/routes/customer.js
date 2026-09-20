const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/', customerController.createCustomer);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);

// New routes for customer verification and records
router.post('/:customerId/verify', customerController.verifyCustomerAccess);
router.get('/:customerId/records', customerController.getCustomerRecords);

module.exports = router; 