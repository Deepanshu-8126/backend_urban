const Certificate = require('../models/Certificate');

exports.getCitizens = async (req, res) => {
  try {
    const { type, ward, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (ward) filter.ward = ward;
    if (status) filter.status = status;
    const certificates = await Certificate.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
  }
};

exports.createCitizen = async (req, res) => {
  try {
    const { certificateId, type, applicantName, ward } = req.body;
    const certificate = new Certificate({ certificateId, type, applicantName, ward });
    await certificate.save();
    res.status(201).json({ success: true, certificate });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create certificate' });
  }
};
