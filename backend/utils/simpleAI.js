// Simple AI implementation without external dependencies
// This provides intelligent responses without requiring OpenAI API

const moment = require('moment');

// Enhanced response templates with context awareness
const responseTemplates = {
  documents: {
    form137: {
      keywords: ['form 137', 'transcript', 'permanent record', '137'],
      responses: [
        "📄 **Form 137 (Student Permanent Record)** is your official academic transcript! It costs ₱50 and takes 3-5 business days to process. You'll need a valid ID and completed request form. Want me to guide you through the request process?",
        "Your Form 137 contains all your academic history and is essential for college enrollment. Processing fee is ₱50, and it typically takes 3-5 business days. Our AI can help auto-fill your request form if you upload an old document!"
      ]
    },
    sf9: {
      keywords: ['sf9', 'sf 9', 'report card', 'grades'],
      responses: [
        "📋 **SF9 (Student Report Card)** shows your quarterly grades and attendance. Fee: ₱30, Processing: 2-3 business days. Perfect for tracking your academic progress! Need help with the request?",
        "SF9 contains your quarterly grades per subject. It's ₱30 and ready in 2-3 business days. Great for scholarship applications and transfer requirements!"
      ]
    },
    enrollment: {
      keywords: ['enroll', 'enrollment', 'apply', 'admission'],
      responses: [
        "🎓 **Enrollment at Eastern La Trinidad National High School** is now digital! Use our online enrollment system - I can guide you through each step. What grade level are you enrolling for?",
        "Our enrollment process is streamlined with AI assistance! Upload your documents and our system will help auto-fill forms. Ready to start your enrollment journey?"
      ]
    }
  },
  
  general: {
    weather: {
      keywords: ['weather', 'temperature', 'climate', 'rain', 'sunny'],
      responses: [
        "☀️ I can't check real-time weather, but La Trinidad typically has a cool, pleasant climate! Perfect for studying. Speaking of which, need help with any document requests?",
        "🌤️ La Trinidad has beautiful mountain weather! While I can't give current conditions, I can definitely help you with school documents that might require pickup on a nice day!"
      ]
    },
    time: {
      keywords: ['time', 'what time', 'current time', 'clock'],
      responses: [
        `🕐 I don't have real-time clock access, but our office hours are 8:00 AM - 5:00 PM, Monday-Friday. Perfect timing for document services!`,
        `⏰ Our registrar's office operates 8:00 AM - 5:00 PM on weekdays. That's when you can pick up documents or visit for inquiries!`
      ]
    },
    jokes: {
      keywords: ['joke', 'funny', 'laugh', 'humor'],
      responses: [
        "😄 Why did the student eat his homework? Because the teacher said it was a piece of cake! 🍰 Speaking of homework, need any academic documents?",
        "🤣 What do you call a student who doesn't turn in homework? A 'form-er' student! Get it? Like our Form 137? 📄",
        "😆 Why don't documents ever get lost? Because they always have a 'track-ing' number! Just like our request system!"
      ]
    }
  },

  contextual: {
    greeting: {
      morning: "🌅 Good morning! I'm DocuBot, ready to help you with Eastern La Trinidad National High School's services. How can I assist you today?",
      afternoon: "☀️ Good afternoon! I'm DocuBot, your AI assistant for ELTNHS. What can I help you with?",
      evening: "🌙 Good evening! I'm DocuBot, here to help with your document needs. How may I assist you?",
      default: "👋 Hello! I'm DocuBot, your AI assistant for Eastern La Trinidad National High School. Ready to help with documents, enrollment, or just chat!"
    },
    help: "🤖 **I'm here to help!** I can assist with:\n\n🏫 **School Services:**\n• Document requests (Form 137, SF9, SF10, etc.)\n• Enrollment guidance\n• Fee information\n• Processing times\n\n💬 **General Chat:**\n• Answer various questions\n• Provide helpful information\n• Have friendly conversations\n\nWhat would you like to know?",
    thanks: "😊 You're very welcome! I'm always happy to help with Eastern La Trinidad National High School services. Need anything else?",
    goodbye: "👋 Goodbye! Feel free to chat with me anytime you need help with documents or school information. Have a great day!"
  }
};

// Intent classification with better accuracy
const classifyIntent = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Remove common filler words for better matching
  const cleanMessage = lowerMessage.replace(/\b(can|you|help|me|with|the|a|an|how|to|do|i|what|is|are)\b/g, '').trim();
  
  // Document intents
  for (const [docType, docData] of Object.entries(responseTemplates.documents)) {
    if (docData.keywords.some(keyword => cleanMessage.includes(keyword))) {
      return { category: 'documents', type: docType, confidence: 0.9 };
    }
  }
  
  // General intents
  for (const [genType, genData] of Object.entries(responseTemplates.general)) {
    if (genData.keywords.some(keyword => cleanMessage.includes(keyword))) {
      return { category: 'general', type: genType, confidence: 0.8 };
    }
  }
  
  // Context intents
  if (/\b(hello|hi|hey|good\s*(morning|afternoon|evening))\b/.test(lowerMessage)) {
    const hour = new Date().getHours();
    let timeOfDay = 'default';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';
    
    return { category: 'contextual', type: 'greeting', subType: timeOfDay, confidence: 0.9 };
  }
  
  if (/\b(help|assist|support|what\s*can\s*you)\b/.test(lowerMessage)) {
    return { category: 'contextual', type: 'help', confidence: 0.8 };
  }
  
  if (/\b(thank|thanks|appreciate)\b/.test(lowerMessage)) {
    return { category: 'contextual', type: 'thanks', confidence: 0.9 };
  }
  
  if (/\b(bye|goodbye|see\s*you|farewell)\b/.test(lowerMessage)) {
    return { category: 'contextual', type: 'goodbye', confidence: 0.9 };
  }
  
  // Status and tracking
  if (/\b(status|track|progress|check|my\s*request)\b/.test(lowerMessage)) {
    return { category: 'system', type: 'status', confidence: 0.8 };
  }
  
  // Fees and pricing
  if (/\b(fee|cost|price|payment|how\s*much|money)\b/.test(lowerMessage)) {
    return { category: 'system', type: 'fees', confidence: 0.8 };
  }
  
  return { category: 'unknown', type: 'general', confidence: 0.3 };
};

// Generate intelligent response
const generateResponse = (message, intent, conversationHistory = [], userContext = {}) => {
  const { category, type, subType, confidence } = intent;
  
  // Handle high-confidence matches
  if (confidence >= 0.8) {
    if (category === 'documents') {
      const responses = responseTemplates.documents[type].responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (category === 'general') {
      const responses = responseTemplates.general[type].responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (category === 'contextual') {
      if (type === 'greeting' && subType) {
        return responseTemplates.contextual.greeting[subType];
      }
      return responseTemplates.contextual[type];
    }
  }
  
  // Handle system queries
  if (category === 'system') {
    if (type === 'status') {
      return "📊 To check your request status, visit the 'My Requests' section after logging in. You'll see real-time updates and tracking information for all your document requests!";
    }
    
    if (type === 'fees') {
      return "💰 **Document Fees:**\n• Form 137: ₱50\n• SF9/SF10: ₱30 each\n• Form 138: ₱30\n• Diploma Copy: ₱100\n\nAll fees include processing and basic handling. Rush processing available for additional fee!";
    }
  }
  
  // Context-aware fallback responses
  const pageContext = userContext.pageContext || '';
  
  if (pageContext.includes('enrollment')) {
    return "🎓 I see you're on the enrollment page! I can help guide you through the enrollment process for Eastern La Trinidad National High School. What specific information do you need about enrollment?";
  }
  
  if (pageContext.includes('form137')) {
    return "📄 You're requesting a Form 137! This is your official academic transcript. I can help clarify the requirements or explain our AI auto-fill feature. What would you like to know?";
  }
  
  if (pageContext.includes('admin')) {
    return "👨‍💼 I see you're in the admin area! I can help explain administrative features or answer questions about document processing and management. How can I assist?";
  }
  
  // Intelligent fallback responses
  const fallbackResponses = [
    "🤖 That's an interesting question! While I specialize in Eastern La Trinidad National High School services, I'm always learning. Could you tell me more about what you're looking for?",
    "💭 I'm not entirely sure about that specific topic, but I'd love to help! Are you looking for information about our document services, enrollment, or something else school-related?",
    "🔍 Let me think... I might need a bit more context to give you the best answer. Are you asking about our school services, or is this a general question I can try to help with?",
    "✨ That's a great question! I'm designed to help with Eastern La Trinidad National High School services, but I can also chat about various topics. What specifically would you like to know more about?"
  ];
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

// Enhanced conversation context tracking
const updateConversationContext = (conversationHistory, newMessage) => {
  const recentMessages = conversationHistory.slice(-5);
  const topics = new Set();
  
  recentMessages.forEach(msg => {
    const intent = classifyIntent(msg.message);
    if (intent.confidence >= 0.7) {
      topics.add(`${intent.category}-${intent.type}`);
    }
  });
  
  return {
    recentTopics: Array.from(topics),
    messageCount: conversationHistory.length,
    lastMessage: conversationHistory[conversationHistory.length - 1]
  };
};

module.exports = {
  classifyIntent,
  generateResponse,
  updateConversationContext,
  responseTemplates
};
