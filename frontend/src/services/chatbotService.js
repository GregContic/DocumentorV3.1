import api from './api';

// Chatbot service for API communication
export const chatbotService = {
  // Send message to chatbot API
  sendMessage: async (message, pageContext = null) => {
    try {
      const response = await api.post('/api/chatbot/message', {
        message: message.trim(),
        pageContext: pageContext || window.location.pathname
      });
      return response.data;
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Fallback response for network errors
      if (error.response?.status === 429) {
        return {
          response: "⏰ Whoa there! You're sending messages a bit too quickly. Please wait a moment before sending another message.",
          intent: 'rate_limit',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        response: "I apologize, but I'm having trouble connecting right now. Please try again in a moment! 🤖",
        intent: 'error',
        timestamp: new Date().toISOString()
      };
    }
  },

  // Get conversation history
  getConversationHistory: async () => {
    try {
      const response = await api.get('/api/chatbot/conversation-history');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return { messages: [], count: 0 };
    }
  },

  // Clear conversation history
  clearConversationHistory: async () => {
    try {
      const response = await api.delete('/api/chatbot/conversation-history');
      return response.data;
    } catch (error) {
      console.error('Error clearing conversation history:', error);
      throw error;
    }
  }
};

// Local fallback responses when API is unavailable
export const fallbackResponses = {
  greeting: "Hello! 👋 I'm DocuBot, your AI assistant for Eastern La Trinidad National High School. While I'm having trouble connecting to my main brain, I can still help with basic information about our document services!",
  
  help: `🤖 **I can help you with:**
  
🏫 **Document Requests:**
• Form 137 (₱50) - Your official transcript
• SF9/SF10 (₱30) - Report cards and learner profile  
• Form 138 (₱30) - Academic records
• Diploma Copy (₱100) - Graduation certificate

⏱️ **Processing Times:** 2-7 business days depending on document type
📍 **Pickup:** School registrar's office, 8AM-5PM (Mon-Fri)

I'm currently experiencing connectivity issues, but you can still navigate through our system for document requests!`,

  default: "I'm having trouble accessing my full knowledge base right now, but I'm still here to help! 🤖 You can use the navigation menu to access document request forms, check your request status, or contact our office directly.",

  error: "Oops! I seem to be having technical difficulties. Please try refreshing the page or contact our registrar's office directly if you need immediate assistance. 🛠️"
};

// Utility functions for chatbot behavior
export const chatbotUtils = {
  // Detect if message needs authentication
  requiresAuth: (message) => {
    const authKeywords = ['status', 'track', 'my request', 'history', 'account'];
    return authKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  },

  // Get contextual suggestions based on current page
  getContextualSuggestions: (pathname) => {
    const suggestions = {
      '/': [
        "How do I request a document?",
        "What documents can I get?",
        "How much do documents cost?",
        "Tell me about enrollment"
      ],
      '/enrollment': [
        "What documents do I need for enrollment?",
        "How long does enrollment take?",
        "Can you help me fill out the form?",
        "What are the enrollment requirements?"
      ],
      '/request-form137': [
        "What is Form 137 used for?",
        "How long does Form 137 take?",
        "Can AI help fill my form?",
        "What fee do I need to pay?"
      ],
      '/my-requests': [
        "How do I track my request?",
        "When will my document be ready?",
        "Can I cancel a request?",
        "Where do I pick up my document?"
      ],
      '/inquiries': [
        "How do I submit an inquiry?",
        "What can I ask about?",
        "How long for a response?",
        "Can I attach files?"
      ]
    };

    return suggestions[pathname] || suggestions['/'];
  },

  // Format response with better readability
  formatResponse: (response) => {
    // Add line breaks and formatting
    return response
      .replace(/•/g, '\n•')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/📄|📋|👤|📊|🎓|⏰|📱|💰|📍|📞|🤖|😊|🌤️|🕐/g, (emoji) => `${emoji} `)
      .trim();
  },

  // Generate typing delay based on message length
  getTypingDelay: (message) => {
    const baseDelay = 500; // Base delay in ms
    const charDelay = 10; // Additional delay per character
    const maxDelay = 2000; // Maximum delay
    
    return Math.min(baseDelay + (message.length * charDelay), maxDelay);
  }
};

export default chatbotService;
