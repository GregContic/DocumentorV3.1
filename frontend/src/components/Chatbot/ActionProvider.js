class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  handleForm137Info = () => {
    const message = this.createChatBotMessage(
      `📄 **Form 137 (Student Permanent Record)**

This is your official academic transcript containing all your grades and academic history. Here's what you need to know:

• **Processing Time**: 3-5 business days
• **Fee**: ₱50 per copy
• **Requirements**: Valid ID, completed request form
• **Uses**: College enrollment, job applications, scholarship applications

Would you like me to guide you through the request process or explain our AI-powered form filling feature?`
    );
    this.addMessageToState(message);
  };

  handleSF9Info = () => {
    const message = this.createChatBotMessage(
      `📋 **SF9 (Student Report Card)**

Your quarterly grades and attendance record. Details:

• **Processing Time**: 2-3 business days
• **Fee**: ₱30 per copy
• **Requirements**: Valid ID, student number
• **Contents**: Grades per subject, attendance, teacher remarks

Our AI system can help you auto-fill the request form if you have an old SF9 document!`
    );
    this.addMessageToState(message);
  };

  handleSF10Info = () => {
    const message = this.createChatBotMessage(
      `👤 **SF10 (Student Learner's Profile)**

Your comprehensive learner profile including personal and academic information.

• **Processing Time**: 3-4 business days
• **Fee**: ₱30 per copy
• **Requirements**: Valid ID, parent/guardian consent (for minors)
• **Contents**: Personal info, academic performance, extracurricular activities

Need help with the request form? Our AI can extract information from your existing documents!`
    );
    this.addMessageToState(message);
  };

  handleForm138Info = () => {
    const message = this.createChatBotMessage(
      `📊 **Form 138 (Report Card)**

Official report of your academic performance per grading period.

• **Processing Time**: 2-3 business days
• **Fee**: ₱30 per copy
• **Requirements**: Valid ID, specify grading period/school year
• **Uses**: Transfer credentials, academic records

I can help you navigate the request process step by step!`
    );
    this.addMessageToState(message);
  };

  handleDiplomaInfo = () => {
    const message = this.createChatBotMessage(
      `🎓 **Diploma Copy**

Certified true copy of your graduation diploma.

• **Processing Time**: 5-7 business days
• **Fee**: ₱100 per copy
• **Requirements**: Valid ID, graduation verification
• **Special**: Includes security features and QR code verification

This is our most secure document with advanced anti-forgery features!`
    );
    this.addMessageToState(message);
  };

  handleProcessingTime = () => {
    const message = this.createChatBotMessage(
      `⏰ **Processing Times**

Here are our standard processing times:

• **Form 137**: 3-5 business days
• **SF9/SF10**: 2-3 business days  
• **Form 138**: 2-3 business days
• **Diploma Copy**: 5-7 business days

📱 You'll receive SMS and email notifications when your document is ready for pickup. Rush processing is available for urgent requests (additional fee applies).`
    );
    this.addMessageToState(message);
  };

  handleStatusInfo = () => {
    const message = this.createChatBotMessage(
      `📍 **Track Your Request Status**

To check your document status:

1. Log into your account
2. Go to "My Requests" section
3. Use your tracking number to view real-time status

**Status Types**:
• Submitted - Request received
• Processing - Being prepared
• Ready - Available for pickup
• Completed - Document collected

You can also scan the QR code on your receipt for quick status updates!`
    );
    this.addMessageToState(message);
  };

  handleRequirements = () => {
    const message = this.createChatBotMessage(
      `📋 **General Requirements**

For most document requests, you'll need:

**Always Required**:
• Valid government-issued ID
• Completed request form
• Processing fee

**Additional Requirements** (varies by document):
• Student number/reference number
• Graduation year (for diploma requests)
• Parent/guardian consent (for minors)
• Authorization letter (if requesting for someone else)

💡 **Tip**: Our AI system can help auto-fill forms from your existing documents!`
    );
    this.addMessageToState(message);
  };

  handleFees = () => {
    const message = this.createChatBotMessage(
      `💰 **Document Fees**

Current processing fees:

• **Form 137**: ₱50 per copy
• **SF9**: ₱30 per copy  
• **SF10**: ₱30 per copy
• **Form 138**: ₱30 per copy
• **Diploma Copy**: ₱100 per copy

**Payment Options**:
• Cash (upon pickup)
• GCash/PayMaya
• Bank transfer
• Online payment portal

Rush processing: +₱20 (1-2 business days)`
    );
    this.addMessageToState(message);
  };
  handlePickup = () => {
    const message = this.createChatBotMessage(
      `🏫 **Document Pickup Information**

**Registrar's Office Hours**:
• Monday - Friday: 8:00 AM - 5:00 PM
• Saturday: 8:00 AM - 12:00 PM
• Closed on Sundays and holidays

**Pickup Requirements**:
• Valid ID (original copy)
• Official receipt/tracking number
• Authorization letter (if claiming for someone else)

**Alternative Options**:
• Delivery service available (₱50 within municipality)
• Digital copies via secure email (select documents)

📍 **Address**: Eastern La Trinidad National High School, Registrar's Office`
    );
    this.addMessageToState(message);
  };

  handleAIFeatures = () => {
    const message = this.createChatBotMessage(
      `🤖 **AI-Powered Features**

Our advanced AI system offers:

**Smart Document Processing**:
• Upload photos of old documents
• AI extracts and fills form fields automatically
• OCR technology for text recognition
• Confidence scoring for accuracy

**How to Use**:
1. Click "Upload Document" on any request form
2. Take a clear photo or upload scan
3. AI processes and suggests field values
4. Review and confirm before submitting

**Benefits**:
• Saves time and reduces errors
• Works with low-quality images
• Supports multiple document formats
• 100% client-side processing (your data stays private)

Try it on your next document request!`
    );
    this.addMessageToState(message);
  };
  handleContact = () => {
    const message = this.createChatBotMessage(
      `📞 **Contact Information**

**Eastern La Trinidad National High School**

📍 **Address**: [School Address], La Trinidad, Benguet, Philippines
📞 **Phone**: (074) XXX-XXXX
📧 **Email**: registrar@eltnhs.edu.ph
🌐 **Website**: www.eltnhs.edu.ph

**Office Hours**:
• Monday - Friday: 8:00 AM - 5:00 PM
• Saturday: 8:00 AM - 12:00 PM

**Quick Actions**:
• Scan QR codes on our homepage for instant access
• Use our online chat support
• Follow us on social media for updates

How else can I assist you today?`
    );
    this.addMessageToState(message);
  };

  handleHelp = () => {
    const message = this.createChatBotMessage(
      `🆘 **How Can I Help You?**

I can assist you with:

**Document Services**:
• Form 137, SF9, SF10, Form 138, Diploma requests
• Requirements and processing times
• Fees and payment options

**System Features**:
• AI document processing
• QR code verification
• Status tracking
• Account management

**General Information**:
• Contact details and office hours
• Pickup and delivery options
• Frequently asked questions

Just ask me anything about our document request system! What specific information do you need?`
    );
    this.addMessageToState(message);
  };

  handleGreeting = () => {
    const greetings = [
      "Hello! Great to see you here! How can I help you with your document requests today?",
      "Hi there! Welcome to our document request system. What can I assist you with?",
      "Hey! I'm here to help you with all your document needs. What would you like to know?",
      "Good day! Ready to help you with forms, requirements, or any questions you have!"
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const message = this.createChatBotMessage(`👋 ${randomGreeting}`);
    this.addMessageToState(message);
  };

  handleThanks = () => {
    const responses = [
      "You're very welcome! Feel free to ask if you need anything else.",
      "Happy to help! Don't hesitate to reach out if you have more questions.",
      "My pleasure! I'm here whenever you need assistance with your documents.",
      "Glad I could help! Have a great day and good luck with your document request!"
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const message = this.createChatBotMessage(`😊 ${randomResponse}`);
    this.addMessageToState(message);
  };

  handleDefault = () => {
    const message = this.createChatBotMessage(
      `🤔 I'm not sure I understand that specific question, but I'm here to help! 

I can assist you with:
• **Document types**: Form 137, SF9, SF10, Form 138, Diploma
• **Process info**: Requirements, fees, processing times
• **System features**: AI processing, QR codes, status tracking
• **General info**: Contact details, pickup information

Could you please rephrase your question or ask about any of these topics? I'm here to make your document request process as smooth as possible! 🙂`
    );
    this.addMessageToState(message);
  };

  addMessageToState = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

export default ActionProvider;
