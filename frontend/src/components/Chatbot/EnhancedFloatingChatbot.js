import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Fab, Dialog, DialogContent, DialogTitle, IconButton, Slide, Badge, Tooltip } from '@mui/material';
import { Chat, Close, SmartToy, Help } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ChatbotComponent from './ChatbotComponent';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EnhancedFloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      setHasNewMessage(false);
    }
  };

  // Get contextual information based on current page
  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('form137')) return 'Form 137 Request';
    if (path.includes('sf9')) return 'SF9 Request';
    if (path.includes('sf10')) return 'SF10 Request';
    if (path.includes('form138')) return 'Form 138 Request';
    if (path.includes('diploma')) return 'Diploma Request';
    if (path.includes('my-requests')) return 'My Requests';
    if (path.includes('admin')) return 'Admin Dashboard';
    if (path === '/') return 'Home Page';
    return 'Document System';
  };

  // Get contextual tooltip message
  const getTooltipMessage = () => {
    const context = getPageContext();
    if (context.includes('Request')) {
      return `Need help with ${context}? Ask me anything!`;
    }
    return 'Hi! I\'m DocuBot, your document assistant. Click to chat!';
  };

  return (
    <>
      {/* Floating Action Button with Enhanced Tooltip */}
      <Tooltip 
        title={getTooltipMessage()}
        placement="left"
        arrow
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Badge
          color="error"
          variant="dot"
          invisible={!hasNewMessage}
        >            <Fab
              color="primary"
              aria-label="chat with DocuBot"
              onClick={handleToggle}
              sx={{
                backgroundColor: 'primary.main',
                boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'scale(1.1)',
                  boxShadow: '0 12px 24px rgba(25, 118, 210, 0.4)',
                },
                transition: 'all 0.3s ease',
                animation: hasNewMessage ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
                  },
                  '50%': {
                    boxShadow: '0 8px 16px rgba(25, 118, 210, 0.6), 0 0 0 4px rgba(25, 118, 210, 0.1)',
                  },
                  '100%': {
                    boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
                  },
                },
              }}
            >
            {open ? <Close /> : <SmartToy />}
          </Fab>
        </Badge>
      </Tooltip>

      {/* Enhanced Chat Dialog */}
      <Dialog
        open={open}
        onClose={handleToggle}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: 100,
            right: 24,
            margin: 0,
            width: '400px',
            maxWidth: '90vw',
            height: '600px',
            maxHeight: '80vh',
            borderRadius: '16px',
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
          },
        }}
        BackdropProps={{
          invisible: true,
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SmartToy />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>DocuBot Assistant</div>
              <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: 400 }}>
                {user ? `Hello ${user.firstName}! ` : ''}Currently on: {getPageContext()}
              </div>
            </div>
          </div>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleToggle}
            aria-label="close chat"
            size="small"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            padding: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChatbotComponent />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedFloatingChatbot;
