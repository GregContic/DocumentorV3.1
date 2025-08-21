import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Box,
  Chip,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { 
  QrCodeScanner as QrIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Assignment as Form137Icon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Description as DocumentIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { Link as RouterLink } from 'react-router-dom';
import { documentService } from '../services/api';
import QRVerificationDialog from '../components/QRVerificationDialog';
import QRPickupScanner from '../components/QRPickupScanner';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'info',
};

const DocumentAdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrVerificationOpen, setQrVerificationOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });

  // Add new state variables for pickup scheduling
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [pickupDateTime, setPickupDateTime] = useState(new Date());
  const [pickupTimeSlot, setPickupTimeSlot] = useState('');
  const [requestToApprove, setRequestToApprove] = useState(null);
  
  // QR Scanner state
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // Add pickup time slots
  const timeSlots = [
    { value: '08:00-09:00', label: '8:00 AM - 9:00 AM' },
    { value: '09:00-10:00', label: '9:00 AM - 10:00 AM' },
    { value: '10:00-11:00', label: '10:00 AM - 11:00 AM' },
    { value: '11:00-12:00', label: '11:00 AM - 12:00 PM' },
    { value: '13:00-14:00', label: '1:00 PM - 2:00 PM' },
    { value: '14:00-15:00', label: '2:00 PM - 3:00 PM' },
    { value: '15:00-16:00', label: '3:00 PM - 4:00 PM' },
    { value: '16:00-17:00', label: '4:00 PM - 5:00 PM' },
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.getAllRequests();
      setRequests(response.data);
      
      // Calculate stats
      const newStats = {
        total: response.data.length,
        pending: response.data.filter(r => r.status === 'pending').length,
        approved: response.data.filter(r => r.status === 'approved').length,
        rejected: response.data.filter(r => r.status === 'rejected').length,
        completed: response.data.filter(r => r.status === 'completed').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching requests:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load requests. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (requestId, newStatus) => {
    if (newStatus === 'rejected') {
      setSelectedRequest(requests.find(req => req._id === requestId));
      setRejectDialogOpen(true);
      return;
    }
    
    if (newStatus === 'approved') {
      setRequestToApprove(requests.find(req => req._id === requestId));
      setApproveDialogOpen(true);
      return;
    }
    
    try {
      const response = await documentService.updateRequestStatus(requestId, { status: newStatus });
      
      if (newStatus === 'completed') {
        setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));
        setSuccessMessage('Document request completed and moved to archive successfully!');
        setShowSuccessMessage(true);
      } else {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      setError('Failed to update request status. Please try again.');
      fetchRequests();
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }

    setUpdating(true);
    try {
      await documentService.updateRequestStatus(selectedRequest._id, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      
      setSuccessMessage('Request rejected successfully');
      setShowSuccessMessage(true);
      fetchRequests();
      handleCloseRejectDialog();
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleOpenQrDialog = (request) => {
    setSelectedRequest(request);
    setQrVerificationOpen(true);
  };

  const handleCloseQrDialog = () => {
    setQrVerificationOpen(false);
    setSelectedRequest(null);
  };

  const handleViewDetails = (request) => {
    setRequestDetails(request);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setRequestDetails(null);
  };

  // Add new handler for approving with pickup schedule
  const handleApproveWithSchedule = async () => {
    console.log('handleApproveWithSchedule called');
    console.log('pickupDateTime:', pickupDateTime);
    console.log('pickupTimeSlot:', pickupTimeSlot);
    console.log('requestToApprove:', requestToApprove);

    if (!pickupDateTime || !pickupTimeSlot) {
      console.log('Validation failed: missing pickup details');
      setError('Please select both pickup date and time slot.');
      return;
    }

    if (!requestToApprove) {
      console.log('Validation failed: no request to approve');
      setError('No request selected for approval.');
      return;
    }

    setUpdating(true);
    setError(''); // Clear any previous errors
    
    try {
      console.log('Approving request with pickup schedule:', {
        requestId: requestToApprove._id,
        pickupDateTime: pickupDateTime.toISOString(),
        pickupTimeSlot: pickupTimeSlot
      });

      const response = await documentService.updateRequestStatus(requestToApprove._id, {
        status: 'approved',
        pickupDateTime: pickupDateTime.toISOString(),
        pickupTimeSlot: pickupTimeSlot,
        pickupInstructions: 'Please bring a valid ID and this pickup notification when collecting your document.'
      });
      
      console.log('Approval response:', response);
      
      setSuccessMessage('Request approved with pickup schedule set successfully!');
      setShowSuccessMessage(true);
      fetchRequests();
      handleCloseApproveDialog();
    } catch (error) {
      console.error('Error approving request:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to approve request. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Add handler to close approve dialog
  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setRequestToApprove(null);
    setPickupDateTime(new Date());
    setPickupTimeSlot('');
  };

  // Handle successful pickup completion
  const handlePickupComplete = (completedRequest) => {
    // Refresh the requests to show updated status
    fetchRequests();
    
    // Show success message
    setSuccessMessage(`Document pickup completed for ${completedRequest.studentName}`);
    setShowSuccessMessage(true);
    
    // Close the QR scanner
    setQrScannerOpen(false);
  };

  const formatFieldValue = (value) => {
    if (!value) return 'Not provided';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'string' && value.includes('T')) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    return value;
  };

  const filteredRequests = requests.filter((request) => {
    const studentName = request.user ? `${request.user.firstName} ${request.user.lastName}` : '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.documentType || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AdminLayout title="Document Management Dashboard">
      <Container maxWidth="xl">
        {/* Modern Header Card */}
        <Box sx={{ 
          mb: 4,
          p: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(33,150,243,0.05) 0%, rgba(103,58,183,0.05) 100%)',
            zIndex: 0
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="700" sx={{ 
              color: '#1f2937',
              background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Document Request Management
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#6b7280',
              fontWeight: 500,
              opacity: 0.9
            }}>
              Process and manage all document requests efficiently
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Total Requests"
              value={stats.total}
              icon={<DocumentIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Pending Review"
              value={stats.pending}
              icon={<AssignmentIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Approved"
              value={stats.approved}
              icon={<CheckIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Completed"
              value={stats.completed}
              icon={<ArchiveIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Rejected"
              value={stats.rejected}
              icon={<CancelIcon />}
              color="error"
            />
          </Grid>
        </Grid>

        {/* Enhanced Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<QrIcon />}
            onClick={() => setQrVerificationOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(33, 150, 243, 0.4)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Verify Document QR Code
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<QrIcon />}
            onClick={() => setQrScannerOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              color: 'white',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(76, 175, 80, 0.4)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            QR Pickup Scanner
          </Button>

          <Button
            component={RouterLink}
            to="/admin/document-archive"
            variant="outlined"
            size="large"
            startIcon={<ArchiveIcon />}
            sx={{
              borderColor: '#2196f3',
              color: '#2196f3',
              backgroundColor: 'white',
              borderWidth: 2,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: '#e3f2fd',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 6px -1px rgba(33, 150, 243, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            View Document Archive
          </Button>

          <Button
            component={RouterLink}
            to="/admin/inquiries"
            variant="outlined"
            size="large"
            startIcon={<Form137Icon />}
            sx={{
              borderColor: '#673ab7',
              color: '#673ab7',
              backgroundColor: 'white',
              borderWidth: 2,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#512da8',
                backgroundColor: '#f3e5f5',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 6px -1px rgba(103, 58, 183, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Manage Inquiries
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)',
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 6,
            mb: 6 
          }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : (
          <>
            {/* Modern Filters */}
            <Paper sx={{ 
              p: 4, 
              mb: 4, 
              backgroundColor: '#ffffff',
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}>
              <Typography variant="h6" gutterBottom fontWeight="600" sx={{ color: '#1f2937', mb: 3 }}>
                Search & Filter Document Requests
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search by student name or document type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f9fafb',
                        '&:hover fieldset': {
                          borderColor: '#2196f3',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2196f3',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Filter by status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f9fafb',
                        '&.Mui-focused fieldset': {
                          borderColor: '#2196f3',
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Modern Requests Table */}
            <Paper sx={{ 
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Student Name
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Document Type
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Purpose
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Request Date
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Details
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((request) => {
                        const studentName = request.user ? `${request.user.firstName} ${request.user.lastName}` : '';
                        const email = request.user ? request.user.email : '';
                        
                        return (
                          <TableRow key={request._id} sx={{
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(33,150,243,0.05) 0%, rgba(103,58,183,0.05) 100%)',
                              transform: 'scale(1.005)',
                              transition: 'all 0.2s ease-in-out',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: 'rgba(248,250,252,0.3)',
                            },
                            transition: 'all 0.2s ease-in-out',
                            borderBottom: '1px solid rgba(229,231,235,0.3)'
                          }}>
                            <TableCell sx={{ 
                              py: 2.5, 
                              fontWeight: 600,
                              color: '#1f2937',
                              borderBottom: 'none'
                            }}>{studentName}</TableCell>
                            <TableCell sx={{ 
                              py: 2.5, 
                              color: '#6b7280',
                              borderBottom: 'none'
                            }}>{email}</TableCell>
                            <TableCell sx={{ 
                              py: 2.5, 
                              fontWeight: 500,
                              color: '#374151',
                              borderBottom: 'none'
                            }}>{request.documentType}</TableCell>
                            <TableCell sx={{ 
                              py: 2.5, 
                              color: '#6b7280',
                              borderBottom: 'none'
                            }}>{request.purpose}</TableCell>
                            <TableCell sx={{ 
                              py: 2.5, 
                              color: '#6b7280',
                              borderBottom: 'none'
                            }}>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}</TableCell>
                            <TableCell sx={{ py: 2.5, borderBottom: 'none' }}>
                              <Chip
                                label={request.status}
                                color={statusColors[request.status]}
                                size="small"
                                sx={{ 
                                  fontWeight: 700,
                                  borderRadius: 4,
                                  px: 1,
                                  textTransform: 'uppercase',
                                  fontSize: '0.75rem',
                                  letterSpacing: '0.5px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2.5, borderBottom: 'none' }}>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewDetails(request)}
                                sx={{ 
                                  minWidth: 'auto',
                                  px: 3,
                                  py: 1,
                                  borderRadius: 3,
                                  textTransform: 'none',
                                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.8rem',
                                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() => handleStatusChange(request._id, 'approved')}
                                      startIcon={<ScheduleIcon />}
                                      sx={{ 
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        fontWeight: 500,
                                        px: 2,
                                        py: 0.5,
                                      }}
                                    >
                                      Approve & Schedule
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      onClick={() => handleStatusChange(request._id, 'rejected')}
                                      sx={{ 
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        fontWeight: 500,
                                        px: 2,
                                        py: 0.5,
                                      }}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === 'approved' && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleStatusChange(request._id, 'completed')}
                                    sx={{ 
                                      textTransform: 'none',
                                      borderRadius: 2,
                                      fontWeight: 500,
                                      px: 2,
                                      py: 0.5,
                                    }}
                                  >
                                    Mark as Completed
                                  </Button>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                  onClick={() => handleOpenQrDialog(request)}
                                  startIcon={<QrIcon />}
                                  sx={{ 
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    fontWeight: 500,
                                    px: 2,
                                    py: 0.5,
                                  }}
                                >
                                  Verify QR
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredRequests.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </Paper>
          </>
        )}

        {/* QR Verification Dialog */}
        <QRVerificationDialog
          open={qrVerificationOpen}
          onClose={() => setQrVerificationOpen(false)}
        />

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={6000}
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSuccessMessage(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Request Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={handleCloseDetailDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#ffffff',
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: '#2196f3',
              color: 'white',
              py: 3,
              px: 4,
            }}
          >
            <Typography variant="h5" fontWeight="600">
              Complete Document Request Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {requestDetails ? (
              <Box sx={{ p: 4 }}>
                {/* Basic Request Information */}
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e5e7eb', 
                  borderRadius: 2,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}>
                  <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600, mb: 2 }}>
                    Request Overview
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Student Name
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {requestDetails.user?.firstName} {requestDetails.user?.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {requestDetails.user?.email}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Document Type
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {requestDetails.documentType}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Purpose
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {requestDetails.purpose}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Request Date
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {requestDetails.createdAt ? new Date(requestDetails.createdAt).toLocaleString() : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Status
                        </Typography>
                        <Chip
                          label={requestDetails.status}
                          color={statusColors[requestDetails.status]}
                          size="medium"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      {requestDetails.status === 'rejected' && requestDetails.rejectionReason && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Rejection Reason
                          </Typography>
                          <Typography variant="body1" fontWeight={500} sx={{ 
                            color: '#dc2626',
                            backgroundColor: '#fef2f2',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid #fecaca'
                          }}>
                            {requestDetails.rejectionReason}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Request ID
                        </Typography>
                        <Chip
                          label={requestDetails._id}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Student Information */}
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: '#fef3e2',
                  border: '1px solid #fed7aa', 
                  borderRadius: 2,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}>
                  <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600, mb: 2 }}>
                    Student Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>Surname</Typography>
                      <Typography variant="body1" fontWeight={500}>{formatFieldValue(requestDetails.surname)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>Given Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{formatFieldValue(requestDetails.givenName)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>Date of Birth</Typography>
                      <Typography variant="body1" fontWeight={500}>{formatFieldValue(requestDetails.dateOfBirth)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>Sex</Typography>
                      <Typography variant="body1" fontWeight={500}>{formatFieldValue(requestDetails.sex)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No details available for this request.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e5e7eb',
          }}>
            <Button 
              onClick={handleCloseDetailDialog} 
              variant="contained"
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: '#2196f3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1976d2',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 6px -1px rgba(33, 150, 243, 0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={handleCloseRejectDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
              color: 'white',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Reject Document Request
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please provide a reason for rejecting this document request:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Button 
              onClick={handleCloseRejectDialog}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRejectRequest}
              variant="contained"
              disabled={updating || !rejectionReason.trim()}
              sx={{ 
                ml: 2,
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {updating ? <CircularProgress size={20} color="inherit" /> : 'Reject Request'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Approval Dialog with Pickup Scheduling */}
        <Dialog 
          open={approveDialogOpen} 
          onClose={handleCloseApproveDialog}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <ScheduleIcon sx={{ fontSize: 28 }} />
              <Typography variant="h5" component="div">
                Schedule Document Pickup
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', opacity: 0.9 }}>
              Select a pickup date and time for the approved Form 137 request
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Date and Time Picker */}
              <DateTimePicker
                label="Pickup Date & Time"
                value={pickupDateTime}
                onChange={(newValue) => setPickupDateTime(newValue)}
                minDateTime={dayjs().add(1, 'day')}
                maxDateTime={dayjs().add(30, 'day')}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                    },
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              />

              {/* Time Slot Selection */}
              <Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Or choose a preferred time slot:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {timeSlots.map((slot) => (
                    <Chip
                      key={slot.value}
                      label={slot.label}
                      clickable
                      variant={pickupTimeSlot === slot.value ? "filled" : "outlined"}
                      onClick={() => setPickupTimeSlot(slot.value)}
                      sx={{
                        color: pickupTimeSlot === slot.value ? 'white' : 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: pickupTimeSlot === slot.value ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Button 
              onClick={handleCloseApproveDialog}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveWithSchedule}
              variant="contained"
              disabled={updating || !pickupDateTime || !pickupTimeSlot}
              startIcon={<CheckCircleIcon />}
              sx={{ 
                ml: 2,
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {updating ? <CircularProgress size={20} color="inherit" /> : 'Approve & Schedule'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Pickup Scanner Dialog */}
        <QRPickupScanner
          open={qrScannerOpen}
          onClose={() => setQrScannerOpen(false)}
          onPickupComplete={handlePickupComplete}
        />
      </Container>
    </AdminLayout>
    </LocalizationProvider>
  );
};

export default DocumentAdminDashboard;
