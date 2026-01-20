const Complaint = require('../models/Complaint');

// ✅ SUBMIT COMPLAINT (ATOMIC)
exports.submitComplaint = async (data) => {
  const { title, description, imageUrl, location, userId } = data;
  
  // Validate mandatory fields
  if (!title || !userId) {
    throw new Error('MISSING_REQUIRED_FIELDS');
  }
  if (!location || !location.lng || !location.lat) {
    throw new Error('INVALID_LOCATION');
  }
  
  // Create complaint
  const complaint = new Complaint({
    title,
    description: description || '',
    imageUrl: imageUrl || '',
    location: {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    },
    userId
  });
  
  await complaint.save();
  return complaint;
};

// ✅ GET ALL COMPLAINTS (PRIORITY SORTED)
exports.getComplaints = async () => {
  return await Complaint.find({ status: { $ne: 'deleted' } })
    .sort({ 
      priorityScore: -1, 
      complaintCount: -1, 
      createdAt: -1 
    });
};

// ✅ UPDATE COMPLAINT STATUS
exports.updateStatus = async (id, status) => {
  const validStatuses = ['working', 'solved', 'fake'];
  if (!validStatuses.includes(status)) {
    throw new Error('INVALID_STATUS');
  }
  
  const updateData = status === 'fake' 
    ? { status: 'deleted' } 
    : { status };
    
  const complaint = await Complaint.findByIdAndUpdate(
    id, 
    { ...updateData, updatedAt: new Date() },
    { new: true }
  );
  
  if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');
  return complaint;
};

// ✅ SIMPLE AI CATEGORIZATION (FALLBACK-SAFE)
exports.categorizeComplaint = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.aiProcessed) return;
    
    const text = (complaint.title + ' ' + complaint.description).toLowerCase();
    let category = 'other';
    let department = 'general';
    
    if (text.includes('garbage') || text.includes('waste') || text.includes('kachra')) {
      category = 'garbage';
      department = 'sanitation';
    } else if (text.includes('water') || text.includes('jal') || text.includes('pipe')) {
      category = 'water';
      department = 'water-works';
    } else if (text.includes('electricity') || text.includes('bijli') || text.includes('power') || text.includes('light')) {
      category = 'electricity';
      department = 'power';
    } else if (text.includes('road') || text.includes('sadak') || text.includes('pothole')) {
      category = 'road';
      department = 'public-works';
    }
    
    await Complaint.findByIdAndUpdate(complaintId, {
      category,
      department,
      aiProcessed: true,
      updatedAt: new Date()
    });
    
  } catch (error) {
    // Never crash main flow - log and continue
    console.error('AI categorization failed:', error.message);
  }
};