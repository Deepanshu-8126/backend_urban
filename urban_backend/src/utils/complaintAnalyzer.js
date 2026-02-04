class ComplaintAnalyzer {
  constructor() {
    this.keywords = {
      water: {
        primary: ['water', 'jal', 'paani', 'पानी', 'जल', 'supply', 'supply'],
        secondary: ['pipe', 'tap', 'tank', 'bore', 'well', 'leakage', 'leaking', 'tanker', 'connection', 'pressure', 'flow'],
        regional: ['jal', 'paani', 'pani', 'jal ki samasya', 'पानी की समस्या', 'जल समस्या'],
        synonyms: ['hydro', 'aquatic', 'liquid', 'fluid', 'supply', 'distribution']
      },
      electricity: {
        primary: ['electricity', 'bijli', 'power', 'current', 'बिजली', 'विद्युत'],
        secondary: ['light', 'bulb', 'switch', 'fuse', 'wire', 'outage', 'voltage', 'transformer', 'pole', 'meter'],
        regional: ['bijli ki samasya', 'बिजली की समस्या', 'light nahi', 'लाइट नहीं'],
        synonyms: ['energy', 'electrical', 'power', 'voltage', 'current', 'supply']
      },
      roads: {
        primary: ['road', 'sadak', 'street', 'path', 'सड़क', 'सड़कें', 'सडक'],
        secondary: ['pothole', 'damage', 'repair', 'construction', 'traffic', 'signal', 'speed breaker', 'signage'],
        regional: ['sadak ki samasya', 'सड़क की समस्या', 'raasta', 'रास्ता'],
        synonyms: ['highway', 'street', 'avenue', 'lane', 'bypass', 'corridor']
      },
      garbage: {
        primary: ['garbage', 'waste', 'kachra', 'कचरा', 'kucha', 'कूड़ा', 'dump'],
        secondary: ['collection', 'disposal', 'bins', 'dustbin', 'recycling', 'segregation', 'pickup'],
        regional: ['kachra utarna', 'कचरा उठाना', 'kucha safai', 'कूड़ा सफाई'],
        synonyms: ['trash', 'refuse', 'rubbish', 'waste', 'scrap', 'discarded']
      },
      health: {
        primary: ['health', 'hospital', 'doctor', 'medical', 'स्वास्थ्य', 'डॉक्टर', 'अस्पताल'],
        secondary: ['medicine', 'clinic', 'ambulance', 'pharmacy', 'nurse', 'treatment', 'emergency'],
        regional: ['doctor ki samasya', 'डॉक्टर की समस्या', 'hospital', 'हॉस्पिटल'],
        synonyms: ['medical', 'healthcare', 'treatment', 'clinic', 'hospital', 'medicine']
      },
      traffic: {
        primary: ['traffic', 'jam', 'congestion', 'ट्रैफिक', 'जाम'],
        secondary: ['signal', 'police', 'accident', 'parking', 'speed', 'rules', 'violation'],
        regional: ['traffic jam', 'ट्रैफिक जाम', 'raja', 'राजा'],
        synonyms: ['commute', 'transport', 'movement', 'flow', 'congestion', 'delay']
      },
      noise: {
        primary: ['noise', 'sound', 'loud', 'शोर', 'आवाज़'],
        secondary: ['music', 'speaker', 'construction', 'party', 'night', 'disturbance'],
        regional: ['shor', 'शोर', 'awaaz', 'आवाज'],
        synonyms: ['sound', 'noise pollution', 'disturbance', 'loudness', 'volume']
      },
      pollution: {
        primary: ['pollution', 'polluted', 'contamination', 'प्रदूषण'],
        secondary: ['air', 'water', 'soil', 'waste', 'chemical', 'industrial', 'vehicle'],
        regional: ['pradooshan', 'प्रदूषण', 'saaf', 'साफ'],
        synonyms: ['contamination', 'pollutants', 'toxic', 'harmful', 'environmental']
      },
      safety: {
        primary: ['safety', 'security', 'danger', 'hazard', 'सुरक्षा'],
        secondary: ['theft', 'robbery', 'assault', 'crime', 'police', 'guard', 'lighting'],
        regional: ['suraksha', 'सुरक्षा', 'safety', 'सेफ्टी'],
        synonyms: ['security', 'protection', 'safety', 'prevention', 'risk', 'threat']
      },
      infrastructure: {
        primary: ['infrastructure', 'building', 'construction', 'structure', 'इमारत'],
        secondary: ['bridge', 'drainage', 'sewerage', 'lift', 'escalator', 'facilities'],
        regional: ['infra', 'इंफ्रा', 'nirmaan', 'निर्माण'],
        synonyms: ['development', 'construction', 'buildings', 'facilities', 'amenities']
      }
    };

    this.weightMatrix = {
      primary: 1.0,
      secondary: 0.7,
      regional: 0.9,
      synonyms: 0.5
    };

    this.contextualPatterns = {
      water: [
        /no.*water/i,
        /water.*not.*coming/i,
        /supply.*interrupted/i,
        /pipe.*broken/i,
        /tank.*empty/i
      ],
      electricity: [
        /no.*light/i,
        /power.*cut/i,
        /electricity.*not.*coming/i,
        /light.*off/i,
        /power.*failure/i
      ],
      roads: [
        /road.*bad/i,
        /potholes.*everywhere/i,
        /road.*needs.*repair/i,
        /traffic.*jam/i,
        /road.*damage/i
      ],
      garbage: [
        /garbage.*not.*collected/i,
        /waste.*piling/i,
        /kachra.*not.*removed/i,
        /dustbin.*full/i,
        /bins.*not.*provided/i
      ],
      health: [
        /doctor.*not.*available/i,
        /hospital.*far/i,
        /medicine.*not.*available/i,
        /medical.*help/i,
        /health.*facility/i
      ]
    };

    this.negationWords = [
      'not', 'no', 'none', 'without', 'lack', 'absence', 
      'nhi', 'nahi', 'नहीं', 'na', 'न', 'without'
    ];

    this.intensityModifiers = {
      high: ['very', 'too', 'extremely', 'highly', 'severely', 'badly', 'terribly'],
      medium: ['quite', 'rather', 'fairly', 'somewhat', 'moderately'],
      low: ['slightly', 'little', 'mildly', 'partially', 'marginally']
    };

    this.priorityScoring = {
      emergency: ['emergency', 'urgent', 'immediate', 'critical', 'danger', 'safety', 'health'],
      high: ['very', 'too', 'extremely', 'severe', 'major', 'serious', 'bad', 'worse'],
      medium: ['moderate', 'average', 'some', 'few', 'minor', 'small'],
      low: ['slight', 'minor', 'small', 'little', 'tiny', 'minimal']
    };

    this.departmentMapping = {
      water: { department: 'water-works', assignedDept: 'water', priority: 1 },
      electricity: { department: 'power', assignedDept: 'electricity', priority: 1 },
      roads: { department: 'public-works', assignedDept: 'roads', priority: 2 },
      garbage: { department: 'sanitation', assignedDept: 'garbage', priority: 2 },
      health: { department: 'health', assignedDept: 'health', priority: 0 },
      traffic: { department: 'traffic', assignedDept: 'traffic', priority: 3 },
      noise: { department: 'environment', assignedDept: 'noise', priority: 3 },
      pollution: { department: 'environment', assignedDept: 'pollution', priority: 3 },
      safety: { department: 'safety', assignedDept: 'safety', priority: 0 },
      infrastructure: { department: 'public-works', assignedDept: 'infrastructure', priority: 2 }
    };

    this.categoryWeights = {
      exact_match: 2.0,
      partial_match: 1.0,
      contextual_match: 1.5,
      semantic_similarity: 0.8
    };
  }

  /**
   * Main analysis method - Analyzes complaint text and returns detailed results
   */
  static analyze(title, description) {
    const analyzer = new ComplaintAnalyzer();
    return analyzer.performAnalysis(title, description);
  }

  performAnalysis(title, description) {
    try {
      const text = this.preprocessText(title, description);
      const analysisResults = this.analyzeText(text);
      const finalResult = this.generateFinalResult(analysisResults);
      
      console.log('🤖 AI Analysis Complete:', {
        input: { title, description },
        result: finalResult
      });
      
      return finalResult;
    } catch (error) {
      console.error('❌ AI Analysis Error:', error.message);
      return this.getDefaultResult();
    }
  }

  preprocessText(title, description) {
    const combinedText = (title + ' ' + description).toLowerCase();
    
    // Remove special characters and normalize
    let cleanedText = combinedText
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Handle negations
    cleanedText = this.handleNegations(cleanedText);
    
    return cleanedText;
  }

  handleNegations(text) {
    // Simple negation handling
    this.negationWords.forEach(negation => {
      const pattern = new RegExp(`(${negation})\\s+(\\w+)`, 'gi');
      text = text.replace(pattern, (match, neg, word) => {
        return `no_${word}`;
      });
    });
    
    return text;
  }

  analyzeText(text) {
    const scores = {};
    const matches = {};

    // Analyze each department
    for (const [dept, keywords] of Object.entries(this.keywords)) {
      const score = this.calculateDepartmentScore(dept, text, keywords);
      scores[dept] = score;
      
      const deptMatches = this.findMatches(dept, text, keywords);
      matches[dept] = deptMatches;
    }

    // Contextual pattern matching
    const contextualScores = this.applyContextualPatterns(text);
    
    // Combine scores
    const combinedScores = this.combineScores(scores, contextualScores);
    
    return {
      scores: combinedScores,
      matches: matches,
      text: text
    };
  }

  calculateDepartmentScore(department, text, keywords) {
    let totalScore = 0;
    const matchDetails = [];

    // Primary keywords scoring
    const primaryMatches = this.matchKeywords(text, keywords.primary, this.weightMatrix.primary);
    totalScore += primaryMatches.score;
    matchDetails.push(...primaryMatches.matches);

    // Secondary keywords scoring
    const secondaryMatches = this.matchKeywords(text, keywords.secondary, this.weightMatrix.secondary);
    totalScore += secondaryMatches.score;
    matchDetails.push(...secondaryMatches.matches);

    // Regional keywords scoring
    const regionalMatches = this.matchKeywords(text, keywords.regional, this.weightMatrix.regional);
    totalScore += regionalMatches.score;
    matchDetails.push(...regionalMatches.matches);

    // Synonyms scoring
    const synonymMatches = this.matchKeywords(text, keywords.synonyms, this.weightMatrix.synonyms);
    totalScore += synonymMatches.score;
    matchDetails.push(...synonymMatches.matches);

    return {
      score: totalScore,
      matches: matchDetails,
      keywordCount: matchDetails.length
    };
  }

  matchKeywords(text, keywords, weight) {
    let totalScore = 0;
    const matches = [];

    if (!keywords) return { score: 0, matches: [] };

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const found = text.match(regex);
      
      if (found) {
        const count = found.length;
        const score = count * weight;
        totalScore += score;
        
        matches.push({
          keyword: keyword,
          count: count,
          score: score,
          type: this.getKeywordType(keyword, keywords)
        });
      }
    });

    return { score: totalScore, matches: matches };
  }

  getKeywordType(keyword, keywordsArray) {
    if (keywordsArray === this.keywords.water.primary) return 'primary';
    if (keywordsArray === this.keywords.water.secondary) return 'secondary';
    if (keywordsArray === this.keywords.water.regional) return 'regional';
    if (keywordsArray === this.keywords.water.synonyms) return 'synonyms';
    return 'unknown';
  }

  findMatches(department, text, keywords) {
    const matches = [];
    
    for (const [type, words] of Object.entries(keywords)) {
      words.forEach(word => {
        if (text.includes(word)) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const occurrences = [...text.matchAll(regex)];
          
          occurrences.forEach(match => {
            matches.push({
              word: word,
              position: match.index,
              matchedText: match[0]
            });
          });
        }
      });
    }
    
    return matches;
  }

  applyContextualPatterns(text) {
    const scores = {};
    
    for (const [dept, patterns] of Object.entries(this.contextualPatterns)) {
      let deptScore = 0;
      
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          deptScore += matches.length * this.categoryWeights.contextual_match;
        }
      });
      
      scores[dept] = deptScore;
    }
    
    return scores;
  }

  combineScores(baseScores, contextualScores) {
    const combined = {};
    
    for (const [dept, baseScore] of Object.entries(baseScores)) {
      const contextualScore = contextualScores[dept] || 0;
      combined[dept] = baseScore.score + contextualScore;
    }
    
    return combined;
  }

  generateFinalResult(analysisResults) {
    // Find the highest scoring department
    const sortedDepartments = Object.entries(analysisResults.scores)
      .sort(([,a], [,b]) => b - a);
    
    const [bestDept, bestScore] = sortedDepartments[0];
    
    // Calculate confidence based on score distribution
    const totalScore = Object.values(analysisResults.scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? (bestScore / totalScore) : 0.1;
    
    // Apply intensity modifiers
    const intensity = this.calculateIntensity(analysisResults.text);
    
    // Determine priority
    const priority = this.calculatePriority(bestDept, analysisResults.text, intensity);
    
    // Get department mapping
    const deptInfo = this.departmentMapping[bestDept] || this.departmentMapping.infrastructure;
    
    return {
      department: deptInfo.department,
      assignedDept: deptInfo.assignedDept,
      category: bestDept,
      confidence: Math.min(confidence, 1.0),
      priorityScore: priority,
      complaintCount: 1,
      aiProcessed: true,
      aiConfidence: confidence,
      matchedKeywords: analysisResults.matches[bestDept],
      intensityLevel: intensity.level,
      intensityScore: intensity.score,
      analysisDetails: {
        rawScores: analysisResults.scores,
        bestMatch: bestDept,
        bestScore: bestScore,
        totalScore: totalScore
      }
    };
  }

  calculateIntensity(text) {
    let intensityScore = 0;
    let intensityLevel = 'low';

    for (const [level, words] of Object.entries(this.intensityModifiers)) {
      words.forEach(word => {
        if (text.includes(word)) {
          intensityScore += 0.2;
        }
      });
    }

    if (intensityScore >= 0.6) intensityLevel = 'high';
    else if (intensityScore >= 0.3) intensityLevel = 'medium';
    else intensityLevel = 'low';

    return { score: intensityScore, level: intensityLevel };
  }

  calculatePriority(category, text, intensity) {
    let basePriority = this.departmentMapping[category]?.priority || 1;
    
    // Check for emergency keywords
    for (const [level, words] of Object.entries(this.priorityScoring)) {
      for (const word of words) {
        if (text.includes(word)) {
          if (level === 'emergency') basePriority = Math.max(basePriority, 0);
          else if (level === 'high') basePriority = Math.max(basePriority, 2);
          else if (level === 'medium') basePriority = Math.max(basePriority, 1);
        }
      }
    }

    // Adjust based on intensity
    if (intensity.level === 'high') basePriority = Math.max(basePriority, 0);
    else if (intensity.level === 'medium') basePriority = Math.max(basePriority, 1);

    return basePriority;
  }

  getDefaultResult() {
    return {
      department: 'general',
      assignedDept: 'general',
      category: 'other',
      confidence: 0.1,
      priorityScore: 1,
      complaintCount: 1,
      aiProcessed: true,
      aiConfidence: 0.1,
      matchedKeywords: [],
      intensityLevel: 'low',
      intensityScore: 0,
      analysisDetails: {
        rawScores: {},
        bestMatch: 'other',
        bestScore: 0,
        totalScore: 0
      }
    };
  }

  /**
   * Batch analysis for multiple complaints
   */
  static batchAnalyze(complaints) {
    return complaints.map(complaint => {
      return {
        id: complaint.id,
        ...this.analyze(complaint.title, complaint.description)
      };
    });
  }

  /**
   * Get analysis statistics
   */
  getStatistics() {
    return {
      totalCategories: Object.keys(this.keywords).length,
      totalKeywords: Object.values(this.keywords).reduce((sum, cat) => {
        return sum + Object.values(cat).reduce((catSum, keywords) => catSum + (keywords?.length || 0), 0);
      }, 0),
      weightMatrix: this.weightMatrix,
      departmentMappings: Object.keys(this.departmentMapping).length
    };
  }

  /**
   * Update keywords dynamically
   */
  updateKeywords(category, keywords) {
    if (this.keywords[category]) {
      this.keywords[category] = { ...this.keywords[category], ...keywords };
    }
  }

  /**
   * Get trending categories
   */
  static getTrendingCategories(recentComplaints, days = 7) {
    const categoryCounts = {};
    const now = Date.now();
    
    recentComplaints.forEach(complaint => {
      const daysDiff = (now - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= days) {
        const analysis = this.analyze(complaint.title, complaint.description);
        categoryCounts[analysis.category] = (categoryCounts[analysis.category] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }
}

module.exports = ComplaintAnalyzer;

// Initialize and log stats
const analyzer = new ComplaintAnalyzer();
console.log('✅ Advanced Complaint Analyzer Loaded');
console.log('📊 Statistics:', analyzer.getStatistics());