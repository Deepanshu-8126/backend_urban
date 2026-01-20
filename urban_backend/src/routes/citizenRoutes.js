const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate } = require('../controllers/citizenController');

router.get('/certificates', getCertificates);
router.post('/certificates', createCertificate);

module.exports = router;