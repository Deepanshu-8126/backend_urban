const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Create Admin/Officer
exports.createOfficer = async (req, res) => {
  try {
    const { name, email, password, role, department, ward } = req.body;
    
    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, password, and role are required' 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      ward
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Officer created successfully',
      user
    });
  } catch (error) {
    console.error('Create officer error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create officer' });
  }
};

// Get Department-specific complaints
exports.getDepartmentComplaints = async (req, res) => {
  try {
    const { department } = req.params;
    const { role, department: userDept } = req.user;
    
    // Check permissions
    if (role !== 'admin' && userDept !== department) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Not authorized for this department.' 
      });
    }
    
    const complaints = await Complaint.find({ department })
      .sort({ priorityScore: -1, createdAt: -1 });
    
    res.json({
      success: true,
      complaints: complaints.map(comp => comp.toObject())
    });
  } catch (error) {
    console.error('Get department complaints error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
};

// Assign complaint to department officer
exports.assignComplaint = async (req, res) => {
  try {
    const { complaintId, officerId } = req.body;
    const { role } = req.user;
    
    if (role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Admin only.' 
      });
    }
    
    // Update complaint with assigned officer
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { 
        assignedOfficer: officerId,
        status: 'working',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    
    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint
    });
  } catch (error) {
    console.error('Assign complaint error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to assign complaint' });
  }
};