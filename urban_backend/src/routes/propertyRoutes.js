const express = require('express');
const router = express.Router();
const { createProperty, getPropertyByWard } = require('../controllers/propertyController');

router.post('/', createProperty);
router.get('/ward/:ward', getPropertyByWard);

module.exports = router;