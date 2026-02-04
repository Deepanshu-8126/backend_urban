exports.getPopulation = async (req, res) => {
  res.json([]);
};

exports.createPopulation = async (req, res) => {
  res.status(201).json({ success: true });
};