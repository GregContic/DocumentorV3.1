class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    // Document-related queries
    if (this.containsKeywords(lowerCaseMessage, ['form 137', 'permanent record', 'transcript'])) {
      this.actionProvider.handleForm137Info();
    } else if (this.containsKeywords(lowerCaseMessage, ['sf9', 'report card', 'grades'])) {
      this.actionProvider.handleSF9Info();
    } else if (this.containsKeywords(lowerCaseMessage, ['sf10', 'learner profile', 'profile'])) {
      this.actionProvider.handleSF10Info();
    } else if (this.containsKeywords(lowerCaseMessage, ['form 138', '138'])) {
      this.actionProvider.handleForm138Info();
    } else if (this.containsKeywords(lowerCaseMessage, ['diploma', 'graduation'])) {
      this.actionProvider.handleDiplomaInfo();
    }
    
    // Process and status queries
    else if (this.containsKeywords(lowerCaseMessage, ['how long', 'processing time', 'when ready', 'how much time'])) {
      this.actionProvider.handleProcessingTime();
    } else if (this.containsKeywords(lowerCaseMessage, ['status', 'track', 'check', 'progress'])) {
      this.actionProvider.handleStatusInfo();
    } else if (this.containsKeywords(lowerCaseMessage, ['requirements', 'need', 'documents needed', 'what do i need'])) {
      this.actionProvider.handleRequirements();
    }
    
    // Payment and fees
    else if (this.containsKeywords(lowerCaseMessage, ['fee', 'cost', 'price', 'payment', 'how much'])) {
      this.actionProvider.handleFees();
    } else if (this.containsKeywords(lowerCaseMessage, ['pickup', 'collect', 'get document', 'office hours'])) {
      this.actionProvider.handlePickup();
    }
    
    // AI features
    else if (this.containsKeywords(lowerCaseMessage, ['ai', 'upload', 'scan', 'auto-fill', 'artificial intelligence', 'smart'])) {
      this.actionProvider.handleAIFeatures();
    } else if (this.containsKeywords(lowerCaseMessage, ['help', 'assistance', 'support'])) {
      this.actionProvider.handleHelp();
    }
    
    // Contact and location
    else if (this.containsKeywords(lowerCaseMessage, ['contact', 'phone', 'email', 'address', 'location'])) {
      this.actionProvider.handleContact();
    }
    
    // Greetings
    else if (this.containsKeywords(lowerCaseMessage, ['hello', 'hi', 'hey', 'good morning', 'good afternoon'])) {
      this.actionProvider.handleGreeting();
    }
    
    // Thank you
    else if (this.containsKeywords(lowerCaseMessage, ['thank', 'thanks', 'appreciate'])) {
      this.actionProvider.handleThanks();
    }
    
    // Default fallback
    else {
      this.actionProvider.handleDefault();
    }
  }

  containsKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }
}

export default MessageParser;
