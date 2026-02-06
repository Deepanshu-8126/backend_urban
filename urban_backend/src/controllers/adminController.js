const User = require('../models/User');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcryptjs');

exports.createOfficer = async (req, res) => {
  try {
    const { name, email, password, role, department, ward } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and department are required'
      });
    }

    const validDepartments = ['water', 'electricity', 'garbage', 'roads', 'health', 'sanitation', 'general'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        error: `Invalid department. Must be one of: ${validDepartments.join(', ')}`
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Admin with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminRole = department === 'general' ? 'admin' : `${department}-admin`;

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: adminRole,
      department,
      isActive: true
    });

    await admin.save();

    const { password: _, ...adminData } = admin.toObject();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: adminData
    });
  } catch (error) {
    console.error('Create admin error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create admin' });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Get admins error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch admins' });
  }
};

exports.getDepartmentComplaints = async (req, res) => {
  try {
    const { department } = req.params;
    const { role, department: userDept } = req.user;

    if (role !== 'admin' && userDept !== department) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Not authorized for this department.'
      });
    }

    const complaints = await Complaint.find({ department })
      .sort({ createdAt: -1 });

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

// Get City Monitoring Stats (New Feature)
// Get City Monitoring Stats (New Feature)
// Get City Monitoring Advanced Data (Graphs, Alerts, Layers)
exports.getCityMonitorData = async (req, res) => {
  try {
    const { timeRange, city } = req.query; // '24h', '7d', etc.
    const { role, department } = req.user;

    // Filter by department if not super admin (though "Super Admin" concept is removed, role might still be 'admin' vs specific dept admin)
    // As per requirement: "Har Admin ka same UI", "Data sirf uske department ka"
    let deptFilter = {};
    if (department && department !== 'All') {
      deptFilter.department = department; // or assignedDept
    }

    let startDate = new Date();
    if (timeRange === '1h') startDate.setHours(startDate.getHours() - 1);
    else if (timeRange === '6h') startDate.setHours(startDate.getHours() - 6);
    else if (timeRange === '24h') startDate.setHours(startDate.getHours() - 24);
    else if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30);
    else startDate.setHours(startDate.getHours() - 24);

    const matchQuery = {
      createdAt: { $gte: startDate },
      ...deptFilter
    };

    // Fetch Base Data
    const complaints = await Complaint.find(matchQuery).lean();

    // 1. SMART CLIENT ALERTS (Rule Engine)
    const alerts = [];

    // Rule 1: Same Area > 5 complaints (Area Risk)
    const locationCounts = {};
    complaints.forEach(c => {
      if (c.location && c.location.address) {
        // Simple clustering by address string or slightly fuzzy match could go here
        // For now, strict address match or lat/lng rounding
        const key = c.location.address;
        locationCounts[key] = (locationCounts[key] || 0) + 1;
      }
    });
    Object.keys(locationCounts).forEach(loc => {
      if (locationCounts[loc] >= 5) {
        alerts.push({
          type: 'risk',
          level: 'high',
          message: `High complaint density in ${loc} (${locationCounts[loc]} issues)`,
          location: loc
        });
      }
    });

    // Rule 2: Pending > 24h (Delay Alert) - Check pending specifically
    const pendingLong = await Complaint.countDocuments({
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      ...deptFilter
    });
    if (pendingLong > 0) {
      alerts.push({
        type: 'delay',
        level: 'medium',
        message: `${pendingLong} complaints pending for > 24 hours`
      });
    }

    // Rule 3: Abnormal Silence (Mock logic: if total < expected)
    if (complaints.length === 0) {
      alerts.push({
        type: 'silence',
        level: 'warning',
        message: 'Abnormal silence: Zero complaints received in selected window.'
      });
    }

    // 2. TIME ANALYSIS (Graphs)
    // Group by hour for last 24h, or day for longer
    const timeGraph = [];
    const now = new Date();
    // Simple 24h buckets
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = d.getHours();

      const count = complaints.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate.getHours() === hour &&
          cDate.getDate() === d.getDate();
      }).length;

      timeGraph.push({ label: `${hour}:00`, count });
    }

    // 3. ZONE INTELLIGENCE
    // Group by Ward/Zone (Mocking wards based on random assignment if not strictly in DB, or use saved Ward)
    const zoneStats = {};
    complaints.forEach(c => {
      // Assuming c.location.ward exists or we mock it based on address/random
      // Adapting to existing schema which might not have 'ward' explicitly in root, maybe in location
      const ward = c.ward || 'Unknown';
      if (!zoneStats[ward]) zoneStats[ward] = { name: ward, total: 0, pending: 0, avgResolution: 0 };

      zoneStats[ward].total++;
      if (c.status === 'pending') zoneStats[ward].pending++;
    });
    const zoneLayers = Object.values(zoneStats).map(z => ({
      ...z,
      status: z.pending > 5 ? 'Critical' : (z.pending > 2 ? 'Warning' : 'Stable')
    }));

    // 4. STATS CARDS
    const total = complaints.length;
    const active = complaints.filter(c => ['pending', 'working'].includes(c.status)).length;
    const solved = complaints.filter(c => c.status === 'solved').length;
    const fake = complaints.filter(c => c.status === 'fake' || c.status === 'rejected').length;

    res.json({
      success: true,
      department: department || 'All',
      alerts,
      stats: {
        total,
        active,
        solved,
        fakeRatio: total > 0 ? ((fake / total) * 100).toFixed(1) : 0,
        avgResponseTime: "4h 12m" // Mock calculation for now
      },
      graphs: {
        timeTrend: timeGraph
      },
      zones: zoneLayers,
      incidents: complaints.slice(0, 50).map(c => ({ // Send top 50 recent for map
        id: c._id,
        lat: c.location?.coordinates?.[1] || 0,
        lng: c.location?.coordinates?.[0] || 0,
        category: c.category,
        status: c.status,
        priority: c.priorityScore
      }))
    });

  } catch (error) {
    console.error('City Monitor Data Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch monitor data' });
  }
};