import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  AccountCircle as AccountCircleIcon,
  Schedule as ScheduleIcon,
  QrCode as QrCodeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { documentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Form137PDFWithQR from '../../components/PDFTemplates/Form137PDFWithQR';
import Form138PDFWithQR from '../../components/PDFTemplates/Form138PDFWithQR';
import SF9PDFWithQR from '../../components/PDFTemplates/SF9PDFWithQR';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to download pickup stub for approved requests
  const handleDownloadPickupStub = async (requestId) => {
    try {
      const response = await documentService.downloadPickupStub(requestId);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = `pickup_stub_${requestId.slice(-6)}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading pickup stub:', error);
      setError('Failed to download pickup stub. Please try again.');
    }
  };  // Function to render PDF download component based on document type
  const renderPDFDownload = (request) => {
    if (!request) return null;

    const fileName = `${request.documentType?.replace(/\s+/g, '_')}_${request._id?.slice(-6) || 'request'}.pdf`;
    
    switch (request.documentType) {
      case 'Form 137':
      case 'Form 137 / SF10':
      case 'School Form 10 (SF10) / Form 137':
        return (
          <Form137PDFWithQR
            formData={request}
            fileName={fileName}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ ml: 1 }}          >
            PDF
          </Form137PDFWithQR>
        );
      
      case 'Form 138':
      case 'Form 138 / SF9':
      case 'School Form 9 (SF9) / Form 138':
        return (
          <Form138PDFWithQR
            formData={request}
            fileName={fileName}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ ml: 1 }}          >
            PDF
          </Form138PDFWithQR>
        );
        case 'School Form 9':
        return (
          <SF9PDFWithQR
            formData={request}
            fileName={fileName}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ ml: 1 }}          >
            PDF
          </SF9PDFWithQR>
        );
      
      case 'School Form 10':
      case 'High School Diploma':
        return (
          <Button
            variant="outlined"
            size="small"
            color="primary"
            sx={{ ml: 1 }}
            startIcon={<DownloadIcon />}
            onClick={() => {
              // For now, show an alert. We'll implement these PDF templates later
              alert(`PDF download for ${request.documentType} is not yet available. This feature will be implemented soon.`);
            }}
          >
            PDF
          </Button>
        );
      
      default:
        return null;
    }
  };

  const fetchUserRequests = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
      try {
      // Fetch requests for the current authenticated user only
      // The backend should automatically filter by the authenticated user's token
      const response = await documentService.getMyRequests();
      
      if (response && response.data) {
        // Handle both old format (direct array) and new format (object with data property)
        const requestsData = response.data.data || response.data;
        const userRequests = Array.isArray(requestsData) ? requestsData : [];
        setRequests(userRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You can only view your own requests.');
      } else {
        setError('Failed to load your requests. Please try again.');
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, [user?.id]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
  };
  const handleRefresh = () => {
    fetchUserRequests();
  };

  // Additional security check: ensure request belongs to current user
  const validateRequestOwnership = (request) => {
    if (!user?.id) return false;
    // Check if the request belongs to the current user
    return request.user === user.id || request.userId === user.id;
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'pending':
      case 'submitted':
        return 'warning';
      case 'rejected':
      case 'denied':
        return 'error';
      case 'processing':
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>
          Try Again
        </Button>
      </Container>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Document Requests
        </Typography>
        <Button 
          variant="outlined" 
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Enrollment Status Quick Access */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/enrollment-status')}
          startIcon={<AccountCircleIcon />}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }}
        >
          Check My Enrollment Status
        </Button>
      </Box>

      {/* Show Approved Requests with Pickup Info */}
      {requests.filter(req => req.status === 'approved' && req.pickupSchedule).length > 0 && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'primary.main' }}>
            <CheckCircleIcon />
            Approved Requests - Ready for Pickup
          </Typography>
          <Grid container spacing={2}>
            {requests
              .filter(req => req.status === 'approved' && req.pickupSchedule)
              .map((request) => (
                <Grid item xs={12} md={6} key={request._id}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    borderRadius: 2, 
                    border: '1px solid #e0e0e0',
                    '&:hover': { boxShadow: 2 }
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {request.documentType} - #{request._id?.slice(-6)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {request.pickupSchedule.scheduledDateTime 
                          ? formatDate(request.pickupSchedule.scheduledDateTime)
                          : 'Date pending'
                        }
                      </Typography>
                    </Box>
                    {request.pickupSchedule.timeSlot && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Time: {request.pickupSchedule.timeSlot}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(request)}
                      >
                        Details
                      </Button>
                      {request.pickupSchedule && (request.pickupSchedule.stubPath || request.pickupSchedule.qrCode) && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleDownloadPickupStub(request._id)}
                          sx={{
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                            }
                          }}
                        >
                          Download Pickup Stub
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
          </Grid>
        </Paper>
      )}

      {requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Document Requests Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't submitted any document requests yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Request ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Document Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pickup Schedule</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Submitted Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>            <TableBody>
              {requests
                .filter(request => validateRequestOwnership(request)) // Additional security filter
                .map((request, index) => (
                <TableRow 
                  key={request._id || request.id || index}
                  sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    #{request._id?.slice(-6) || request.id || `REQ-${index + 1}`}
                  </TableCell>
                  <TableCell>{request.documentType || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status || 'Unknown'}
                      color={getStatusColor(request.status)}
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </TableCell>
                  <TableCell>
                    {request.status === 'approved' && request.pickupSchedule ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {request.pickupSchedule.scheduledDateTime 
                              ? formatDate(request.pickupSchedule.scheduledDateTime)
                              : 'Date not set'
                            }
                          </Typography>
                        </Box>
                        {request.pickupSchedule.timeSlot && (
                          <Typography variant="caption" color="text.secondary">
                            {request.pickupSchedule.timeSlot}
                          </Typography>
                        )}
                      </Box>
                    ) : request.status === 'approved' ? (
                      <Typography variant="body2" color="text.secondary">
                        Schedule pending
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not scheduled
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(request.submittedAt || request.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(request)}
                      >
                        View
                      </Button>
                      {request.status === 'approved' && request.pickupSchedule && (request.pickupSchedule.stubPath || request.pickupSchedule.qrCode) && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleDownloadPickupStub(request._id)}
                        >
                          Pickup Stub
                        </Button>
                      )}
                      {renderPDFDownload(request)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Request Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >        <DialogTitle>
          Request Details - #{selectedRequest?._id?.slice(-6) || selectedRequest?.id || 'N/A'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Document Type:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.documentType || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  label={selectedRequest.status || 'Unknown'}
                  color={getStatusColor(selectedRequest.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Rejection Reason */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rejection Reason:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#dc2626',
                    backgroundColor: '#fef2f2',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #fecaca',
                    mt: 1
                  }}>
                    {selectedRequest.rejectionReason}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Purpose:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.purpose || 'N/A'}
                </Typography>
              </Grid>

              {/* Student Information */}
              {(selectedRequest.surname || selectedRequest.givenName) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary.main">
                      Student Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name:
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.surname && selectedRequest.givenName 
                        ? `${selectedRequest.surname}, ${selectedRequest.givenName}`
                        : selectedRequest.studentName || 'N/A'
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Student Number:
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.studentNumber || 'N/A'}
                    </Typography>
                  </Grid>
                </>
              )}

              {/* Educational Information */}
              {(selectedRequest.currentSchool || selectedRequest.yearGraduated) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary.main">
                      Educational Information
                    </Typography>
                  </Grid>
                  {selectedRequest.currentSchool && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        School:
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.currentSchool}
                      </Typography>
                    </Grid>
                  )}
                  {selectedRequest.yearGraduated && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Year Graduated:
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.yearGraduated}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Pickup Schedule Information for Approved Requests */}
              {selectedRequest.status === 'approved' && selectedRequest.pickupSchedule && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon />
                      Pickup Schedule Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Scheduled Date:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {selectedRequest.pickupSchedule.scheduledDateTime 
                        ? formatDate(selectedRequest.pickupSchedule.scheduledDateTime)
                        : 'Not specified'
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Time Slot:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {selectedRequest.pickupSchedule.timeSlot || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pickup Instructions:
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: '#e3f2fd',
                      border: '1px solid #90caf9',
                      borderRadius: 2,
                      p: 2,
                      mt: 1
                    }}>
                      <Typography variant="body2" component="div">
                        <strong>📋 What to bring:</strong>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          <li>Valid ID (School ID or Government-issued ID)</li>
                          <li>Your printed pickup stub with QR code</li>
                          <li>Authorization letter (if someone else will pick up)</li>
                        </ul>
                        <strong>🕒 Pickup Location:</strong> Registrar's Office<br/>
                        <strong>💡 Note:</strong> Please arrive during your scheduled time slot to avoid delays.
                      </Typography>
                    </Box>
                  </Grid>
                  {selectedRequest.pickupSchedule && (selectedRequest.pickupSchedule.stubPath || selectedRequest.pickupSchedule.qrCode) && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        backgroundColor: '#f0f9ff',
                        border: '1px dashed #0ea5e9',
                        borderRadius: 2
                      }}>
                        <QrCodeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            Pickup Stub Available
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Download your pickup stub with QR code for verification at the registrar's office.
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadPickupStub(selectedRequest._id)}
                        >
                          Download Stub
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </>
              )}

              {/* Pickup Information */}
              {(selectedRequest.preferredPickupDate || selectedRequest.preferredPickupTime) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary.main">
                      Pickup Schedule
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Preferred Date:
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.preferredPickupDate 
                        ? formatDate(selectedRequest.preferredPickupDate)
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Preferred Time:
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.preferredPickupTime 
                        ? new Date(selectedRequest.preferredPickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>
                </>
              )}

              {/* Additional Notes */}
              {selectedRequest.additionalNotes && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Additional Notes:
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.additionalNotes}
                    </Typography>
                  </Grid>
                </>
              )}

              {/* Timestamps */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Request Timeline
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted:
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedRequest.submittedAt || selectedRequest.createdAt)}
                </Typography>
              </Grid>
              {selectedRequest.updatedAt && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedRequest.updatedAt)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>        <DialogActions>
          <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedRequest && selectedRequest.status === 'approved' && selectedRequest.pickupSchedule && (selectedRequest.pickupSchedule.stubPath || selectedRequest.pickupSchedule.qrCode) && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<QrCodeIcon />}
                  onClick={() => handleDownloadPickupStub(selectedRequest._id)}
                >
                  Download Pickup Stub
                </Button>
              )}
              {selectedRequest && renderPDFDownload(selectedRequest)}
            </Box>
            <Button onClick={handleCloseDialog}>Close</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyRequests; 