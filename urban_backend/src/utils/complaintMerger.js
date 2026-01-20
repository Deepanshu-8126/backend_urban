const Complaint = require('../models/Complaint');

exports.autoMergeComplaints = async (newComplaint) => {
  try {
    const { coordinates } = newComplaint.location;
    const [lng, lat] = coordinates;

    const nearbyComplaints = await Complaint.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 50
        }
      },
      status: 'pending',
      category: newComplaint.category,
      _id: { $ne: newComplaint._id }
    });

    if (nearbyComplaints.length > 0) {
      const parentComplaint = nearbyComplaints[0];
      
      await Complaint.findByIdAndUpdate(parentComplaint._id, {
        $inc: { mergeCount: 1 },
        $set: { 
          priority: nearbyComplaints.length >= 5 ? 'high' : 'medium',
          status: 'assigned'
        }
      });

      await Complaint.findByIdAndUpdate(newComplaint._id, {
        status: 'merged',
        mergedWith: parentComplaint._id.toString()
      });

      return {
        merged: true,
        parentId: parentComplaint._id,
        mergeCount: nearbyComplaints.length + 1
      };
    }

    return { merged: false };
    
  } catch (error) {
    console.error('Auto-merge error:', error);
    return { merged: false, error: error.message };
  }
};