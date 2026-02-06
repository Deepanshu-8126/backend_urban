const { Groq } = require("groq-sdk");
const Complaint = require('../models/Complaint');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');

// Initialize Groq
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// ✅ AI Category Validation Function (EXISTING - KEPT AS IS)
exports.validateCategory = async (req, res) => {
  try {
    const { complaintText, userSelectedCategory, complaintId } = req.body;

    if (!complaintText || !userSelectedCategory) {
      return res.status(400).json({
        success: false,
        error: 'Complaint text and selected category are required'
      });
    }

    if (!groq) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured'
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI system used in a Smart City Complaint Management Platform.
          
          Your task is to analyze a citizen complaint using ONLY the text provided by the user
          and validate whether the selected category is correct.
          
          Available categories:
          - Water
          - Electricity
          - Road
          - Garbage
          - Street Light
          - Sewerage
          - Traffic
          - Property
          - Environment
          - Other
          
          Rules:
          - Do NOT assume the user is always right.
          - Be strict and realistic.
          - If the text clearly belongs to a different category, mark it as mismatch.
          - If the text is vague, mark confidence as low.
          
          Return ONLY a valid JSON object in the following format:
          {
            "userCategory": "${userSelectedCategory}",
            "aiDetectedCategory": "<best matching category based on text>",
            "isMismatch": true | false,
            "confidence": 0.0 to 1.0,
            "reason": "<short human-readable explanation>",
            "suggestedAction": "accept" | "warn_user" | "auto_correct",
            "suggestedCategory": "<correct category if mismatch>"
          }`
        },
        {
          role: "user",
          content: `Complaint Text: "${complaintText}"\nUser Selected Category: "${userSelectedCategory}"`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0]?.message?.content || "{}";

    let validationResult;
    try {
      validationResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response',
        fallback: {
          userCategory: userSelectedCategory,
          aiDetectedCategory: userSelectedCategory,
          isMismatch: false,
          confidence: 0.5,
          reason: 'AI processing failed',
          suggestedAction: 'accept',
          suggestedCategory: userSelectedCategory
        }
      });
    }

    // If there's a mismatch, update the complaint
    if (validationResult.isMismatch && validationResult.suggestedAction === 'auto_correct') {
      await Complaint.findByIdAndUpdate(
        complaintId,
        {
          category: validationResult.suggestedCategory,
          department: getDepartmentForCategory(validationResult.suggestedCategory),
          assignedDept: validationResult.suggestedCategory.toLowerCase(),
          aiCorrected: true,
          aiCorrectionReason: validationResult.reason
        }
      );
    }

    res.json({
      success: true,
      validationResult,
      message: validationResult.isMismatch
        ? 'Category mismatch detected! Please review your selection.'
        : 'Category validated successfully!'
    });

  } catch (error) {
    console.error('AI validation error:', error);
    res.status(500).json({
      success: false,
      error: 'AI validation failed',
      fallback: {
        userCategory: req.body.userSelectedCategory,
        aiDetectedCategory: req.body.userSelectedCategory,
        isMismatch: false,
        confidence: 0.5,
        reason: 'AI processing failed',
        suggestedAction: 'accept',
        suggestedCategory: req.body.userSelectedCategory
      }
    });
  }
};

// Helper function to get department for category
function getDepartmentForCategory(category) {
  const departmentMap = {
    'water': 'water-works',
    'electricity': 'power',
    'road': 'public-works',
    'garbage': 'sanitation',
    'street light': 'public-works',
    'sewerage': 'sanitation',
    'traffic': 'traffic',
    'property': 'revenue',
    'environment': 'environment',
    'other': 'general'
  };

  return departmentMap[category.toLowerCase()] || 'general';
}

// ✅ AUTO-CATEGORY FUNCTION (EXISTING - KEPT AS IS)
exports.autoCategorizeComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    const validationResult = await validateComplaintText(
      complaint.description,
      complaint.category,
      complaintId
    );

    res.json({
      success: true,
      complaint: {
        ...complaint.toObject(),
        category: validationResult.suggestedCategory,
        aiValidation: validationResult
      }
    });

  } catch (error) {
    console.error('Auto categorize error:', error);
    res.status(500).json({
      success: false,
      error: 'Auto categorization failed'
    });
  }
};

// Internal function for validation
async function validateComplaintText(complaintText, userSelectedCategory, complaintId) {
  if (!groq) {
    return {
      userCategory: userSelectedCategory,
      aiDetectedCategory: userSelectedCategory,
      isMismatch: false,
      confidence: 0.5,
      reason: 'AI service not configured',
      suggestedAction: 'accept',
      suggestedCategory: userSelectedCategory
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI system used in a Smart City Complaint Management Platform.
          
          Your task is to analyze a citizen complaint using ONLY the text provided by the user
          and validate whether the selected category is correct.
          
          Available categories:
          - Water
          - Electricity
          - Roads
          - Garbage
          - Street Light
          - Sewerage
          - Traffic
          - Crime
          - Other
          
          Return ONLY a valid JSON object in the following format:
          {
            "userCategory": "${userSelectedCategory}",
            "aiDetectedCategory": "<best matching category based on text>",
            "isMismatch": true | false,
            "confidence": 0.0 to 1.0,
            "reason": "<short human-readable explanation>",
            "suggestedAction": "accept" | "warn_user" | "auto_correct",
            "suggestedCategory": "<correct category if mismatch>"
          }`
        },
        {
          role: "user",
          content: `Complaint Text: "${complaintText}"\nUser Selected Category: "${userSelectedCategory}"`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(aiResponse);
  } catch (error) {
    console.error('Internal validation error:', error);
    return {
      userCategory: userSelectedCategory,
      aiDetectedCategory: userSelectedCategory,
      isMismatch: false,
      confidence: 0.5,
      reason: 'AI processing failed',
      suggestedAction: 'accept',
      suggestedCategory: userSelectedCategory
    };
  }
}

// ✅ BATCH VALIDATION (EXISTING - KEPT AS IS)
exports.batchValidateCategories = async (req, res) => {
  try {
    const { complaintIds } = req.body;

    const results = await Promise.all(
      complaintIds.map(async (id) => {
        const complaint = await Complaint.findById(id);
        if (!complaint) return null;

        const validation = await validateComplaintText(
          complaint.description,
          complaint.category,
          id
        );

        // Update if mismatch found
        if (validation.isMismatch && validation.suggestedAction === 'auto_correct') {
          await Complaint.findByIdAndUpdate(id, {
            category: validation.suggestedCategory,
            department: getDepartmentForCategory(validation.suggestedCategory),
            assignedDept: validation.suggestedCategory.toLowerCase(),
            aiCorrected: true,
            aiCorrectionReason: validation.reason
          });
        }

        return {
          complaintId: id,
          originalCategory: complaint.category,
          aiSuggestedCategory: validation.suggestedCategory,
          isMismatch: validation.isMismatch,
          confidence: validation.confidence,
          reason: validation.reason
        };
      })
    );

    const validResults = results.filter(result => result !== null);

    res.json({
      success: true,
      totalProcessed: validResults.length,
      mismatchesFound: validResults.filter(r => r.isMismatch).length,
      results: validResults
    });

  } catch (error) {
    console.error('Batch validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch validation failed'
    });
  }
};

// ✅ GET CATEGORY STATISTICS (EXISTING - KEPT AS IS)
exports.getCategoryValidationStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const correctedComplaints = await Complaint.countDocuments({ aiCorrected: true });
    const pendingValidation = await Complaint.countDocuments({ aiProcessed: { $ne: true } });

    const categoryBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          corrected: { $sum: { $cond: [{ $eq: ['$aiCorrected', true] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      statistics: {
        totalComplaints,
        correctedComplaints,
        pendingValidation,
        accuracyRate: totalComplaints > 0 ? ((totalComplaints - correctedComplaints) / totalComplaints) * 100 : 100,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
};

// ========================================
// 🚀 ADVANCED AGENTIC AI CITY BRAIN
// ========================================

// ✅ ENHANCED CHAT WITH CITY BRAIN (God-Level AI Agent with Actions)
exports.chatWithCityBrain = async (req, res) => {
  try {
    const { question, context, userId, userEmail, userName } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    if (!groq) {
      return res.status(503).json({ success: false, error: 'AI Service Unavailable' });
    }

    // -----------------------------------
    // 🧠 SELECT SYSTEM PROMPT BASED ON ROLE
    // -----------------------------------
    const userRole = req.body.role || 'citizen';
    const userDept = req.body.department || 'General';

    let systemPromptContent = "";

    if (userRole === 'admin') {
      systemPromptContent = `You are "City Brain Admin Assistant" — a strategic AI partner for City Officials.
      
CORE IDENTITY:
- User is an ADMIN from the "${userDept}" department.
- Tailor answers to department context.
- Be precise, data-driven, and efficient.

ADMIN CAPABILITIES:
1. **NAVIGATE_ADMIN**: Jump to tools
   - Keywords: "pending complaints", "show map", "monitor", "dashboard"
   - Data needed: "screen" (AdminComplaintList, MonitorMap, Dashboard)
   - Filter data: "status" (Pending/Solved), "filter" (Water/Road)
   
2. **SHOW_ANALYTICS**: Show stats
   - Keywords: "summary", "stats", "report"
   - Data needed: "type" (Daily, Weekly)

3. **DRAFT_NOTIFICATION**: Draft alerts
   - Keywords: "send alert", "broadcast"
   - Ask for: Title, Body

4. **GENERAL_QUERY**: Technical questions

RESPONSE FORMAT (JSON):
{
  "intent": "NAVIGATE_ADMIN" | "SHOW_ANALYTICS" | "DRAFT_NOTIFICATION" | "GENERAL_QUERY",
  "data": { "screen": "...", "filter": "..." },
  "message": "Brief confirmation",
  "readyToExecute": true | false
}`;
    } else {
      systemPromptContent = `You are "City Brain AI Assistant" — a smart urban AI agent.

CORE BEHAVIOR:
- Behave like a calm, experienced human expert.
- Short, precise, actionable answers.
- **STRICT SAFETY**: 
  - REJECT any query related to romance, dating, violence, self-harm, hate speech, or explicit content.
  - Reply ONLY: "I am a Smart City AI. Please limit your queries to city services and grievances."
  - Do NOT engage in casual chit-chat outside city topics.

AGENTIC CAPABILITIES:
1. **FILE_COMPLAINT**: Report issues (SMART EXTRACTION)
   - Detect keywords: "complaint", "report", "file karna hai", "complain", "issue", "problem", "broken", "dirty"
   - **ACTION**: Extract ALL details available in the user's text.
   - **REQUIRED DATA**:
     - title: Generate a professional 4-6 word summary (e.g., "Severe Pothole on Main St").
     - description: The full user message + any inferred details.
     - category: Auto-classify (Water/Roads/Electricity/Garbage/Sewerage/Traffic/Crime/Street Light/Other).
     - location: Extract specific location if mentioned.
   - **IF MISSING**: Ask for the missing field (usually location).
   - **IF READY**: Set readyToExecute: true. (CRITICAL: ALWAYS set this to true if you have extracted a Title and Description).
   
2. **CHECK_AQI**: Check air quality
   - Ask for location
   
3. **CALCULATE_TAX**: Property tax info
   - Ask for: property type, area, ward
   
4. **TRIGGER_SOS**: Emergency
   - Ask info

5. **GENERAL_QUERY**: General Q&A about city services

RESPONSE FORMAT (JSON):
{
  "intent": "FILE_COMPLAINT" | "CHECK_AQI" | "CALCULATE_TAX" | "TRIGGER_SOS" | "GENERAL_QUERY",
  "data": { "title": "...", "description": "...", "category": "...", "location": "..." },
  "message": "confirmation or clarification question",
  "readyToExecute": true | false
}`;
    }

    // Build conversation messages with ENHANCED SYSTEM PROMPT
    const messages = [
      {
        role: "system",
        content: systemPromptContent
      }
    ];

    // Add conversation context if provided
    if (context && context.trim().length > 0) {
      messages.push({
        role: "user",
        content: `Previous conversation context:\n${context}`
      });
      messages.push({
        role: "assistant",
        content: "Understood. I will use this context to answer your next question."
      });
    }

    // Add current question
    messages.push({
      role: "user",
      content: question
    });

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    let aiResponse = completion.choices[0]?.message?.content || '{"intent": "GENERAL_QUERY", "message": "I am unable to process that right now."}';

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsedResponse = {
        intent: "GENERAL_QUERY",
        message: aiResponse,
        readyToExecute: false
      };
    }

    res.json({
      success: true,
      answer: parsedResponse.message || parsedResponse.text || "I'm here to help!",
      intent: parsedResponse.intent || "GENERAL_QUERY",
      needsMoreInfo: parsedResponse.needsMoreInfo || false,
      missingFields: parsedResponse.missingFields || [],
      data: parsedResponse.data || {},
      readyToExecute: parsedResponse.readyToExecute || false,
      fullResponse: parsedResponse
    });

  } catch (error) {
    console.error('CityBrain Chat Error:', error);
    res.status(500).json({ success: false, error: 'Failed to get answer from CityBrain' });
  }
};

// ✅ SAVE CHAT SESSION
exports.saveChatSession = async (req, res) => {
  try {
    const { sessionId, title, messages, userId, userEmail, userName } = req.body;

    if (!sessionId || !messages || !userId) {
      return res.status(400).json({ success: false, error: 'Session data incomplete' });
    }

    // Check if session already exists
    let chatSession = await ChatHistory.findOne({ sessionId });

    if (chatSession) {
      // Update existing session
      chatSession.title = title || chatSession.title;
      chatSession.messages = messages;
      chatSession.updatedAt = new Date();
      await chatSession.save();
    } else {
      // Create new session
      chatSession = new ChatHistory({
        userId,
        userEmail,
        userName,
        sessionId: sessionId || require('uuid').v4(), // Generate if missing
        title: title || 'New Chat',
        messages
      });
      await chatSession.save();
    }

    res.json({
      success: true,
      message: 'Chat session saved successfully',
      session: chatSession
    });

  } catch (error) {
    console.error('Save chat session error:', error);
    res.status(500).json({ success: false, error: 'Failed to save chat session' });
  }
};

// ✅ GET CHAT HISTORY
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const chatSessions = await ChatHistory.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .select('sessionId title createdAt updatedAt hasActions actionsCount lastActionType')
      .limit(50);

    res.json({
      success: true,
      sessions: chatSessions,
      count: chatSessions.length
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
};

// ✅ LOAD CHAT SESSION
exports.loadChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    if (!sessionId || !userId) {
      return res.status(400).json({ success: false, error: 'Session ID and User ID required' });
    }

    const chatSession = await ChatHistory.findOne({ sessionId, userId, isActive: true });

    if (!chatSession) {
      return res.status(404).json({ success: false, error: 'Chat session not found' });
    }

    res.json({
      success: true,
      session: chatSession
    });

  } catch (error) {
    console.error('Load chat session error:', error);
    res.status(500).json({ success: false, error: 'Failed to load chat session' });
  }
};

// ✅ DELETE CHAT SESSION
exports.deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    if (!sessionId || !userId) {
      return res.status(400).json({ success: false, error: 'Session ID and User ID required' });
    }

    const result = await ChatHistory.findOneAndUpdate(
      { sessionId, userId },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, error: 'Chat session not found' });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete chat session' });
  }
};

// ✅ GET ADMIN CHAT ANALYTICS
exports.getAdminChatAnalytics = async (req, res) => {
  try {
    const totalChats = await ChatHistory.countDocuments({ isActive: true });
    const chatsWithActions = await ChatHistory.countDocuments({ hasActions: true, isActive: true });

    const actionBreakdown = await ChatHistory.aggregate([
      { $match: { isActive: true, hasActions: true } },
      { $group: { _id: '$lastActionType', count: { $sum: 1 } } }
    ]);

    const recentChatsWithActions = await ChatHistory.find({ hasActions: true, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('userEmail userName title lastActionType actionsCount updatedAt');

    res.json({
      success: true,
      analytics: {
        totalChats,
        chatsWithActions,
        actionBreakdown,
        recentChatsWithActions
      }
    });

  } catch (error) {
    console.error('Admin chat analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};

module.exports = exports;