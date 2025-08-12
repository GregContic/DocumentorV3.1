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

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  allowedRoles = [], 
  requireSuperAdmin = false,
  requireEnrollmentAdmin = false,
  requireDocumentAdmin = false 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const location = useLocation();

  // Helper function to check if user has required permissions
  const hasRequiredPermissions = () => {
    if (!user) return false;

    // If specific admin type is required
    if (requireSuperAdmin) {
      return user.role === 'super-admin';
    }
    
    if (requireEnrollmentAdmin) {
      return ['admin-enrollment', 'super-admin'].includes(user.role);
    }
    
    if (requireDocumentAdmin) {
      return ['admin-document', 'super-admin'].includes(user.role);
    }

    // If specific roles are allowed
    if (allowedRoles.length > 0) {
      return allowedRoles.includes(user.role);
    }

    // Legacy admin check (backwards compatibility)
    if (requireAdmin) {
      return ['admin', 'super-admin', 'admin-enrollment', 'admin-document'].includes(user.role);
    }

    return true;
  };

  useEffect(() => {
    // Show access denied message after loading is complete and user is not authorized
    if (!loading && (!isAuthenticated || !hasRequiredPermissions())) {
      const timer = setTimeout(() => setShowAccessDenied(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, user]);

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

  // Show access denied for users without required permissions
  if (!hasRequiredPermissions()) {
    if (showAccessDenied) {
      const getRoleDisplayName = (role) => {
        switch (role) {
          case 'super-admin':
            return 'Super Administrator';
          case 'admin-document':
            return 'Document Administrator';
          case 'admin-enrollment':
            return 'Enrollment Administrator';
          case 'admin':
            return 'Administrator';
          case 'user':
            return 'User';
          default:
            return 'User';
        }
      };

      const getRequiredRoles = () => {
        if (requireSuperAdmin) return 'Super Administrator';
        if (requireEnrollmentAdmin) return 'Enrollment Administrator or Super Administrator';
        if (requireDocumentAdmin) return 'Document Administrator or Super Administrator';
        if (allowedRoles.length > 0) {
          return allowedRoles.map(role => getRoleDisplayName(role)).join(' or ');
        }
        if (requireAdmin) return 'Administrator';
        return 'Authorized User';
      };

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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              You don't have permission to access this page.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Your role: <strong>{getRoleDisplayName(user?.role)}</strong><br />
              Required role: <strong>{getRequiredRoles()}</strong>
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