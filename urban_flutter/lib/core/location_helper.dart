import 'package:geocoding/geocoding.dart';
import 'package:flutter/foundation.dart';

class LocationHelper {
  
  static final Map<String, String> _addressCache = {};
  
  
  
  static Future<String> getAddressFromCoordinates(double lat, double lng) async {
    try {
      
      final cacheKey = '${lat.toStringAsFixed(4)}_${lng.toStringAsFixed(4)}';
      
      
      if (_addressCache.containsKey(cacheKey)) {
        return _addressCache[cacheKey]!;
      }
      
      
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        
        
        String address = '';
        
        if (place.locality != null && place.locality!.isNotEmpty) {
          address = place.locality!;
        } else if (place.subLocality != null && place.subLocality!.isNotEmpty) {
          address = place.subLocality!;
        }
        
        if (place.administrativeArea != null && place.administrativeArea!.isNotEmpty) {
          if (address.isNotEmpty) {
            address += ', ${place.administrativeArea}';
          } else {
            address = place.administrativeArea!;
          }
        }
        
        
        if (address.isNotEmpty) {
          _addressCache[cacheKey] = address;
          return address;
        }
      }
      
      
      final fallback = 'Lat: ${lat.toStringAsFixed(2)}, Lng: ${lng.toStringAsFixed(2)}';
      _addressCache[cacheKey] = fallback;
      return fallback;
      
    } catch (e) {
      debugPrint('Geocoding error: $e');
      
      return 'Lat: ${lat.toStringAsFixed(2)}, Lng: ${lng.toStringAsFixed(2)}';
    }
  }
  
  
  static Future<String> getShortAddress(double lat, double lng) async {
    try {
      final cacheKey = 'short_${lat.toStringAsFixed(4)}_${lng.toStringAsFixed(4)}';
      
      if (_addressCache.containsKey(cacheKey)) {
        return _addressCache[cacheKey]!;
      }
      
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        final cityName = place.locality ?? place.subLocality ?? place.administrativeArea ?? '';
        
        if (cityName.isNotEmpty) {
          _addressCache[cacheKey] = cityName;
          return cityName;
        }
      }
      
      final fallback = '${lat.toStringAsFixed(2)}, ${lng.toStringAsFixed(2)}';
      _addressCache[cacheKey] = fallback;
      return fallback;
      
    } catch (e) {
      debugPrint('Geocoding error: $e');
      return '${lat.toStringAsFixed(2)}, ${lng.toStringAsFixed(2)}';
    }
  }
  
  
  static void clearCache() {
    _addressCache.clear();
  }
}
