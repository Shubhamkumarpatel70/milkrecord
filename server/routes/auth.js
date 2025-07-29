const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/customer-login', authController.customerLogin);

// Payment option routes
router.post('/payment-option', authController.addPaymentOption);
router.get('/payment-option/:userId', authController.getPaymentOption);
router.post('/generate-payment-qr', authController.generatePaymentQR);

module.exports = router; 