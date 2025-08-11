import { createChatBotMessage } from 'react-chatbot-kit';
import Avatar from './Avatar';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';

const config = {  initialMessages: [
    createChatBotMessage(
      `Hello! I'm your AI assistant for the Eastern La Trinidad National High School Document Request System. I can help you with:

• Document request guidance (Form 137, SF9, SF10, etc.)
• Application status tracking
• Upload assistance and AI document processing
• General inquiries about our services

How can I assist you today?`
    ),
  ],
  botName: 'DocuBot',
  customStyles: {
    botMessageBox: {
      backgroundColor: '#1976d2',
    },
    chatButton: {
      backgroundColor: '#1976d2',
    },
  },
  customComponents: {
    header: () => (
      <div style={{
        backgroundColor: '#1976d2',
        padding: '10px',
        borderRadius: '3px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Avatar />
        DocuBot - Your Document Assistant
      </div>
    ),
    botAvatar: (props) => <Avatar {...props} />,
  },
  state: {
    userData: {},
    documentTypes: [
      'Form 137 (Student Permanent Record)',
      'SF9 (Student Report Card)',
      'SF10 (Student Learner\'s Profile)',
      'Form 138 (Report Card)',
      'Diploma Copy'
    ],
    faqData: {
      processing_time: "Document processing typically takes 3-5 business days. You'll receive an email notification when your document is ready for pickup or delivery.",
      requirements: "For most document requests, you'll need: Valid ID, completed request form, and applicable fees. Specific requirements may vary by document type.",
      fees: "Document fees vary by type: Form 137 - ₱50, SF9/SF10 - ₱30, Diploma Copy - ₱100. Payment can be made during pickup or via our online payment system.",
      pickup: "Documents can be picked up at the school registrar's office during business hours (8:00 AM - 5:00 PM, Monday-Friday). You can also request delivery for an additional fee.",
      status: "You can track your document request status using your tracking number in the 'My Requests' section after logging in.",
      ai_features: "Our AI system can help extract information from your old documents to auto-fill forms. Simply upload a clear photo or scan, and our AI will process it for you."
    }
  },
  widgets: []
};

export default config;
