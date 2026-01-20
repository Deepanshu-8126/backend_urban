exports.getUtilities = async (req, res) => {
  res.json([]);
};

exports.createUtility = async (req, res) => {
  res.status(201).json({ success: true });
};