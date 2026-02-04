/**
 * AI Complaint Classifier for Government Grievance System
 * Analyzes complaint and assigns to correct department
 */
class ComplaintAnalyzer {
  /**
   * Analyze complaint and return department
   * @param {string} title - Complaint title
   * @param {string} description - Complaint description
   * @returns {Object} - { department, confidence }
   */
  static analyze(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    // Department keywords mapping
    const departmentKeywords = {
      water: ['water', 'pipe', 'leakage', 'supply', 'tap', 'tank', 'bore', 'well', 'jal', 'paani', 'पानी', 'जल'],
      electricity: ['electricity', 'bijli', 'power', 'light', 'voltage', 'fuse', 'wire', 'current', 'बिजली', 'voltage'],
      roads: ['road', 'pothole', 'sadak', 'repair', 'construction', 'traffic', 'सड़क', 'सडक', 'repair', 'crack'],
      sanitation: ['garbage', 'waste', 'kachra', 'kucha', 'कचरा', 'सफाई', 'clean', 'dustbin', 'bins', 'waste'],
      health: ['health', 'doctor', 'hospital', 'clinic', 'medicine', 'medication', 'स्वास्थ्य', 'डॉक्टर', 'sick'],
      general: ['general', 'help', 'issue', 'problem', 'support', 'काम', 'कार्य', 'work']
    };

    let bestMatch = { department: 'general', confidence: 0.1 };
    
    for (const [dept, keywords] of Object.entries(departmentKeywords)) {
      let score = 0;
      
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += 1;
        }
      }
      
      const confidence = score / keywords.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { department: dept, confidence: Math.min(confidence, 1.0) };
      }
    }
    
    // Boost confidence for strong matches
    if (bestMatch.confidence >= 0.5) {
      bestMatch.confidence = Math.min(bestMatch.confidence + 0.2, 0.95);
    }
    
    return {
      department: bestMatch.department,
      confidence: bestMatch.confidence
    };
  }

  /**
   * Get department from complaint
   * @param {Object} complaint - Complaint object
   * @returns {Object} - { assignedDept, aiConfidence, department }
   */
  static classifyComplaint(complaint) {
    const result = this.analyze(complaint.title, complaint.description);
    
    return {
      assignedDept: result.department,
      aiConfidence: result.confidence,
      category: result.department,
      department: result.department === 'water' ? 'water-works' :
                 result.department === 'electricity' ? 'power' :
                 result.department === 'roads' ? 'public-works' :
                 result.department === 'sanitation' ? 'sanitation' :
                 result.department === 'health' ? 'health' : 'general'
    };
  }
}

module.exports = ComplaintAnalyzer;