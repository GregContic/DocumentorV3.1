const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../middleware/authMiddleware');

// Rate limiting middleware for chatbot
const rateLimit = require('express-rate-limit');

const chatbotRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many messages sent. Please wait a moment before sending another message.',
    type: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chatbot routes
router.post('/message', chatbotRateLimit, authenticate, chatbotController.processMessage);
router.get('/conversation-history', authenticate, chatbotController.getConversationHistory);
router.delete('/conversation-history', authenticate, chatbotController.clearConversationHistory);

module.exports = router;
