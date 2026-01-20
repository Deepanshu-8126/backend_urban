exports.getCitizens = async (req, res) => {
  res.json([]);
};

exports.createCitizen = async (req, res) => {
  res.status(201).json({ success: true });
};