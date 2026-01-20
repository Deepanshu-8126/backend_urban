const express = require('express');
const router = express.Router();

// Dummy Data Controller logic here directly to avoid controller missing error
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: [
            { location: "Main Road", congestion: "High", count: 120 },
            { location: "City Center", congestion: "Moderate", count: 85 }
        ]
    });
});

module.exports = router;