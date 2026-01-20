const Complaint = require('../models/Complaint');

// Submit complaint
exports.submitComplaint = async (req, res) => {
  try {
    const { title, description, imageUrl, audioUrl, videoUrl, location, userId } = req.body;
    
    if (!title || !userId || !location || !location.lng || !location.lat) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const complaint = new Complaint({
      title,
      description: description || '',
      imageUrl: imageUrl || '',
      audioUrl: audioUrl || '',
      videoUrl: videoUrl || '',
      location: {

        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      userId
    });
    
    await complaint.save();
    
    // Trigger AI analysis
    process.nextTick(() => {
      categorizeComplaint(complaint._id);
    });
    
    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

// Get all complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: { $ne: 'deleted' } })
      .sort({ priorityScore: -1, complaintCount: -1, createdAt: -1 });
    const plainComplaints = complaints.map(comp => comp.toObject());
    return res.json({ success: true, plainComplaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
};
// Water: 8-10, Electricity: 7-9, Garbage: 6-8, Other: 3-5
const getPriorityScore = (category) => {
  const scores = { water: 9, electricity: 8, garbage: 7, other: 4 };
  return scores[category] || 4;
};
// src/controllers/complaintController.js

// Update complaint status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // ✅ VALIDATE STATUS TYPES
    const validStatuses = ['working', 'solved', 'fake'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Valid statuses: working, solved, fake' });
    }
    
    let updateData;
    if (status === 'fake') {
      // Mark as deleted instead of fake
      updateData = { status: 'deleted' };
    } else {
      // Update to working or solved
      updateData = { status: status };
    }
    
    const complaint = await Complaint.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};


// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['working', 'solved', 'fake'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const updateData = status === 'fake' ? { status: 'deleted' } : { status };
    const complaint = await Complaint.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    
    return res.json({
      success: true,
      message: 'Status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

// AI Categorization (internal function)
async function categorizeComplaint(complaintId) {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return;
    
    const text = (complaint.title + ' ' + (complaint.description || '')).toLowerCase();
    let category = 'other';
    let department = 'general';
    
    // Garbage/Waste detection (English + Hindi)
    if (text.includes('garbage') || text.includes('waste') || text.includes('kachra') || text.includes('कचरा')) {
      category = 'garbage';
      department = 'sanitation';
    }
    // Water detection (English + Hindi)
    else if (text.includes('water') || text.includes('jal') || text.includes('pipe') || 
             text.includes('paani') || text.includes('पानी') || text.includes('जल')) {
      category = 'water';
      department = 'water-works';
    }
    // Electricity detection (English + Hindi)
    else if (text.includes('electricity') || text.includes('bijli') || text.includes('power') || 
             text.includes('light') || text.includes('बिजली')) {
      category = 'electricity';
      department = 'power';
    }
    // Road detection (English + Hindi)
    else if (text.includes('road') || text.includes('sadak') || text.includes('pothole') || 
             text.includes('सड़क')) {
      category = 'road';
      department = 'public-works';
    }
    
    // Update complaint with AI results
    await Complaint.findByIdAndUpdate(complaintId, {
      category,
      department,
      aiProcessed: true
    });
    
  } catch (error) {
    console.error('AI categorization failed:', error);
    // Never crash main flow - log error and continue
  }
}

// Get user's complaints (placeholder - works without JWT for now)
exports.getMyComplaints = async (req, res) => {
  try {
    // For now, return all complaints (will filter by userId when JWT implemented)
    const complaints = await Complaint.find({ status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 });
    const plainComplaints = complaints.map(comp => comp.toObject());
    return res.json({ success: true, plainComplaints });
  } catch (error) {
    console.error('Get my complaints error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
};

// Get admin feed (placeholder - works without JWT for now)
exports.getAdminFeed = async (req, res) => {
  try {
    // For now, return all complaints with priority sorting
    const complaints = await Complaint.find({ status: { $ne: 'deleted' } })
      .sort({ priorityScore: -1, complaintCount: -1, createdAt: -1 });
    const plainComplaints = complaints.map(comp => comp.toObject());
    return res.json({ success: true, plainComplaints });
  } catch (error) {
    console.error('Get admin feed error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
};
