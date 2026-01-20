exports.getEnvironment = async (req, res) => {
  res.json([]);
};

exports.createEnvironment = async (req, res) => {
  res.status(201).json({ success: true });
};