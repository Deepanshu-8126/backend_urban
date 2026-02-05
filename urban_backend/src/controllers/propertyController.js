const Property = require('../models/Property');

// Helper: Calculate Tax
const calculateTaxAmount = (property) => {
  const baseRates = { 'A': 100, 'B': 70, 'C': 40 }; // Rate per sq.m
  const typeMultipliers = { 'residential': 1, 'commercial': 3, 'industrial': 2, 'mixed': 1.5 };

  const zoneRate = baseRates[property.zone] || 50;
  const typeMultiplier = typeMultipliers[property.propertyType] || 1;

  // Formula: Area * ZoneRate * TypeMultiplier
  return property.area * zoneRate * typeMultiplier;
};

exports.getMyProperties = async (req, res) => {
  try {
    // Mocking user connection for demo (In real app, filter by User ID)
    // Returning ALL properties to fill the carousel for impact
    const properties = await Property.find().limit(5); // Get 5 sample properties

    // Dynamically calculate tax for display
    const enrichedProperties = properties.map(prop => {
      const tax = calculateTaxAmount(prop);
      return {
        ...prop._doc,
        calculatedTax: tax,
        status: prop.taxPaid ? 'PAID' : 'DUE'
      };
    });

    res.json({ success: true, data: enrichedProperties });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.payPropertyTax = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;

    const property = await Property.findOne({ propertyId });
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    property.taxPaid = true;
    property.lastTaxPaidDate = new Date();
    property.receiptId = `TAX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    property.taxDue = 0;

    await property.save();

    res.json({
      success: true,
      message: "Tax Paid Successfully",
      receipt: {
        receiptId: property.receiptId,
        date: property.lastTaxPaidDate,
        propertyId: property.propertyId,
        amountPaid: amount,
        owner: property.ownerName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
