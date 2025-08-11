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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { documentService } from '../services/api';

const statusColors = {
  completed: 'success',
  approved: 'info',
  rejected: 'error',
  pending: 'warning',
};

const DocumentArchive = () => {
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    fetchArchivedRequests();
  }, []);

  const fetchArchivedRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.getArchivedRequests();
      if (response && response.data && response.data.data) {
        setArchivedRequests(response.data.data);
      } else {
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching archived requests:', error);
      setError(
        error.response?.data?.message || 
        'Failed to load archived requests. Please ensure the server is running and try again.'
      );
      setArchivedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreRequest = async (requestId) => {
    try {
      setRestoring(requestId);
      await documentService.restoreArchivedRequest(requestId);
      // Remove the restored request from the archived list
      setArchivedRequests(prev => prev.filter(req => req._id !== requestId));
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error restoring request:', error);
      setError('Failed to restore request. Please try again.');
    } finally {
      setRestoring(null);
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

  const filteredRequests = archivedRequests.filter((request) => {
    const studentName = request.user ? `${request.user.firstName} ${request.user.lastName}` : '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (request.documentType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (request.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Archived Document Requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && archivedRequests.length === 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No archived document requests found.
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
                label="Search by student name, document type, or purpose"
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
                  <TableCell>Document Type</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Timeline</TableCell>
                  <TableCell>Final Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((request) => {
                    const studentName = request.user ? `${request.user.firstName} ${request.user.lastName}` : '';
                    const email = request.user ? request.user.email : '';
                    return (
                      <TableRow 
                        key={request._id}
                        hover
                      >
                        <TableCell>{studentName}</TableCell>
                        <TableCell>{email}</TableCell>
                        <TableCell>{request.documentType}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography noWrap>{request.purpose}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Created: {formatDate(request.createdAt)}
                            </Typography>
                            {request.completedAt && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Completed: {formatDate(request.completedAt)}
                              </Typography>
                            )}
                            <Typography variant="caption" display="block" color="text.secondary">
                              Archived: {formatDate(request.archivedAt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={statusColors[request.status] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Restore to Active">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleRestoreRequest(request._id)}
                                disabled={restoring === request._id}
                              >
                                {restoring === request._id ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <RestoreIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
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
            count={filteredRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {/* Request Details Dialog */}
          <Dialog
            open={Boolean(selectedRequest)}
            onClose={() => setSelectedRequest(null)}
            maxWidth="md"
            fullWidth
          >
            {selectedRequest && (
              <>
                <DialogTitle>Archived Request Details</DialogTitle>
                <DialogContent>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Student Information:
                        </Typography>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedRequest.user ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}` : 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {selectedRequest.user ? selectedRequest.user.email : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Request Information:
                        </Typography>
                        <Typography variant="body2">
                          <strong>Document Type:</strong> {selectedRequest.documentType}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> <Chip label={selectedRequest.status} color={statusColors[selectedRequest.status]} size="small" />
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Purpose:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {selectedRequest.purpose}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Timeline:
                        </Typography>
                        <Typography variant="body2">
                          <strong>Created:</strong> {formatDate(selectedRequest.createdAt)}
                        </Typography>
                        {selectedRequest.completedAt && (
                          <Typography variant="body2">
                            <strong>Completed:</strong> {formatDate(selectedRequest.completedAt)}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>Archived:</strong> {formatDate(selectedRequest.archivedAt)}
                        </Typography>
                        {selectedRequest.archivedBy && (
                          <Typography variant="body2">
                            <strong>Archived by:</strong> {selectedRequest.archivedBy}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button 
                    onClick={() => handleRestoreRequest(selectedRequest._id)}
                    color="primary"
                    startIcon={<RestoreIcon />}
                    disabled={restoring === selectedRequest._id}
                  >
                    {restoring === selectedRequest._id ? 'Restoring...' : 'Restore'}
                  </Button>
                  <Button onClick={() => setSelectedRequest(null)}>Close</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default DocumentArchive;
