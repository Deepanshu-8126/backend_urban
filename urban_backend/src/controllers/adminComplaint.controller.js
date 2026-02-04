const ComplaintV2 = require('../models/ComplaintV2');
const User = require('../models/User');
const ComplaintAnalyzer = require('../ai/complaintAnalyzer');

// Get admin complaints (AI Routing)
exports.getAdminComplaints = async (req, res) => {
  try {
    console.log('🔍 Admin getting complaints for department:', req.user?.department);
    
    // Filter complaints based on admin's department
    let filter = { status: { $ne: 'deleted' } };
    
    if (req.user && req.user.department) {
      filter.assignedDept = req.user.department; // AI routing
    }
    
    const complaints = await ComplaintV2.find(filter)
      .sort({ createdAt: -1 }); // Newest first
    
    const detailedComplaints = [];
    
    for (const complaint of complaints) {
      // Get user details
      const user = await User.findById(complaint.userId).select('name email');
      
      detailedComplaints.push({
        ...complaint.toObject(),
        user: {
          name: user?.name || complaint.userName || 'Unknown User',
          email: user?.email || 'unknown@example.com'
        },
        location: {
          type: complaint.location.type,
          coordinates: complaint.location.coordinates,
          lat: complaint.location.coordinates[1],
          lng: complaint.location.coordinates[0]
        }
      });
    }
    
    console.log('✅ Admin got', detailedComplaints.length, 'complaints');
    
    return res.json({ 
      success: true, 
      complaints: detailedComplaints 
    });
  } catch (error) {
    console.error('❌ Admin complaints error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch admin complaints' 
    });
  }
};

// Update complaint status and message
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminMessage, delete: deleteFlag } = req.body;
    
    console.log('🔧 Admin updating complaint:', id, 'with status:', status);
    
    // Handle delete flag
    if (deleteFlag === true) {
      const complaint = await ComplaintV2.findByIdAndUpdate(
        id,
        { status: 'deleted', updatedAt: new Date() },
        { new: true }
      );
      
      if (!complaint) {
        return res.status(404).json({ 
          success: false, 
          error: 'Complaint not found' 
        });
      }
      
      return res.json({
        success: true,
        message: 'Complaint deleted successfully',
        complaint
      });
    }
    
    // Validate status
    const validStatuses = ['working', 'solved', 'fake'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Valid: working, solved, fake' 
      });
    }
    
    // Update status and message
    const updateData = {
      status: status === 'fake' ? 'deleted' : status, // Fake complaints go to deleted
      adminMessage: adminMessage || '',
      adminResponseAt: adminMessage ? new Date() : null,
      updatedAt: new Date()
    };
    
    const complaint = await ComplaintV2.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        error: 'Complaint not found' 
      });
    }
    
    console.log('✅ Complaint updated successfully:', id);
    
    return res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('❌ Update complaint error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update complaint' 
    });
  }
};

// Get user's complaints (with admin responses)
exports.getUserComplaints = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }
    
    console.log('👤 User getting their complaints:', userId);
    
    const complaints = await ComplaintV2.find({ 
      userId, 
      status: { $ne: 'deleted' } 
    }).sort({ createdAt: -1 });
    
    return res.json({ 
      success: true, 
      complaints: complaints.map(comp => ({
        ...comp.toObject(),
        // Real-time status display logic
        hasAdminResponse: !!comp.adminMessage,
        adminMessage: comp.adminMessage || 'Problem Submitted',
        adminResponseAt: comp.adminResponseAt,
        status: comp.status
      })) 
    });
  } catch (error) {
    console.error('❌ User complaints error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch complaints' 
    });
  }
};

// Submit complaint with AI processing
exports.submitComplaint = async (req, res) => {
  try {
    console.log('📥 New complaint submission:', req.body);
    
    let { title, description, image, location, userId, userName, userContact } = req.body;
    
    // Use authenticated user's ID if not provided
    if (!userId && req.user) {
      userId = req.user.id;
    }
    
    if (!userName && req.user) {
      userName = req.user.name || req.user.email || 'Anonymous User';
    }
    
    // Validate required fields
    if (!title || !userId || !location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, userId, and location with coordinates required' 
      });
    }
    
    // Validate coordinates
    const [lng, lat] = location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates: longitude (-180 to 180), latitude (-90 to 90)'
      });
    }
    
    // Create complaint
    const complaint = new ComplaintV2({
      title,
      description: description || '',
      image: image || '',
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      userId,
      userName: userName || '',
      userContact: userContact || ''
    });
    
    await complaint.save();
    
    // Process with AI (background)
    setTimeout(async () => {
      try {
        const aiResult = ComplaintAnalyzer.classifyComplaint(complaint);
        
        await ComplaintV2.findByIdAndUpdate(complaint._id, {
          assignedDept: aiResult.assignedDept,
          aiConfidence: aiResult.aiConfidence,
          category: aiResult.category,
          department: aiResult.department,
          aiProcessed: true
        });
        
        console.log('🤖 AI processed complaint:', complaint._id, '→', aiResult.assignedDept);
      } catch (aiError) {
        console.error('❌ AI processing error:', aiError.message);
      }
    }, 100); // Process AI after saving
    
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