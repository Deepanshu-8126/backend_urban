const Hall = require('../models/Hall');
const Booking = require('../models/Booking');
const User = require('../models/User');

class HallController {
  
  // ✅ GET NEARBY HALLS
  getNearbyHalls = async (req, res) => {
    try {
      const { lat, lng, radius = 5 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      const radiusInMeters = parseFloat(radius) * 1000;

      const halls = await Hall.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radiusInMeters
          }
        },
        isActive: true
      }).limit(20);

      // Calculate distance for each hall
      const hallsWithDistance = halls.map(hall => {
        const distance = this.calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          hall.location.coordinates[1],
          hall.location.coordinates[0]
        );
        return {
          ...hall.toObject(),
          distance: parseFloat(distance.toFixed(2))
        };
      });

      res.json({
        success: true,
        halls: hallsWithDistance,
        count: hallsWithDistance.length
      });

    } catch (error) {
      console.error('Get nearby halls error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch nearby halls'
      });
    }
  };

  // ✅ GET HALL DETAILS
  getHallDetails = async (req, res) => {
    try {
      const { id } = req.params;
      
      const hall = await Hall.findById(id);
      if (!hall) {
        return res.status(404).json({
          success: false,
          error: 'Hall not found'
        });
      }

      res.json({
        success: true,
        hall
      });

    } catch (error) {
      console.error('Get hall details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hall details'
      });
    }
  };

  // ✅ CHECK AVAILABILITY
  checkAvailability = async (req, res) => {
    try {
      const { hallId, bookingDate } = req.body;
      
      if (!hallId || !bookingDate) {
        return res.status(400).json({
          success: false,
          error: 'Hall ID and booking date are required'
        });
      }

      const existingBooking = await Booking.findOne({
        hallId,
        bookingDate: new Date(bookingDate),
        paymentStatus: { $ne: 'cancelled' }
      });

      res.json({
        success: true,
        available: !existingBooking,
        message: existingBooking ? 'Hall is already booked on this date' : 'Hall is available'
      });

    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check availability'
      });
    }
  };

  // ✅ CREATE BOOKING
  createBooking = async (req, res) => {
    try {
      const { 
        hallId, 
        bookingDate, 
        eventType, 
        numberOfGuests, 
        contactPhone 
      } = req.body;

      const userId = req.user.id;

      // Validate required fields
      if (!hallId || !bookingDate || !eventType || !numberOfGuests || !contactPhone) {
        return res.status(400).json({
          success: false,
          error: 'All booking details are required'
        });
      }

      // Check if hall exists
      const hall = await Hall.findById(hallId);
      if (!hall) {
        return res.status(404).json({
          success: false,
          error: 'Hall not found'
        });
      }

      // Check capacity
      if (numberOfGuests > hall.capacity) {
        return res.status(400).json({
          success: false,
          error: `Hall capacity is ${hall.capacity}. Your guest count exceeds this limit.`
        });
      }

      // Check availability
      const existingBooking = await Booking.findOne({
        hallId,
        bookingDate: new Date(bookingDate),
        paymentStatus: { $ne: 'cancelled' }
      });

      if (existingBooking) {
        return res.status(409).json({
          success: false,
          error: 'Hall is already booked on this date'
        });
      }

      // Create booking
      const booking = new Booking({
        hallId,
        userId,
        bookingDate: new Date(bookingDate),
        eventType,
        numberOfGuests,
        totalPrice: hall.pricePerDay,
        contactPhone
      });

      await booking.save();

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        bookingId: booking._id
      });

    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create booking'
      });
    }
  };

  // ✅ GET USER BOOKINGS
  getUserBookings = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const bookings = await Booking.find({ userId })
        .populate('hallId', 'name address capacity pricePerDay images rating')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        bookings
      });

    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings'
      });
    }
  };

  // ✅ IMPORT HALLS FROM GOOGLE PLACES
  // ✅ IMPORT HALLS FROM GOOGLE PLACES (REAL IMPLEMENTATION)
importHallsFromGoogle = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const axios = require('axios');
    const radiusInMeters = parseFloat(radius) * 1000;
    const types = ['banquet_hall', 'event_venue', 'community_center'];
    let allResults = [];

    // Fetch from Google Places API
    for (const type of types) {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${lat},${lng}`,
          radius: radiusInMeters,
          type: type,
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      });

      if (response.data.results) {
        allResults = [...allResults, ...response.data.results];
      }
    }

    // Remove duplicates
    const seen = new Set();
    const uniqueResults = allResults.filter(place => {
      const duplicate = seen.has(place.place_id);
      seen.add(place.place_id);
      return !duplicate;
    });

    // Save new halls to database
    const savedHalls = [];
    for (const place of uniqueResults) {
      const existingHall = await Hall.findOne({ googlePlaceId: place.place_id });
      
      if (!existingHall) {
        const newHall = new Hall({
          name: place.name || 'Unnamed Hall',
          location: {
            type: 'Point',
            coordinates: [place.geometry.location.lng, place.geometry.location.lat]
          },
          address: place.vicinity || place.formatted_address || 'Address not available',
          capacity: place.rating >= 4.5 ? 800 : place.rating >= 4.0 ? 500 : 300,
          pricePerDay: place.rating >= 4.5 ? 35000 : place.rating >= 4.0 ? 25000 : 15000,
          images: place.photos ? place.photos.slice(0, 4).map(photo => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
          ) : [],
          amenities: ['Basic Amenities'],
          rating: place.rating || 0,
          source: 'google_places',
          googlePlaceId: place.place_id,
          isActive: true
        });

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
    console.error('Google Places import error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to import halls from Google Places'
    });
  }
};

  // ✅ ADD MANUAL HALL
  addManualHall = async (req, res) => {
    try {
      const { name, address, capacity, pricePerDay, latitude, longitude } = req.body;
      
      if (!name || !address || !capacity || !pricePerDay || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required: name, address, capacity, pricePerDay, latitude, longitude'
        });
      }

      const newHall = new Hall({
        name,
        address,
        capacity,
        pricePerDay,
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        source: 'manual',
        isActive: true
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

  // 🔧 HELPER: Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = new HallController();