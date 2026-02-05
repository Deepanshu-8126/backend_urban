const express = require('express');
const router = express.Router();

// In-Memory State for Real-Time Simulation (No DB needed for this demo feature)
let trafficSignals = [
    { id: '1', location: "Main Road Intersection", status: "RED", density: "High" },
    { id: '2', location: "City Center Market", status: "GREEN", density: "Moderate" },
    { id: '3', location: "IT Park Exit", status: "RED", density: "Low" },
    { id: '4', location: "Hospital Zone", status: "GREEN", density: "Clear" }
];

// Toggle Loop Simulation (Auto-change every 10s if not overridden)
setInterval(() => {
    trafficSignals.forEach(signal => {
        // Randomly fluctuate density
        const densities = ["High", "Moderate", "Low", "Clear"];
        if (Math.random() > 0.7) {
            signal.density = densities[Math.floor(Math.random() * densities.length)];
        }
    });
}, 5000);

// Get Live Signals
router.get('/', (req, res) => {
    res.json({ success: true, data: trafficSignals });
});

// Admin Override
router.post('/toggle', (req, res) => {
    const { id } = req.body;
    const signal = trafficSignals.find(s => s.id === id);
    if (signal) {
        signal.status = signal.status === "RED" ? "GREEN" : "RED";
        res.json({ success: true, message: `Signal at ${signal.location} switched to ${signal.status}`, data: signal });
    } else {
        res.status(404).json({ success: false, message: "Signal not found" });
    }
});

module.exports = router;