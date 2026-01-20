const DisasterAlert = require('../models/DisasterAlert');

// 1. Get Active Alerts (For Mobile App Red Banner)
exports.getActiveAlerts = async (req, res) => {
  try {
    const alerts = await DisasterAlert.find({ active: true }).sort({ timestamp: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Trigger SOS (For Admin/AI)
exports.triggerSOS = async (req, res) => {
  try {
    const { type, location, lat, lng, description } = req.body;
    const alert = await DisasterAlert.create({
      type, location, coordinates: { lat, lng }, description, severity: 'Critical'
    });
    // Yahan Future mein SMS API lag sakti hai
    console.log(`🚨 SOS TRIGGERED: ${type} at ${location}`);
    res.status(201).json({ success: true, message: 'SOS Broadcasted!', data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};