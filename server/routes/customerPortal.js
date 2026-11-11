const express = require('express');
const router = express.Router();
const { authenticateCustomer } = require('../middleware/customerAuth');
const { getMyRecords } = require('../controllers/customerPortalController');

router.get('/records', authenticateCustomer, getMyRecords);

module.exports = router;
