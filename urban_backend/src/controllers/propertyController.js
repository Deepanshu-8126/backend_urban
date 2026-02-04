const Property = require('../models/Property');
const mongoose = require('mongoose');

exports.createProperty = async (req, res) => {
  try {
    const { propertyId, ward, ownerName, area, propertyType, circleRate, location } = req.body;
    const assessedValue = circleRate && area ? circleRate * area : 0;
    const property = new Property({ propertyId, ward, ownerName, area, propertyType, circleRate, assessedValue, location });
    await property.save();
    res.status(201).json({ success: true, property });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create property' });
  }
};

function calculatePropertyTax(area, propertyType, ward) {
  const baseRates = {
    residential: 50,
    commercial: 150,
    industrial: 100,
    mixed: 120
  };

  const wardMultipliers = {
    'Ward 1': 1.5,
    'Ward 2': 1.3,
    'Ward 3': 1.2,
    'Ward 4': 1.1,
    'Ward 5': 1.0
  };

  const rate = baseRates[propertyType] || 50;
  const multiplier = wardMultipliers[ward] || 1.0;
  const taxAmount = area * rate * multiplier;

  return Math.round(taxAmount);
}

exports.getProperties = async (req, res) => {
  try {
    const { lat, long, radius } = req.query;
    let query = {};

    if (lat && long) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(long), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) || 5000
        }
      };
    }

    const properties = await Property.find(query).limit(50);

    const formattedProperties = properties.map(prop => {
      const estimatedTax = calculatePropertyTax(prop.area, prop.propertyType, prop.ward);
      return {
        propertyId: prop.propertyId,
        ward: prop.ward,
        ownerName: prop.ownerName,
        area: prop.area,
        propertyType: prop.propertyType,
        location: prop.location,
        circleRate: prop.circleRate,
        assessedValue: prop.assessedValue,
        estimatedTax: estimatedTax,
        taxPaid: prop.taxPaid,
        lastAssessmentDate: prop.lastAssessmentDate
      };
    });

    res.json({ success: true, data: formattedProperties });
  } catch (error) {
    console.error("Get Properties Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch properties' });
  }
};

exports.getRevenueStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();

    const revenueData = await Property.aggregate([
      {
        $group: {
          _id: null,
          totalAssessedValue: { $sum: '$assessedValue' },
          paidCount: {
            $sum: { $cond: ['$taxPaid', 1, 0] }
          },
          unpaidCount: {
            $sum: { $cond: ['$taxPaid', 0, 1] }
          }
        }
      }
    ]);

    const stats = revenueData[0] || { totalAssessedValue: 0, paidCount: 0, unpaidCount: 0 };

    const totalTax = await Property.aggregate([
      {
        $project: {
          tax: {
            $multiply: [
              '$area',
              {
                $switch: {
                  branches: [
                    { case: { $eq: ['$propertyType', 'residential'] }, then: 50 },
                    { case: { $eq: ['$propertyType', 'commercial'] }, then: 150 },
                    { case: { $eq: ['$propertyType', 'industrial'] }, then: 100 },
                    { case: { $eq: ['$propertyType', 'mixed'] }, then: 120 }
                  ],
                  default: 50
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalTax: { $sum: '$tax' }
        }
      }
    ]);

    const taxSum = totalTax[0]?.totalTax || 0;

    res.json({
      success: true,
      stats: {
        totalProperties,
        totalTaxCollected: Math.round(taxSum),
        totalAssessedValue: Math.round(stats.totalAssessedValue),
        paidProperties: stats.paidCount,
        defaulters: stats.unpaidCount,
        collectionRate: totalProperties > 0 ? Math.round((stats.paidCount / totalProperties) * 100) : 0
      }
    });
  } catch (error) {
    console.error("Revenue Stats Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue stats' });
  }
};

exports.calculateTax = async (req, res) => {
  try {
    const { propertyId, area, propertyType, location, ward } = req.body;

    const taxAmount = calculatePropertyTax(area, propertyType, ward);

    if (propertyId) {
      const property = await Property.findOne({ propertyId });
      if (property) {
        property.assessedValue = taxAmount * 10;
        property.lastAssessmentDate = new Date();
        await property.save();
      }
    }

    res.json({
      success: true,
      taxDetails: {
        propertyType,
        area,
        ward,
        ratePerSqM: propertyType === 'commercial' ? 150 : propertyType === 'industrial' ? 100 : propertyType === 'mixed' ? 120 : 50,
        totalTax: taxAmount,
        currency: 'INR',
        dueDate: new Date(new Date().getFullYear(), 3, 31)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Tax calculation failed' });
  }
};
