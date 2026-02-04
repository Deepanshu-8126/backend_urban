const Officer = require('../models/Officer');

exports.getOfficers = async (req, res) => {
  try {
    const { department, wardId, isActive } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (wardId) filter.wardId = wardId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const officers = await Officer.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, officers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch officers' });
  }
};

exports.createOfficer = async (req, res) => {
  try {
    const { name, email, phone, role, department, wardId, assignedArea } = req.body;
    const officer = new Officer({ name, email, phone, role, department, wardId, assignedArea });
    await officer.save();
    res.status(201).json({ success: true, officer });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create officer' });
  }
};
