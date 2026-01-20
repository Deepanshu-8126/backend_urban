exports.getProperties = async (req, res) => {
  res.json([]);
};

exports.createProperty = async (req, res) => {
  res.status(201).json({ success: true });
};