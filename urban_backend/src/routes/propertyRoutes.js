const express = require('express');
const router = express.Router();
const { getMyProperties, payPropertyTax, calculatePropertyTax } = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/my-properties', authenticateToken, getMyProperties);
router.post('/pay', authenticateToken, payPropertyTax);
router.post('/calculate-tax', authenticateToken, calculatePropertyTax);

module.exports = router;