exports.getAdminData = async (req, res) => {
  res.json([]);
};

exports.createAdminData = async (req, res) => {
  res.status(201).json({ success: true });
};