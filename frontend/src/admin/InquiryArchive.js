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
  TextField,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { inquiryService } from '../services/api';

const InquiryArchive = () => {
  const [archivedInquiries, setArchivedInquiries] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchArchivedInquiries();
  }, []);  const fetchArchivedInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inquiryService.getArchivedInquiries();
      if (response && response.data) {
        setArchivedInquiries(response.data);
      } else {
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching archived inquiries:', error);
      setError(
        error.response?.data?.message || 
        'Failed to load archived inquiries. Please ensure the server is running and try again.'
      );
      setArchivedInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredInquiries = archivedInquiries.filter((inquiry) => {
    const studentName = inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (inquiry.message || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Archived Inquiries
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && archivedInquiries.length === 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No archived inquiries found.
          </Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search by student name or message"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Timeline</TableCell>
                  <TableCell>Resolution</TableCell>
                  <TableCell align="center">Replies</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInquiries
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((inquiry) => {
                    const studentName = inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : '';
                    const email = inquiry.user ? inquiry.user.email : '';
                    return (
                      <TableRow 
                        key={inquiry._id}
                        hover
                        onClick={() => setSelectedInquiry(inquiry)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{studentName}</TableCell>
                        <TableCell>{email}</TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography noWrap>{inquiry.message}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Created: {formatDate(inquiry.createdAt)}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Archived: {formatDate(inquiry.archivedAt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="caption" display="block">
                              Resolved on: {formatDate(inquiry.resolvedAt)}
                            </Typography>
                            {inquiry.resolvedBy && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                by {inquiry.resolvedBy}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${inquiry.replies?.length || 0} replies`}
                            size="small"
                            color="info"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInquiries.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          <Dialog
            open={Boolean(selectedInquiry)}
            onClose={() => setSelectedInquiry(null)}
            maxWidth="md"
            fullWidth
          >
            {selectedInquiry && (
              <>
                <DialogTitle>Archived Inquiry Details</DialogTitle>
                <DialogContent>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      From: {selectedInquiry.user ? `${selectedInquiry.user.firstName} ${selectedInquiry.user.lastName}` : ''}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email: {selectedInquiry.user ? selectedInquiry.user.email : ''}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Submitted: {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resolved: {new Date(selectedInquiry.resolvedAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                      {selectedInquiry.message}
                    </Typography>
                    {selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Response History
                        </Typography>
                        {selectedInquiry.replies.map((reply, index) => (
                          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2">
                              {reply.repliedBy} - {new Date(reply.date).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
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
        </>
      )}
    </Container>
  );
};

export default InquiryArchive;
