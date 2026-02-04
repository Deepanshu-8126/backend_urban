const express = require('express');
const router = express.Router();
const {
    validateCategory,
    batchValidateCategories,
    chatWithCityBrain,
    saveChatSession,
    getChatHistory,
    loadChatSession,
    deleteChatSession,
    getAdminChatAnalytics
} = require('../controllers/aiController');
const { authenticateToken, adminOnly } = require('../middleware/auth');

// Existing routes
router.post('/validate-category', validateCategory);
router.post('/batch-validate', batchValidateCategories);

// Enhanced chat endpoint
router.post('/chat', chatWithCityBrain);

// Chat history management (requires auth)
router.post('/chat/save', authenticateToken, saveChatSession);
router.get('/chat/history', authenticateToken, getChatHistory);
router.get('/chat/session/:sessionId', authenticateToken, loadChatSession);
router.delete('/chat/session/:sessionId', authenticateToken, deleteChatSession);

// Admin analytics
router.get('/admin/chat-analytics', authenticateToken, adminOnly, getAdminChatAnalytics);

module.exports = router;