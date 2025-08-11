import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Paper,
  Button,
  Alert,
} from '@mui/material';
import { Lock, Home } from '@mui/icons-material';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show access denied message after loading is complete and user is not authorized
    if (!loading && (!isAuthenticated || (requireAdmin && user?.role !== 'admin'))) {
      const timer = setTimeout(() => setShowAccessDenied(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, requireAdmin, user]);

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we verify your access
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show access denied for admin routes when user is not admin
  if (requireAdmin && user?.role !== 'admin') {
    if (showAccessDenied) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <Lock sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You don't have permission to access this page. Administrator privileges are required.
            </Typography>
            <Alert severity="warning" sx={{ mb: 4 }}>
              If you believe you should have access to this page, please contact your system administrator.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => window.history.back()}
                size="large"
              >
                Go Back
              </Button>
              <Button
                variant="outlined"
                onClick={() => (window.location.href = '/')}
                size="large"
              >
                Home
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 