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
  TablePagination,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import { AdminPanelSettings as AdminIcon, Block as BlockIcon } from '@mui/icons-material';
import { inquiryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InquiryForm from './InquiryForm';

const statusColors = {
  pending: 'warning',
  inProgress: 'info',
  resolved: 'success',
  rejected: 'error',
  closed: 'default',
};

const UserInquiriesDashboard = () => {
  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const { user, isAdmin } = useAuth();

  // Always call hooks first before any conditional returns
  useEffect(() => {
    // Only fetch inquiries if user is not an admin
    if (!isAdmin) {
      fetchInquiries();
    }
  }, [isAdmin]);

  const fetchInquiries = async () => {
    try {
      const response = await inquiryService.getMyInquiries();
      setInquiries(response.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
  };

  // Check if current user is admin - render restriction message
  if (isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="info" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 4,
            borderRadius: 2,
            boxShadow: 2
          }}
          icon={<AdminIcon sx={{ fontSize: 40 }} />}
        >
          <AlertTitle sx={{ fontSize: '1.5rem', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BlockIcon />
              Admin Access Restricted
            </Box>
          </AlertTitle>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Admins are not allowed to submit or view personal inquiries through this interface.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As an administrator, please use the <strong>Admin Dashboard</strong> to manage all user inquiries, 
            view system-wide inquiry statistics, and respond to user questions.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              href="/admin/dashboard"
              startIcon={<AdminIcon />}
              size="large"
            >
              Go to Admin Dashboard
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  // Main component render for regular users
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Inquiries
      </Typography>

      {/* Inquiry Form */}
      <InquiryForm />

      {/* Inquiries Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Message</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inquiries
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((inquiry) => (
                <TableRow key={inquiry._id}>
                  <TableCell>{inquiry.message}</TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={inquiry.status}
                      color={statusColors[inquiry.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewInquiry(inquiry)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={inquiries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* View Inquiry Dialog */}
      <Dialog
        open={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedInquiry && (
          <>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Submitted on: {new Date(selectedInquiry.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedInquiry.message}
                </Typography>
                
                {/* Status Display */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status:
                  </Typography>
                  <Chip 
                    label={selectedInquiry.status || 'pending'} 
                    color={statusColors[selectedInquiry.status] || 'default'} 
                    size="small" 
                  />
                </Box>

                {/* Rejection Reason */}
                {selectedInquiry.status === 'rejected' && selectedInquiry.rejectionReason && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Inquiry Rejected
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reason:</strong> {selectedInquiry.rejectionReason}
                    </Typography>
                    {selectedInquiry.reviewedAt && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Reviewed on {new Date(selectedInquiry.reviewedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Alert>
                )}

                {selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Responses
                    </Typography>
                    {selectedInquiry.replies.map((reply, index) => (
                      <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Admin Response - {new Date(reply.date).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          {reply.message}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedInquiry(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default UserInquiriesDashboard;
