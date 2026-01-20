const mongoose = require('mongoose');
require('dotenv').config();

const DisasterAlert = require('./src/models/DisasterAlert');
const TrafficData = require('./src/models/TrafficData');
const EnvironmentData = require('./src/models/EnvironmentData');

const seedFull = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');

    // 1. TRAFFIC DATA
    await TrafficData.deleteMany({});
    await TrafficData.insertMany([
      { locationName: "Main Highway", congestionLevel: "High", vehicleCount: 120, coordinates: { lat: 28.61, lng: 77.20 } },
      { locationName: "Market Road", congestionLevel: "Jam", vehicleCount: 450, coordinates: { lat: 28.62, lng: 77.21 } },
      { locationName: "City Park", congestionLevel: "Low", vehicleCount: 30, coordinates: { lat: 28.60, lng: 77.19 } },
    ]);
    console.log('🚗 Traffic Data Seeded');

    // 2. DISASTER ALERTS
    await DisasterAlert.deleteMany({});
    await DisasterAlert.insertMany([
      { type: "Flood", severity: "Critical", location: "River Bank Area", coordinates: { lat: 28.55, lng: 77.25 }, description: "Water levels rising above danger mark." },
      { type: "Fire", severity: "Medium", location: "Sector 14 Industrial", coordinates: { lat: 28.58, lng: 77.30 }, description: "Factory fire reported. Fire trucks dispatched." }
    ]);
    console.log('sos Disaster Data Seeded');

    // 3. ENVIRONMENT DATA
    await EnvironmentData.deleteMany({});
    await EnvironmentData.insertMany([
      { area: "Industrial Zone", aqi: 250, pm25: 120, no2: 80, status: "Unhealthy" },
      { area: "Residential Zone", aqi: 85, pm25: 40, no2: 20, status: "Moderate" },
      { area: "City Forest", aqi: 45, pm25: 15, no2: 10, status: "Good" }
    ]);
    console.log('🌍 Environment Data Seeded');

    console.log('✅ FULL SYSTEM READY!');
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

seedFull();