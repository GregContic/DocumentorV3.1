import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// User Pages
import DocumentRequest from './components/DocumentDashboard';
import MyRequests from './pages/user/MyRequests';
import UserInquiriesDashboard from './components/UserInquiriesDashboard';
import UserForm137Dashboard from './user/UserForm137Dashboard';
import UserRequestHistoryDashboard from './user/UserRequestHistoryDashboard';
import Form137Request from './pages/user/Form137Request';
import Form138Request from './pages/user/Form138Request';
import GoodMoralRequest from './pages/user/GoodMoralRequest';
import Enrollment from './pages/user/Enrollment';
import EnrollmentStatus from './user/EnrollmentStatus';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Archive from './admin/Archive';
import EnrollmentDashboard from './admin/EnrollmentDashboard';
import Form137StubDashboard from './admin/Form137StubDashboard';
import AdminRequestDashboard from './admin/AdminRequestDashboard';
import InquiriesDashboard from './admin/InquiriesDashboard';
import Settings from './admin/Settings';

// Protected Route
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SessionManager from './components/Auth/SessionManager';

// Chatbot
import EnhancedFloatingChatbot from './components/Chatbot/EnhancedFloatingChatbot';

// Import our custom theme
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route
              path="/request-document"
              element={
                <ProtectedRoute>
                  <DocumentRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-form137"
              element={
                <ProtectedRoute>
                  <Form137Request />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-form138"
              element={
                <ProtectedRoute>
                  <Form138Request />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-good-moral"
              element={
                <ProtectedRoute>
                  <GoodMoralRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-sf9"
              element={
                <ProtectedRoute>
                  <Form138Request />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-sf10"
              element={
                <ProtectedRoute>
                  <Form137Request />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollment"
              element={
                <ProtectedRoute>
                  <Enrollment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollment-status"
              element={
                <ProtectedRoute>
                  <EnrollmentStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute>
                  <MyRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inquiries"
              element={
                <ProtectedRoute>
                  <UserInquiriesDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-form137-requests"
              element={
                <ProtectedRoute>
                  <UserRequestHistoryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests-history"
              element={
                <ProtectedRoute>
                  <UserRequestHistoryDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/archive"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Archive />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enrollments"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <EnrollmentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/form137-stubs"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminRequestDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminRequestDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <InquiriesDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Enhanced Floating Chatbot - Available on all pages */}
          <EnhancedFloatingChatbot />
          
          {/* Session Manager for authentication warnings */}
          <SessionManager />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;