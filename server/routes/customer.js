const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

// Owner-managed customer records.
router.post('/', authenticate, customerController.createCustomer);
router.get('/', authenticate, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.delete('/:customerId', authenticate, customerController.deleteCustomer);

// Customer-facing endpoints are intentionally separate from owner APIs.
// Phone-number-only customer verification is not strong authentication.
router.post('/:customerId/verify', customerController.verifyCustomerAccess);
router.get('/:customerId/records', customerController.getCustomerRecords);

module.exports = router;
