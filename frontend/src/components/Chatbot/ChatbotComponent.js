import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  Tooltip,
  Fade,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Lightbulb as SuggestionIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { chatbotService, fallbackResponses, chatbotUtils } from '../../services/chatbotService';

const ChatbotComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Initialize chatbot
  useEffect(() => {
    initializeChatbot();
    loadConversationHistory();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Update suggestions based on current page
  useEffect(() => {
    const contextualSuggestions = chatbotUtils.getContextualSuggestions(location.pathname);
    setSuggestions(contextualSuggestions);
  }, [location.pathname]);

  const initializeChatbot = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: isAuthenticated 
        ? `Hello ${user?.firstName || 'there'}! 👋 I'm DocuBot, your AI assistant for Eastern La Trinidad National High School. I can help you with document requests, answer questions, or just have a friendly chat! What can I do for you today?`
        : "Hello! 👋 I'm DocuBot, your AI assistant. I can help you with information about our school and document services. Please log in for personalized assistance with your requests!",
      isBot: true,
      timestamp: new Date().toISOString(),
      intent: 'greeting'
    };
    setMessages([welcomeMessage]);
  };

  const loadConversationHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      const history = await chatbotService.getConversationHistory();
      if (history.messages && history.messages.length > 0) {
        const formattedMessages = history.messages.map((msg, index) => ({
          id: Date.now() + index,
          text: msg.message,
          isBot: msg.isBot,
          timestamp: msg.timestamp,
          intent: msg.intent || 'unknown'
        }));
        setMessages(prev => [...prev, ...formattedMessages]);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  const sendMessage = async (messageText = input.trim()) => {
    if (!messageText || isLoading) return;

    setError(null);
    setInput('');
    setShowSuggestions(false);

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Check if authentication is required
    if (!isAuthenticated && chatbotUtils.requiresAuth(messageText)) {
      const authMessage = {
        id: Date.now() + 1,
        text: "To access your personal information and request status, please log in to your account first! I can still help with general questions about our document services. 🔐",
        isBot: true,
        timestamp: new Date().toISOString(),
        intent: 'auth_required'
      };
      setMessages(prev => [...prev, authMessage]);
      return;
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send to backend AI service
      const response = await chatbotService.sendMessage(messageText, location.pathname);
      
      // Simulate typing delay based on response length
      const typingDelay = chatbotUtils.getTypingDelay(response.response);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 2,
          text: chatbotUtils.formatResponse(response.response),
          isBot: true,
          timestamp: response.timestamp,
          intent: response.intent
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        setIsLoading(false);
      }, typingDelay);

    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      setIsLoading(false);
      
      // Show fallback response
      const fallbackMessage = {
        id: Date.now() + 3,
        text: fallbackResponses.error,
        isBot: true,
        timestamp: new Date().toISOString(),
        intent: 'error'
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setError('Unable to connect to AI service. Using fallback responses.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = async () => {
    try {
      if (isAuthenticated) {
        await chatbotService.clearConversationHistory();
      }
      initializeChatbot();
      setShowSuggestions(true);
      setError(null);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
      setError('Failed to clear conversation history');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
      }}
    >
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="warning" 
          sx={{ mx: 2, mt: 1 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <ClearIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            user={user}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Fade in={isTyping}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <BotIcon fontSize="small" />
              </Avatar>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: '18px 18px 18px 4px',
                  maxWidth: '200px',
                }}
              >
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <CircularProgress size={6} />
                  <CircularProgress size={6} sx={{ animationDelay: '0.2s' }} />
                  <CircularProgress size={6} sx={{ animationDelay: '0.4s' }} />
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    DocuBot is typing...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Fade>
        )}

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && messages.length <= 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SuggestionIcon fontSize="small" />
              Try asking me:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  variant="outlined"
                  size="small"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          padding: '16px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#f8f9fa',
              },
            }}
          />
          <Tooltip title="Send message">
            <span>
              <IconButton
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                color="primary"
                size="large"
                sx={{
                  borderRadius: '50%',
                  backgroundColor: input.trim() ? 'primary.main' : 'grey.300',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: input.trim() ? 'primary.dark' : 'grey.400',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'grey.300',
                    color: 'grey.500',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Press Enter to send • Shift+Enter for new line
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Clear conversation">
              <IconButton size="small" onClick={clearConversation}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Restart chat">
              <IconButton size="small" onClick={initializeChatbot}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, user }) => {
  const isBot = message.isBot;
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isBot ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: 1,
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isBot ? 'primary.main' : 'secondary.main',
          fontSize: '14px',
          flexShrink: 0,
        }}
      >
        {isBot ? <BotIcon fontSize="small" /> : <UserIcon fontSize="small" />}
      </Avatar>
      
      <Paper
        sx={{
          p: 2,
          maxWidth: '75%',
          backgroundColor: isBot ? 'white' : 'primary.main',
          color: isBot ? 'text.primary' : 'white',
          borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
          wordBreak: 'break-word',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.4,
          }}
        >
          {message.text}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
            fontSize: '10px',
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {message.intent && message.intent !== 'unknown' && (
            <span style={{ marginLeft: '4px' }}>
              • {typeof message.intent === 'string' ? message.intent : message.intent.type || message.intent.category}
            </span>
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatbotComponent;
