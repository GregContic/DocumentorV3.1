import React, { useState } from 'react';
import { Fab, Dialog, DialogContent, DialogTitle, IconButton, Slide, Badge } from '@mui/material';
import { Chat, Close, SmartToy } from '@mui/icons-material';
import ChatbotComponent from './ChatbotComponent';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true); // Show initial notification

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      setHasNewMessage(false); // Remove notification when opened
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Badge
        color="error"
        variant="dot"
        invisible={!hasNewMessage}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          aria-label="chat"
          onClick={handleToggle}
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {open ? <Close /> : <SmartToy />}
        </Fab>
      </Badge>

      {/* Chat Dialog */}
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
          },
        }}
        BackdropProps={{
          invisible: true,
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SmartToy />
            <span>DocuBot Assistant</span>
          </div>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleToggle}
            aria-label="close"
            size="small"
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

export default FloatingChatbot;
