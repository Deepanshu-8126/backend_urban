exports.getTraffic = async (req, res) => {
  res.json([]);
};

exports.createTraffic = async (req, res) => {
  res.status(201).json({ success: true });
};