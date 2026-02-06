const Property = require('../models/Property');

// Helper: Calculate Tax based on Govt Standard (Rateable Value method)
const calculateTaxAmount = (property) => {
  // Standard Rent per sq. meter per month (Haldwani / Indian Govt Scale)
  const standardRentMatrix = {
    'A': { residential: 8, commercial: 25, industrial: 15, mixed: 12, hospital: 10, hotel: 20, open_land: 5 },
    'B': { residential: 6, commercial: 20, industrial: 12, mixed: 10, hospital: 8, hotel: 15, open_land: 4 },
    'C': { residential: 4, commercial: 15, industrial: 10, mixed: 8, hospital: 6, hotel: 12, open_land: 3 }
  };

  // Validate inputs or use defaults
  const zone = (property.zone && standardRentMatrix[property.zone]) ? property.zone : 'B';
  const type = (property.propertyType && standardRentMatrix[zone][property.propertyType]) ? property.propertyType : 'residential';

  const stdRent = standardRentMatrix[zone][type];

  // Rateable Value (RV) = Area * StdRent * 12 months * 0.9 (10% maintenance deduction)
  const area = parseFloat(property.area) || 0;
  const rateableValue = area * stdRent * 12 * 0.9;

  // Tax Rate (approx 15% of RV for this municipality)
  const taxRate = 0.15;

  const annualTax = rateableValue * taxRate;

  return {
    annualTax: Math.round(annualTax),
    rateableValue: Math.round(rateableValue),
    stdRent: stdRent
  };
};

exports.getMyProperties = async (req, res) => {
  try {
    // Mocking user connection for demo (In real app, filter by User ID)
    // Returning ALL properties to fill the carousel for impact
    const properties = await Property.find().limit(5); // Get 5 sample properties

    // Dynamically calculate tax for display
    const enrichedProperties = properties.map(prop => {
      const taxDetails = calculateTaxAmount(prop);
      return {
        ...prop._doc,
        calculatedTax: taxDetails.annualTax,
        rateableValue: taxDetails.rateableValue,
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

exports.calculatePropertyTax = async (req, res) => {
  try {
    const { propertyType, area, ward, propertyId, constructionType, occupancyType } = req.body;

    // Map ward to zone (Mock logic for Haldwani)
    const zone = ward.includes('1') ? 'A' : (ward.includes('4') ? 'C' : 'B');

    const mockProperty = {
      propertyType,
      area: parseFloat(area),
      zone,
      constructionType,
      occupancyType
    };

    const taxDetails = calculateTaxAmount(mockProperty);

    res.json({
      success: true,
      taxDetails: {
        totalTax: taxDetails.annualTax,
        ratePerSqM: taxDetails.stdRent,
        rateableValue: taxDetails.rateableValue,
        wardMultiplier: 1.0,
        area: area,
        zone: zone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
