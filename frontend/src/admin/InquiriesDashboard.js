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
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { inquiryService } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const InquiriesDashboard = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [inquiryToReject, setInquiryToReject] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryService.getAllInquiries();
      setInquiries(response.data || []);
    } catch (err) {
      setError('Failed to fetch inquiries');
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInquiry(null);
  };

  const handleRejectClick = (inquiry) => {
    setInquiryToReject(inquiry);
    setRejectionDialogOpen(true);
  };

  const handleRejectCancel = () => {
    setRejectionDialogOpen(false);
    setInquiryToReject(null);
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setUpdating(true);
    try {
      await inquiryService.updateInquiryStatus(inquiryToReject._id, { 
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      
      // Refresh the inquiries list
      await fetchInquiries();
      
      // Update the selected inquiry if it's still open
      if (selectedInquiry && selectedInquiry._id === inquiryToReject._id) {
        const updatedInquiry = inquiries.find(i => i._id === inquiryToReject._id);
        setSelectedInquiry(updatedInquiry);
      }
      
      // Close dialogs and reset state
      setRejectionDialogOpen(false);
      setInquiryToReject(null);
      setRejectionReason('');
    } catch (err) {
      setError('Failed to reject inquiry');
    }
    setUpdating(false);
  };

  const handleStatusUpdate = async (inquiryId, status) => {
    // If status is rejected, open the rejection dialog instead
    if (status === 'rejected') {
      const inquiry = inquiries.find(i => i._id === inquiryId) || selectedInquiry;
      handleRejectClick(inquiry);
      return;
    }

    setUpdating(true);
    try {
      await inquiryService.updateInquiryStatus(inquiryId, { status });
      await fetchInquiries();
      
      // Update the selected inquiry if it's still open
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        const updatedInquiry = inquiries.find(i => i._id === inquiryId);
        setSelectedInquiry(updatedInquiry);
      }
    } catch (err) {
      setError('Failed to update inquiry status');
    }
    setUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'replied': return 'info';
      case 'resolved': return 'success';
      case 'rejected': return 'error';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <AdminLayout title="Inquiries Dashboard">
      <Container maxWidth="xl">
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Student Inquiries Dashboard
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : inquiries.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No inquiries found.
            </Alert>
          ) : (
            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry._id}>
                      <TableCell>
                        {inquiry.firstName} {inquiry.lastName}
                      </TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell>{inquiry.subject}</TableCell>
                      <TableCell>
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={inquiry.status || 'pending'} 
                          color={getStatusColor(inquiry.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewDetails(inquiry)}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleStatusUpdate(inquiry._id, 'resolved')}
                            disabled={inquiry.status === 'resolved' || inquiry.status === 'rejected'}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<RejectIcon />}
                            onClick={() => handleStatusUpdate(inquiry._id, 'rejected')}
                            disabled={inquiry.status === 'resolved' || inquiry.status === 'rejected'}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Inquiry Details Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">
              Inquiry Details
            </Typography>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleCloseDialog}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {selectedInquiry && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Student Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedInquiry.user ? 
                          `${selectedInquiry.user.firstName} ${selectedInquiry.user.lastName}` : 
                          'Unknown User'
                        }
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedInquiry.user?.email || 'Not provided'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Inquiry Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Message</Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ 
                        bgcolor: 'grey.50', 
                        p: 2, 
                        borderRadius: 1, 
                        mt: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        {selectedInquiry.message}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Date Submitted</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedInquiry.createdAt).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Current Status</Typography>
                      <Chip 
                        label={selectedInquiry.status || 'pending'} 
                        color={getStatusColor(selectedInquiry.status || 'pending')} 
                        size="small" 
                      />
                    </Grid>
                    {selectedInquiry.reviewedAt && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Reviewed Date</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(selectedInquiry.reviewedAt).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {selectedInquiry.rejectionReason && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Rejection Reason</Typography>
                        <Typography variant="body1" fontWeight={500} color="error.main" 
                          sx={{ 
                            bgcolor: 'error.50', 
                            p: 2, 
                            borderRadius: 1, 
                            mt: 1,
                            border: '1px solid',
                            borderColor: 'error.200'
                          }}
                        >
                          {selectedInquiry.rejectionReason}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            {selectedInquiry && selectedInquiry.status !== 'resolved' && selectedInquiry.status !== 'rejected' && (
              <Box sx={{ display: 'flex', gap: 2, mr: 'auto' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => handleStatusUpdate(selectedInquiry._id, 'resolved')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Resolve'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => handleStatusUpdate(selectedInquiry._id, 'rejected')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Reject'}
                </Button>
              </Box>
            )}
            <Button onClick={handleCloseDialog} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rejection Reason Dialog */}
        <Dialog
          open={rejectionDialogOpen}
          onClose={handleRejectCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: 'error.main', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">
              Reject Inquiry
            </Typography>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleRejectCancel}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Please provide a reason for rejecting this inquiry:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              required
              sx={{ mt: 2 }}
            />
            {inquiryToReject && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Student: {inquiryToReject.user ? 
                    `${inquiryToReject.user.firstName} ${inquiryToReject.user.lastName}` : 
                    'Unknown User'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Message: {inquiryToReject.message.substring(0, 100)}...
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleRejectCancel} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleRejectConfirm} 
              variant="contained" 
              color="error"
              disabled={updating || !rejectionReason.trim()}
              startIcon={<RejectIcon />}
            >
              {updating ? 'Rejecting...' : 'Reject Inquiry'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default InquiriesDashboard;