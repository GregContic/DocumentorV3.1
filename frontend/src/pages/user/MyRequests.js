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
  const navigate = useNavigate();  // Function to render PDF download component based on document type
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Purpose</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
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
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {request.purpose || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.status || 'Unknown'}
                      color={getStatusColor(request.status)}
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(request.submittedAt || request.createdAt)}
                  </TableCell>                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(request)}
                      >
                        View
                      </Button>
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
            <Box>
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