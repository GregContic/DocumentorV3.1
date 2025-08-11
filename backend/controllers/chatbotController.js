const Conversation = require('../models/Conversation');
const simpleAI = require('../utils/simpleAI');

// Predefined responses for school-related queries
const schoolContext = {
  systemPrompt: `You are DocuBot, an intelligent assistant for Eastern La Trinidad National High School's Document Request System. You should be helpful, friendly, and knowledgeable about:

SCHOOL INFORMATION:
- Eastern La Trinidad National High School is located in La Trinidad, Benguet, Philippines
- The school provides various academic documents including Form 137, SF9, SF10, Form 138, and Diploma copies
- Office hours: 8:00 AM - 5:00 PM, Monday-Friday
- Contact: registrar@eltnhs.edu.ph

DOCUMENT SERVICES:
- Form 137 (Student Permanent Record): 3-5 business days
- SF9 (Student Report Card): 2-3 business days
- SF10 (Student Learner's Profile): 3-4 business days
- Form 138 (Report Card): 2-3 business days
- Diploma Copy: 5-7 business days

FEATURES:
- AI-powered document processing for auto-filling forms
- QR code verification for document authenticity
- Online tracking system for request status
- Email and SMS notifications

You can answer general questions too, but always try to relate back to school services when appropriate. Be conversational, helpful, and use emojis appropriately.`,

  commonResponses: {
    greeting: "Hello! 👋 I'm DocuBot, your AI assistant for Eastern La Trinidad National High School. I can help you with document requests, answer questions about our services, or just chat! How can I assist you today?",
    
    enrollment: "🎓 For enrollment at Eastern La Trinidad National High School, you can use our online enrollment system! Click on 'Enrollment' in the main menu. I can help guide you through the process step by step. What grade level are you enrolling for?",
    
    location: "📍 Eastern La Trinidad National High School is located in La Trinidad, Benguet, Philippines. Our registrar's office is open Monday-Friday, 8:00 AM - 5:00 PM. You can visit us for document pickup or inquiries!",
    
    contact: "📞 You can reach us at:\n• Email: registrar@eltnhs.edu.ph\n• Office Hours: 8:00 AM - 5:00 PM (Monday-Friday)\n• Visit: Eastern La Trinidad National High School, La Trinidad, Benguet\n\nFor urgent concerns, you can also use this chat system!",
    
    unknown: "I'm not entirely sure about that, but I'm always learning! 🤖 Is this related to our document services or school information? I can definitely help with those topics, or feel free to ask me anything else!"
  }
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially harmful characters and limit length
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[<>\"'%;()&+]/g, '')
    .trim()
    .substring(0, 1000); // Limit to 1000 characters
};

// Intent classification
const classifyIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // School-specific intents
  if (/\b(enroll|enrollment|apply|application)\b/.test(lowerMessage)) return 'enrollment';
  if (/\b(form\s*137|transcript|permanent\s*record)\b/.test(lowerMessage)) return 'form137';
  if (/\b(sf\s*9|report\s*card|grades)\b/.test(lowerMessage)) return 'sf9';
  if (/\b(sf\s*10|learner\s*profile)\b/.test(lowerMessage)) return 'sf10';
  if (/\b(form\s*138|138)\b/.test(lowerMessage)) return 'form138';
  if (/\b(diploma|graduation)\b/.test(lowerMessage)) return 'diploma';
  if (/\b(status|track|progress)\b/.test(lowerMessage)) return 'status';
  if (/\b(fee|cost|price|payment)\b/.test(lowerMessage)) return 'fees';
  if (/\b(pickup|collect|office|hours)\b/.test(lowerMessage)) return 'pickup';
  if (/\b(contact|phone|email|address|location)\b/.test(lowerMessage)) return 'contact';
  if (/\b(hello|hi|hey|good\s*(morning|afternoon|evening))\b/.test(lowerMessage)) return 'greeting';
  
  // General intents
  if (/\b(help|assist|support)\b/.test(lowerMessage)) return 'help';
  if (/\b(thank|thanks|appreciate)\b/.test(lowerMessage)) return 'thanks';
  if (/\b(weather|time|date|news)\b/.test(lowerMessage)) return 'general';
  if (/\b(joke|funny|laugh)\b/.test(lowerMessage)) return 'entertainment';
  
  return 'unknown';
};

// Generate contextual response using only simpleAI
const generateContextualResponse = async (message, intent, conversationHistory, userContext) => {
  return simpleAI.generateResponse(message, intent, conversationHistory, userContext);
};

exports.processMessage = async (req, res) => {
  try {
    const { message, pageContext } = req.body;
    const userId = req.user.userId;

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    if (!sanitizedMessage) {
      return res.status(400).json({ error: 'Invalid message content' });
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = new Conversation({
        userId,
        messages: [],
        createdAt: new Date()
      });
    }

    // Always use classifyIntent for intent detection
    const intent = classifyIntent(sanitizedMessage);

    // Generate response
    const botResponse = await generateContextualResponse(
      sanitizedMessage,
      intent,
      conversation.messages,
      { pageContext, userId }
    );

    // Save conversation
    conversation.messages.push(
      { message: sanitizedMessage, isBot: false, timestamp: new Date() },
      { message: botResponse, isBot: true, timestamp: new Date() }
    );

    // Keep only last 50 messages
    if (conversation.messages.length > 50) {
      conversation.messages = conversation.messages.slice(-50);
    }

    await conversation.save();

    res.json({
      response: botResponse,
      intent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'I apologize, but I encountered an error. Please try again in a moment!',
      type: 'server_error'
    });
  }
};

exports.getConversationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversation = await Conversation.findOne({ userId });
    
    res.json({
      messages: conversation?.messages || [],
      count: conversation?.messages?.length || 0
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
};

exports.clearConversationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Conversation.findOneAndUpdate(
      { userId },
      { messages: [] },
      { upsert: true }
    );
    
    res.json({ message: 'Conversation history cleared successfully' });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ error: 'Failed to clear conversation history' });
  }
};
