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
import { form137StubService } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const Form137StubDashboard = () => {
  const [stubs, setStubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStub, setSelectedStub] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newStatus, setNewStatus] = useState('');
  const [registrarNotes, setRegistrarNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusColors = {
    'stub-generated': 'default',
    'submitted-to-registrar': 'info',
    'verified-by-registrar': 'warning',
    'processing': 'primary',
    'ready-for-pickup': 'success',
    'completed': 'success',
    'cancelled': 'error'
  };

  const statusLabels = {
    'stub-generated': 'Stub Generated',
    'submitted-to-registrar': 'Submitted to Registrar',
    'verified-by-registrar': 'Verified by Registrar',
    'processing': 'Processing',
    'ready-for-pickup': 'Ready for Pickup',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };

  useEffect(() => {
    fetchStubs();
  }, [statusFilter, searchTerm]);

  const fetchStubs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await form137StubService.getAllStubs(params);
      setStubs(response.data.data);
    } catch (error) {
      console.error('Error fetching stubs:', error);
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

  const handleStatusUpdate = async () => {
    if (!selectedStub || !newStatus) return;

    try {
      setSubmitting(true);
      await form137StubService.updateStubStatus(selectedStub._id, {
        status: newStatus,
        registrarNotes
      });
      
      setStatusDialogOpen(false);
      fetchStubs(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      'stub-generated': ['submitted-to-registrar', 'cancelled'],
      'submitted-to-registrar': ['verified-by-registrar', 'cancelled'],
      'verified-by-registrar': ['processing', 'cancelled'],
      'processing': ['ready-for-pickup', 'cancelled'],
      'ready-for-pickup': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    return statusFlow[currentStatus] || [];
  };

  return (
    <AdminLayout title="Form 137 Stub Management">
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Form 137 Stub Management
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStubs}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

        {/* Filters */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search by stub code, name, or LRN"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchStubs}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        {/* Statistics Cards */}
        <Grid container spacing={2} mb={3}>
          {Object.entries(statusLabels).map(([status, label]) => {
            const count = stubs.filter(stub => stub.status === status).length;
            return (
              <Grid item xs={6} md={3} key={status}>
                <Card variant="outlined" sx={{ textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stub Code</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>LRN</TableCell>
                  <TableCell>Receiving School</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Generated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stubs.map((stub) => (
                  <TableRow key={stub._id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {stub.stubCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {stub.firstName} {stub.middleName} {stub.surname}
                    </TableCell>
                    <TableCell>{stub.learnerReferenceNumber}</TableCell>
                    <TableCell>{stub.receivingSchool}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[stub.status]}
                        color={statusColors[stub.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(stub.createdAt)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewStub(stub)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => handleEditStatus(stub)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {stubs.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No Form 137 stubs found matching your criteria.
          </Alert>
        )}

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Stub Details</DialogTitle>
          <DialogContent>
            {selectedStub && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Student Information</Typography>
                  <Typography><strong>Name:</strong> {selectedStub.firstName} {selectedStub.middleName} {selectedStub.surname}</Typography>
                  <Typography><strong>LRN:</strong> {selectedStub.learnerReferenceNumber}</Typography>
                  <Typography><strong>Date of Birth:</strong> {formatDate(selectedStub.dateOfBirth)}</Typography>
                  <Typography><strong>Sex:</strong> {selectedStub.sex}</Typography>
                  <Typography><strong>Address:</strong> {selectedStub.barangay}, {selectedStub.city}, {selectedStub.province}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Academic Information</Typography>
                  <Typography><strong>Last Grade:</strong> {selectedStub.lastGradeLevel}</Typography>
                  <Typography><strong>Last Year:</strong> {selectedStub.lastAttendedYear}</Typography>
                  <Typography><strong>Receiving School:</strong> {selectedStub.receivingSchool}</Typography>
                  <Typography><strong>Purpose:</strong> {selectedStub.purpose}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Parent/Guardian</Typography>
                  <Typography><strong>Name:</strong> {selectedStub.parentGuardianName}</Typography>
                  <Typography><strong>Address:</strong> {selectedStub.parentGuardianAddress}</Typography>
                  {selectedStub.parentGuardianContact && (
                    <Typography><strong>Contact:</strong> {selectedStub.parentGuardianContact}</Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Status Information</Typography>
                  <Typography><strong>Current Status:</strong> {statusLabels[selectedStub.status]}</Typography>
                  <Typography><strong>Generated:</strong> {formatDate(selectedStub.createdAt)}</Typography>
                  {selectedStub.submittedAt && (
                    <Typography><strong>Submitted:</strong> {formatDate(selectedStub.submittedAt)}</Typography>
                  )}
                  {selectedStub.verifiedAt && (
                    <Typography><strong>Verified:</strong> {formatDate(selectedStub.verifiedAt)}</Typography>
                  )}
                  {selectedStub.readyAt && (
                    <Typography><strong>Ready:</strong> {formatDate(selectedStub.readyAt)}</Typography>
                  )}
                  {selectedStub.completedAt && (
                    <Typography><strong>Completed:</strong> {formatDate(selectedStub.completedAt)}</Typography>
                  )}
                  {selectedStub.registrarNotes && (
                    <Typography><strong>Notes:</strong> {selectedStub.registrarNotes}</Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Stub Status</DialogTitle>
          <DialogContent>
            {selectedStub && (
              <Box sx={{ pt: 1 }}>
                <Typography gutterBottom>
                  <strong>Stub:</strong> {selectedStub.stubCode}
                </Typography>
                <Typography gutterBottom>
                  <strong>Student:</strong> {selectedStub.firstName} {selectedStub.surname}
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="New Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {getNextAvailableStatuses(selectedStub.status).map((status) => (
                      <MenuItem key={status} value={status}>
                        {statusLabels[status]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Registrar Notes (Optional)"
                  value={registrarNotes}
                  onChange={(e) => setRegistrarNotes(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Add any notes about this status update..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              disabled={!newStatus || submitting}
            >
              {submitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>
        </Paper>
      </Container>
    </AdminLayout>
  );
};

export default Form137StubDashboard;
