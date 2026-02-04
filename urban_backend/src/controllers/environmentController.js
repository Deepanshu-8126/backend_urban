const EnvironmentData = require('../models/EnvironmentData');
const axios = require('axios');

exports.getEnvironment = async (req, res) => {
  try {
    const { lat, lng, area } = req.query;
    
    // If coordinates are provided, find nearest station or fetch from external API
    if (lat && lng) {
       // 1. Try to find local data first (within 5km)
       const localData = await EnvironmentData.findOne({
         location: {
           $near: {
             $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
             $maxDistance: 5000 // 5km
           }
         }
       }).sort({ lastUpdated: -1 });

       if (localData && (Date.now() - localData.lastUpdated.getTime()) < 3600000) { // 1 hour cache
         return res.json({ success: true, data: localData, source: 'local' });
       }

       // 2. If no local data or stale, try to fetch from external API (Google AQI or OpenWeather)
       // For demo, we'll simulate or use a free API if configured.
       // Here we'll generate realistic data based on location for demo purposes
       
       const simulatedData = generateRealisticAQI(parseFloat(lat), parseFloat(lng));
       
       // Save/Update this data to DB
       const newData = new EnvironmentData({
         area: area || 'Unknown Location',
         location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
         ...simulatedData,
         lastUpdated: new Date()
       });

       // Try to reverse geocode city name using Google Maps API
       if (process.env.GOOGLE_PLACES_API_KEY) {
          try {
            const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
            const geoRes = await axios.get(geoUrl);
            if (geoRes.data.results.length > 0) {
               // Find city/locality
               const addressComponents = geoRes.data.results[0].address_components;
               const city = addressComponents.find(c => c.types.includes('locality'))?.long_name;
               const subLocality = addressComponents.find(c => c.types.includes('sublocality'))?.long_name;
               
               if (city || subLocality) {
                 newData.area = subLocality ? `${subLocality}, ${city}` : city;
               }
            }
          } catch (e) {
            console.error('Geocoding error:', e.message);
          }
       }

       await newData.save();
       
       return res.json({ success: true, data: newData, source: 'live_simulated' });
    }

    // Fallback to basic filter
    const filter = {};
    if (area) filter.area = { $regex: area, $options: 'i' };
    
    const data = await EnvironmentData.find(filter).sort({ lastUpdated: -1 }).limit(10);
    res.json({ success: true, data });
  } catch (error) {
    console.error('AQI Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch environment data' });
  }
};

exports.createEnvironment = async (req, res) => {
  try {
    const { area, location, aqi, pm25, pm10, no2, so2, co, o3, temp, humidity } = req.body;
    
    const status = calculateAQIStatus(aqi);
    
    const record = new EnvironmentData({ 
      area, 
      location,
      aqi, pm25, pm10, no2, so2, co, o3, temp, humidity,
      status 
    });
    
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create environment record' });
  }
};

// Helper to determine status
function calculateAQIStatus(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// Helper to generate realistic data
function generateRealisticAQI(lat, lng) {
  // Simulate higher pollution in city centers/industrial areas
  // This is a placeholder for real API integration
  const baseAQI = 50 + Math.random() * 100; 
  const pm25 = baseAQI * 0.6;
  const pm10 = baseAQI * 0.8;
  const temp = 25 + Math.random() * 10;
  
  return {
    aqi: Math.round(baseAQI),
    pm25: parseFloat(pm25.toFixed(1)),
    pm10: parseFloat(pm10.toFixed(1)),
    no2: parseFloat((Math.random() * 50).toFixed(1)),
    so2: parseFloat((Math.random() * 20).toFixed(1)),
    co: parseFloat((Math.random() * 2).toFixed(1)),
    o3: parseFloat((Math.random() * 60).toFixed(1)),
    temp: parseFloat(temp.toFixed(1)),
    humidity: Math.round(40 + Math.random() * 40),
    status: calculateAQIStatus(baseAQI)
  };
}
