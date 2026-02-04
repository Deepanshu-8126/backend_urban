const axios = require('axios');

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  // ✅ SEARCH NEARBY HALLS
  async searchNearbyHalls(lat, lng, radius = 5000) {
    try {
      const types = ['banquet_hall', 'event_venue', 'community_center'];
      let allResults = [];

      for (const type of types) {
        const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
          params: {
            location: `${lat},${lng}`,
            radius: radius,
            type: type,
            key: this.apiKey
          }
        });

        if (response.data.results) {
          allResults = [...allResults, ...response.data.results];
        }
      }

      // Remove duplicates and format data
      const uniqueResults = this.removeDuplicates(allResults);
      return this.formatPlacesData(uniqueResults);

    } catch (error) {
      console.error('Google Places API error:', error.message);
      throw new Error('Failed to fetch places data');
    }
  }

  // ✅ GET PLACE DETAILS
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,photos,rating,user_ratings_total',
          key: this.apiKey
        }
      });

      return response.data.result;
    } catch (error) {
      console.error('Place details error:', error.message);
      return null;
    }
  }

  // 🔧 FORMAT PLACES DATA FOR DATABASE
  formatPlacesData(places) {
    return places.map(place => ({
      name: place.name || 'Unnamed Hall',
      location: {
        type: 'Point',
        coordinates: [
          place.geometry.location.lng,
          place.geometry.location.lat
        ]
      },
      address: place.vicinity || place.formatted_address || 'Address not available',
      capacity: this.estimateCapacity(place.rating || 0),
      pricePerDay: this.estimatePrice(place.rating || 0),
      images: this.extractPhotos(place.photos),
      amenities: this.extractAmenities(place.types),
      rating: place.rating || 0,
      source: 'google_places',
      googlePlaceId: place.place_id,
      isActive: true
    }));
  }

  // 🔧 HELPER FUNCTIONS
  removeDuplicates(places) {
    const seen = new Set();
    return places.filter(place => {
      const duplicate = seen.has(place.place_id);
      seen.add(place.place_id);
      return !duplicate;
    });
  }

  extractPhotos(photos) {
    if (!photos) return [];
    return photos.slice(0, 4).map(photo => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.apiKey}`
    );
  }

  extractAmenities(types) {
    const amenities = [];
    if (types.includes('parking')) amenities.push('Parking');
    if (types.includes('air_conditioned')) amenities.push('AC');
    if (types.includes('restaurant')) amenities.push('Catering');
    return amenities.length > 0 ? amenities : ['Basic Amenities'];
  }

  estimateCapacity(rating) {
    if (rating >= 4.5) return 800;
    if (rating >= 4.0) return 500;
    if (rating >= 3.5) return 300;
    return 200;
  }

  estimatePrice(rating) {
    if (rating >= 4.5) return 35000;
    if (rating >= 4.0) return 25000;
    if (rating >= 3.5) return 15000;
    return 10000;
  }
}

module.exports = new GooglePlacesService();