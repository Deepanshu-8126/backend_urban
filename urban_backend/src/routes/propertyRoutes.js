const express = require('express');
const router = express.Router();
const { createProperty, getProperties, calculateTax, getRevenueStats } = require('../controllers/propertyController');

router.post('/', createProperty);
router.get('/', getProperties);
router.get('/revenue-stats', getRevenueStats);
router.post('/calculate-tax', calculateTax);

module.exports = router;