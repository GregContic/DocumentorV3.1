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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { form138StubService } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const Form138StubDashboard = () => {
  const [stubs, setStubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStub, setSelectedStub] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newStatus, setNewStatus] = useState('');
  const [registrarNotes, setRegistrarNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusOptions = [
    { value: 'stub-generated', label: 'Stub Generated', color: 'info' },
    { value: 'submitted-to-registrar', label: 'Submitted to Registrar', color: 'warning' },
    { value: 'verified-by-registrar', label: 'Verified by Registrar', color: 'primary' },
    { value: 'processing', label: 'Processing', color: 'secondary' },
    { value: 'ready-for-pickup', label: 'Ready for Pickup', color: 'success' },
    { value: 'completed', label: 'Completed', color: 'default' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  useEffect(() => {
    fetchStubs();
  }, [statusFilter, searchTerm]);

  const fetchStubs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await form138StubService.getAllStubs(params);
      setStubs(response.data.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching Form 138 stubs:', error);
      setError('Failed to fetch Form 138 stubs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStub = (stub) => {
    setSelectedStub(stub);
    setViewDialogOpen(true);
  };

  const handleEditStatus = (stub) => {
    setSelectedStub(stub);
    setNewStatus(stub.status);
    setRegistrarNotes(stub.registrarNotes || '');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await form138StubService.updateStubStatus(selectedStub._id, {
        status: newStatus,
        registrarNotes
      });
      
      setSuccess('Form 138 stub status updated successfully');
      setStatusDialogOpen(false);
      fetchStubs();
    } catch (error) {
      console.error('Error updating Form 138 stub status:', error);
      setError('Failed to update Form 138 stub status');
    }
  };

  const getStatusChip = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return (
      <Chip
        label={statusOption?.label || status}
        color={statusOption?.color || 'default'}
        size="small"
      />
    );
  };

  const filteredStubs = stubs.filter(stub => {
    const matchesSearch = !searchTerm || 
      stub.stubCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stub.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stub.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stub.lrn && stub.lrn.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || stub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Form 138 (Report Card) Stub Management
            </Typography>
            <Box display="flex" gap={2}>
              <IconButton onClick={fetchStubs} color="primary">
                <Tooltip title="Refresh">
                  <RefreshIcon />
                </Tooltip>
              </IconButton>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by stub code, name, or LRN"
              sx={{ minWidth: 250 }}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} mb={3}>
            {statusOptions.map(option => {
              const count = stubs.filter(stub => stub.status === option.value).length;
              return (
                <Grid item xs={12} sm={6} md={3} key={option.value}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color={`${option.color}.main`}>
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Stubs Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stub Code</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>LRN</TableCell>
                  <TableCell>Grade Level</TableCell>
                  <TableCell>School Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredStubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No Form 138 stubs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStubs.map((stub) => (
                    <TableRow key={stub._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {stub.stubCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {stub.firstName} {stub.middleName} {stub.surname}
                      </TableCell>
                      <TableCell>{stub.lrn || 'N/A'}</TableCell>
                      <TableCell>{stub.gradeLevel}</TableCell>
                      <TableCell>{stub.schoolYear}</TableCell>
                      <TableCell>
                        {getStatusChip(stub.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(stub.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewStub(stub)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditStatus(stub)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* View Stub Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Form 138 Stub Details
          </DialogTitle>
          <DialogContent>
            {selectedStub && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Stub Code:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.stubCode}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {getStatusChip(selectedStub.status)}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Student Information</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Full Name:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedStub.firstName} {selectedStub.middleName} {selectedStub.surname}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">LRN:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.lrn || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Sex:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.sex}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date of Birth:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedStub.dateOfBirth ? new Date(selectedStub.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedStub.barangay}, {selectedStub.city}, {selectedStub.province}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Academic Information</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Grade Level:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.gradeLevel}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">School Year:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.schoolYear}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Section:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.section || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Adviser:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.adviser || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Purpose:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.purpose}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Number of Copies:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.numberOfCopies || '1'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Parent/Guardian Information</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Parent/Guardian Name:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.parentName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Contact:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.parentContact || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedStub.parentAddress}</Typography>
                </Grid>

                {selectedStub.registrarNotes && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Registrar Notes</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" gutterBottom>{selectedStub.registrarNotes}</Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Timestamps</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created:</Typography>
                  <Typography variant="body1" gutterBottom>{formatDate(selectedStub.createdAt)}</Typography>
                </Grid>
                {selectedStub.verifiedAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Verified:</Typography>
                    <Typography variant="body1" gutterBottom>{formatDate(selectedStub.verifiedAt)}</Typography>
                  </Grid>
                )}
                {selectedStub.readyAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Ready for Pickup:</Typography>
                    <Typography variant="body1" gutterBottom>{formatDate(selectedStub.readyAt)}</Typography>
                  </Grid>
                )}
                {selectedStub.completedAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Completed:</Typography>
                    <Typography variant="body1" gutterBottom>{formatDate(selectedStub.completedAt)}</Typography>
                  </Grid>
                )}

                {selectedStub.qrCode && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>QR Code</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="center">
                        <img src={selectedStub.qrCode} alt="QR Code" style={{ maxWidth: 200 }} />
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Form 138 Stub Status
          </DialogTitle>
          <DialogContent>
            {selectedStub && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Stub: {selectedStub.stubCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Student: {selectedStub.firstName} {selectedStub.surname}
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="New Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Registrar Notes (Optional)"
                  value={registrarNotes}
                  onChange={(e) => setRegistrarNotes(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Add any notes about this status update..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} variant="contained">Update Status</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default Form138StubDashboard;
