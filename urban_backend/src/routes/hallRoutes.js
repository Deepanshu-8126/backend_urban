const express = require('express');
const router = express.Router();

// Import controller
const hallController = require('../controllers/hallController');

// Import auth middleware
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/nearby', hallController.getNearbyHalls);
router.get('/:id', hallController.getHallDetails);
router.post('/check-availability', hallController.checkAvailability);

// Protected routes (authentication required)
router.post('/book', authenticateToken, hallController.createBooking);
router.get('/user/bookings', authenticateToken, hallController.getUserBookings);

// Import routes (public for development)
router.post('/import/google', (req, res) => {
  res.json({
    success: false,
    error: 'Google Places API not configured yet'
  });
});

router.post('/import/manual', (req, res) => {
  const { name, address, capacity, pricePerDay, latitude, longitude } = req.body;
  
  if (!name || !address || !capacity || !pricePerDay || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required: name, address, capacity, pricePerDay, latitude, longitude'
    });
  }

  // This is a temporary endpoint - in production, you'd use your actual controller method
  res.json({
    success: true,
    message: 'Manual hall import endpoint working',
    data: { name, address, capacity, pricePerDay, latitude, longitude }
  });
});

module.exports = router;