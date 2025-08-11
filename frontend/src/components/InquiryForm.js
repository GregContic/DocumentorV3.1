import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  AlertTitle,
} from '@mui/material';
import { 
  Send as SendIcon, 
  AdminPanelSettings as AdminIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { inquiryService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const InquiryForm = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, isAdmin } = useAuth();

  // Prevent admin access to inquiry form
  if (isAdmin) {
    return (
      <Paper sx={{ p: 4, mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Alert 
          severity="warning"
          icon={<AdminIcon sx={{ fontSize: 30 }} />}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 3
          }}
        >
          <AlertTitle sx={{ fontSize: '1.2rem', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BlockIcon />
              Admin Inquiry Submission Disabled
            </Box>
          </AlertTitle>
          <Typography variant="body1" sx={{ mb: 1 }}>
            As an administrator, you cannot submit personal inquiries through this form.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please use the admin dashboard to manage and respond to user inquiries instead.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              href="/admin/dashboard"
              startIcon={<AdminIcon />}
            >
              Admin Dashboard
            </Button>
          </Box>
        </Alert>
      </Paper>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await inquiryService.createInquiry({ message });
      setMessage('');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setErrorMessage('Failed to submit inquiry. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setShowSuccess(false);
    setShowError(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit an Inquiry
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !message.trim()}
            endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Submit Inquiry
          </Button>
        </Box>
      </form>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Inquiry submitted successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default InquiryForm;
