exports.getUtilities = async (req, res) => {
  try {
    let EnergyData;
    try {
      EnergyData = require('../models/EnergyData');
    } catch (e) {
      EnergyData = null;
    }
    if (!EnergyData) {
      return res.json({ success: true, data: [] });
    }
    const { area } = req.query;
    const filter = {};
    if (area) filter.area = area;
    const data = await EnergyData.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch utilities data' });
  }
};

exports.createUtility = async (req, res) => {
  try {
    let EnergyData;
    try {
      EnergyData = require('../models/EnergyData');
    } catch (e) {
      EnergyData = null;
    }
    if (!EnergyData) {
      return res.status(400).json({ success: false, error: 'Energy model unavailable' });
    }
    const record = new EnergyData({ ...req.body });
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create utilities record' });
  }
};
