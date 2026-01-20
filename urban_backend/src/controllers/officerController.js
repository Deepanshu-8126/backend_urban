exports.getOfficers = async (req, res) => {
  res.json([]);
};

exports.createOfficer = async (req, res) => {
  res.status(201).json({ success: true });
};