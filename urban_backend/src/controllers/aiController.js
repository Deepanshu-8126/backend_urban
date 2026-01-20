const Complaint = require('../models/Complaint');

// AI analysis for problems
exports.analyzeProblems = async (req, res) => {
  try {
    const { department, wardId, duration = 'monthly' } = req.query;
    
    let timeFilter = {};
    if (duration === 'daily') {
      const today = new Date();
      timeFilter.createdAt = { $gte: today.setHours(0, 0, 0, 0) };
    } else if (duration === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      timeFilter.createdAt = { $gte: weekAgo };
    } else if (duration === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      timeFilter.createdAt = { $gte: monthAgo };
    }
    
    let filter = { ...timeFilter };
    if (department) filter.department = department;
    if (wardId) filter.wardId = wardId;
    
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 });
    
    // Analyze problems by category
    const categoryAnalysis = complaints.reduce((acc, complaint) => {
      if (!acc[complaint.category]) {
        acc[complaint.category] = {
          count: 0,
          pending: 0,
          working: 0,
          solved: 0,
          totalPriority: 0
        };
      }
      
      acc[complaint.category].count++;
      acc[complaint.category][complaint.status]++;
      acc[complaint.category].totalPriority += complaint.priorityScore || 0;
      
      return acc;
    }, {});
    
    // Calculate averages
    Object.keys(categoryAnalysis).forEach(category => {
      const cat = categoryAnalysis[category];
      cat.avgPriority = cat.totalPriority / cat.count;
    });
    
    // Generate recommendations
    const recommendations = generateRecommendations(categoryAnalysis);
    
    res.json({
      success: true,
      analysis: {
        categoryAnalysis,
        totalComplaints: complaints.length,
        timePeriod: duration,
        recommendations
      }
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze problems' 
    });
  }
};

// Department wise distribution
exports.getDepartmentDistribution = async (req, res) => {
  try {
    const { department, wardId } = req.query;
    
    let filter = { status: { $ne: 'deleted' } };
    if (department) filter.department = department;
    if (wardId) filter.wardId = wardId;
    
    const complaints = await Complaint.find(filter);
    
    const distribution = complaints.reduce((acc, complaint) => {
      if (!acc[complaint.department]) {
        acc[complaint.department] = {
          total: 0,
          pending: 0,
          working: 0,
          solved: 0
        };
      }
      
      acc[complaint.department].total++;
      acc[complaint.department][complaint.status]++;
      
      return acc;
    }, {});
    
    res.json({
      success: true,
      distribution
    });
  } catch (error) {
    console.error('Department distribution error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get distribution' 
    });
  }
};

// Generate recommendations based on analysis
function generateRecommendations(analysis) {
  const recommendations = [];
  
  Object.keys(analysis).forEach(category => {
    const data = analysis[category];
    
    if (data.count > 10) {
      recommendations.push(`Department should prioritize ${category} issues - ${data.count} complaints`);
    }
    
    if (data.pending / data.count > 0.5) {
      recommendations.push(`Urgent attention needed for ${category} - ${Math.round((data.pending / data.count) * 100)}% pending`);
    }
    
    if (data.avgPriority > 7) {
      recommendations.push(`High priority ${category} issues detected - average priority: ${data.avgPriority.toFixed(1)}`);
    }
  });
  
  return recommendations;
}