const Complaint = require('../models/Complaint');

// Simple distance calculation (in meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

// Simple image hash (for demo - use actual hashing in production)
const generateImageHash = (imageUrl) => {
  if (!imageUrl) return null;
  return imageUrl.split('/').pop().split('.')[0]; // Extract filename
};

exports.autoMergeComplaints = async (newComplaint) => {
  try {
    const { coordinates } = newComplaint.location;
    const newLat = coordinates[1];
    const newLng = coordinates[0];
    const newHash = generateImageHash(newComplaint.imageUrl);
    
    // Find similar complaints in last 1 hour within 100 meters
    const oneHourAgo = new Date(Date.now() - 3600000);
    
    const similarComplaints = await Complaint.find({
      _id: { $ne: newComplaint._id },
      timestamp: { $gte: oneHourAgo },
      status: { $in: ['Pending', 'High Priority (Red)'] }
    });
    
    let merged = false;
    
    for (const existing of similarComplaints) {
      const existingLat = existing.location.coordinates[1];
      const existingLng = existing.location.coordinates[0];
      const distance = calculateDistance(newLat, newLng, existingLat, existingLng);
      
      // Check if within 100 meters AND same image hash
      if (distance <= 100) {
        const existingHash = generateImageHash(existing.imageUrl);
        
        if (newHash === existingHash || distance <= 50) { // Very close = auto merge
          // Update existing complaint
          existing.complaintCount = (existing.complaintCount || 1) + 1;
          existing.priorityScore = (existing.priorityScore || 1) + 1;
          
          // Auto-boost to High Priority if 3+ complaints
          if (existing.complaintCount >= 3) {
            existing.status = 'High Priority (Red)';
            existing.priorityScore += 10;
          }
          
          await existing.save();
          merged = true;
          break;
        }
      }
    }
    
    if (!merged && (newComplaint.complaintCount || 1) >= 3) {
      newComplaint.status = 'High Priority (Red)';
      newComplaint.priorityScore = (newComplaint.priorityScore || 1) + 10;
      await newComplaint.save();
    }
    
  } catch (error) {
    console.error('Auto-merge error:', error);
  }
};