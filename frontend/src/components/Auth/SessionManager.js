import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const SessionManager = () => {
  const { isAuthenticated, logout, validateSession } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check session validity every minute
    const sessionCheck = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeToExpiry = payload.exp - currentTime;
          
          // Show warning 5 minutes before expiry
          if (timeToExpiry <= 300 && timeToExpiry > 0) {
            setWarningCountdown(Math.floor(timeToExpiry));
            setShowWarning(true);
          } else if (timeToExpiry <= 0) {
            setShowSessionExpired(true);
            logout();
          }
        } catch (error) {
          console.error('Error checking token:', error);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheck);
  }, [isAuthenticated, logout]);

  const handleExtendSession = () => {
    // Refresh the session by making a simple API call
    validateSession();
    setShowWarning(false);
    setWarningCountdown(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Session Warning Dialog */}
      <Dialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Session Expiring Soon</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your session will expire in {formatTime(warningCountdown)}. 
            Would you like to extend your session?
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(300 - warningCountdown) / 300 * 100}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => logout()} color="secondary">
            Logout Now
          </Button>
          <Button onClick={handleExtendSession} variant="contained">
            Extend Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Expired Notification */}
      <Snackbar
        open={showSessionExpired}
        autoHideDuration={6000}
        onClose={() => setShowSessionExpired(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="warning" 
          onClose={() => setShowSessionExpired(false)}
          sx={{ width: '100%' }}
        >
          Your session has expired. Please log in again to continue.
        </Alert>
      </Snackbar>
    </>
  );
};

export default SessionManager;
