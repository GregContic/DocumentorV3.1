import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';

/**
 * Role-based dashboard router that redirects users to their appropriate dashboard
 */
const RoleBasedDashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();

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
            Loading Dashboard...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Redirecting you to your dashboard
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const getDashboardRoute = (userRole) => {
    console.log('RoleBasedDashboard - User role:', userRole);
    switch (userRole) {
      case 'super-admin':
        console.log('Redirecting to super admin dashboard');
        return '/admin/dashboard';
      case 'admin-document':
        console.log('Redirecting to document admin dashboard');
        return '/admin/documents';
      case 'admin-enrollment':
        console.log('Redirecting to enrollment admin dashboard');
        return '/admin/enrollments';
      case 'admin':
        console.log('Redirecting to legacy admin dashboard');
        return '/admin/dashboard'; // Legacy admin
      case 'user':
      default:
        console.log('Redirecting to user document request');
        return '/request-document'; // Regular users go to document request
    }
  };

  const redirectPath = getDashboardRoute(user?.role);
  console.log('RoleBasedDashboard - Final redirect path:', redirectPath);

  return <Navigate to={redirectPath} replace />;
};

export default RoleBasedDashboard;
