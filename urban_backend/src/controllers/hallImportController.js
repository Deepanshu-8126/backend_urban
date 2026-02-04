const Hall = require('../models/Hall');
const googlePlacesService = require('../utils/googlePlaces');

class HallImportController {
  
  // ✅ IMPORT HALLS FROM GOOGLE PLACES
  importHallsFromGoogle = async (req, res) => {
    try {
      const { lat, lng, radius = 5 } = req.body;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      // Fetch halls from Google Places
      const hallsData = await googlePlacesService.searchNearbyHalls(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius) * 1000
      );

      // Save to database (skip duplicates)
      const savedHalls = [];
      for (const hallData of hallsData) {
        const existingHall = await Hall.findOne({ 
          googlePlaceId: hallData.googlePlaceId 
        });
        
        if (!existingHall) {
          const newHall = new Hall(hallData);
          await newHall.save();
          savedHalls.push(newHall);
        }
      }

      res.json({
        success: true,
        message: `${savedHalls.length} new halls imported successfully`,
        importedCount: savedHalls.length
      });

    } catch (error) {
      console.error('Import halls error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import halls'
      });
    }
  };

  // ✅ MANUAL HALL ADDITION
  addManualHall = async (req, res) => {
    try {
      const hallData = req.body;
      
      // Validate required fields
      if (!hallData.name || !hallData.address || !hallData.capacity || !hallData.pricePerDay) {
        return res.status(400).json({
          success: false,
          error: 'Name, address, capacity, and price are required'
        });
      }

      const newHall = new Hall({
        ...hallData,
        source: 'manual',
        location: {
          type: 'Point',
          coordinates: [parseFloat(hallData.longitude), parseFloat(hallData.latitude)]
        }
      });

      await newHall.save();

      res.status(201).json({
        success: true,
        message: 'Hall added successfully',
        hallId: newHall._id
      });

    } catch (error) {
      console.error('Add manual hall error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add hall'
      });
    }
  };
}

module.exports = new HallImportController();