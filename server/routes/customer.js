const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

// Owner-managed customer records.
router.post('/', authenticate, customerController.createCustomer);
router.get('/', authenticate, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.put('/:id', authenticate, customerController.updateCustomer);
router.delete('/:customerId', authenticate, customerController.deleteCustomer);

// Customer data endpoints also require an authenticated owner session.
// Public customer access is disabled until OTP-based identity verification is implemented.
router.post('/:customerId/verify', authenticate, customerController.verifyCustomerAccess);
router.get('/:customerId/records', authenticate, customerController.getCustomerRecords);

module.exports = router;
