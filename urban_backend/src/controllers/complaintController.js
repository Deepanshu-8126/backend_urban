const Complaint = require('../models/Complaint');

// Submit complaint (Fixed user ID issue)
exports.submitComplaint = async (req, res) => {
  try {
    console.log('📥 Complaint submission request:', req.body);
    console.log('👤 User:', req.user);
    
    let { title, description, imageUrl, audioUrl, videoUrl, location, userId, userName, userContact } = req.body;
    
    // 🔥 FIX: Use authenticated user's ID if not provided
    if (!userId && req.user) {
      userId = req.user.id || req.user._id;
    }
    
    if (!userName && req.user) {
      userName = req.user.name || req.user.firstName || '';
    }
    
    // 🔥 AUTO-CONVERT MOBILE FORMAT TO CORRECT FORMAT
    if (req.body.lat && req.body.long && !location) {
      location = {
        coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
      };
    }
    
    if (req.body.latitude !== undefined && req.body.longitude !== undefined && !location) {
      location = {
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      };
    }
    
    if (!title && description) {
      title = description.substring(0, 50) + (description.length > 50 ? '...' : '');
    }
    
    // 🔥 FIXED: Validate user ID
    if (!title || !userId || !location || !location.coordinates || location.coordinates.length !== 2) {
      console.log('❌ Missing required fields:', { 
        title: !!title, 
        userId: !!userId, 
        location: !!location,
        coordinates: location?.coordinates?.length === 2
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, userId, and location with coordinates required' 
      });
    }
    
    const [lng, lat] = location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates: longitude (-180 to 180), latitude (-90 to 90)'
      });
    }
    
    const complaint = new Complaint({
      title,
      description: description || '',
      imageUrl: imageUrl || '',
      audioUrl: audioUrl || '',
      videoUrl: videoUrl || '',
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      userId,
      userName: userName || '',
      userContact: userContact || ''
    });
    
    await complaint.save();
    
    // Run AI categorization in background
    setTimeout(() => categorizeComplaint(complaint._id), 100);
    
    console.log('✅ Complaint saved successfully:', complaint._id);
    
    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('❌ Submit error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Something went wrong: ' + error.message 
    });
  }
};

// Get user's complaints (Fixed user ID issue)
exports.getMyComplaints = async (req, res) => {
  try {
    console.log('👤 Getting complaints for user:', req.user);
    
    // 🔥 FIX: Use authenticated user's ID
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Please login first' 
      });
    }
    
    const complaints = await Complaint.find({ 
      userId, 
      status: { $ne: 'deleted' } 
    }).sort({ createdAt: -1 });
    
    return res.json({ 
      success: true, 
      complaints: complaints.map(comp => comp.toObject()) 
    });
  } catch (error) {
    console.error('Get my complaints error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch complaints' 
    });
  }
};

// Get all complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 });
    return res.json({ 
      success: true, 
      complaints: complaints.map(comp => comp.toObject()) 
    });
  } catch (error) {
    console.error('Get complaints error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
};

// Get admin complaints
exports.getAdminComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: { $ne: 'deleted' } })
      .sort({ priorityScore: -1, complaintCount: -1, createdAt: -1 });
    return res.json({ 
      success: true, 
      plainComplaints: complaints.map(comp => ({
        ...comp.toObject(),
        location: {
          type: comp.location.type,
          coordinates: comp.location.coordinates,
          lat: comp.location.coordinates[1],
          lng: comp.location.coordinates[0]
        }
      }))
    });
  } catch (error) {
    console.error('Get admin complaints error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch admin complaints' });
  }
};

// Update complaint status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['working', 'solved', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Valid: working, solved, deleted' 
      });
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    
    return res.json({
      success: true,
      message: 'Status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update status error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    
    return res.json({
      success: true,
      complaint: complaint.toObject()
    });
  } catch (error) {
    console.error('Get complaint by ID error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaint' });
  }
};

// AI categorization function
async function categorizeComplaint(complaintId) {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return;
    
    const text = (complaint.title + ' ' + (complaint.description || '')).toLowerCase();
    let category = 'other';
    let department = 'general';
    
    if (text.includes('garbage') || text.includes('waste') || text.includes('kachra') || text.includes('कचरा')) {
      category = 'garbage';
      department = 'sanitation';
    } else if (text.includes('water') || text.includes('jal') || text.includes('pipe') || 
               text.includes('paani') || text.includes('पानी') || text.includes('जल')) {
      category = 'water';
      department = 'water-works';
    } else if (text.includes('electricity') || text.includes('bijli') || text.includes('power') || 
               text.includes('light') || text.includes('बिजली')) {
      category = 'electricity';
      department = 'power';
    } else if (text.includes('road') || text.includes('sadak') || text.includes('pothole') || 
               text.includes('सड़क')) {
      category = 'road';
      department = 'public-works';
    }
    
    await Complaint.findByIdAndUpdate(complaintId, {
      category,
      department,
      aiProcessed: true
    });
    
    console.log('🤖 AI categorized complaint:', complaintId, '->', category, department);
  } catch (error) {
    console.error('❌ AI categorization failed:', error.message);
  }
}