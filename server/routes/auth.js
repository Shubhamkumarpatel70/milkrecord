const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
// Customer portal access remains separate; it must be upgraded to OTP before production use.
router.post('/customer-login', authController.customerLogin);

// Owner payment settings require a verified owner session.
router.post('/payment-option', authenticate, authController.addPaymentOption);
router.get('/payment-option/me', authenticate, authController.getPaymentOption);
router.get('/payment-option/:userId', authenticate, authController.getPaymentOption);
router.post('/generate-payment-qr', authenticate, authController.generatePaymentQR);

module.exports = router;
