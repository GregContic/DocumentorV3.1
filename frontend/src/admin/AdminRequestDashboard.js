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
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Form137RequestLetterPDF from '../components/PDFTemplates/Form137RequestLetterPDF';
import Form138RequestLetterPDF from '../components/PDFTemplates/Form138RequestLetterPDF';
import AdminLayout from '../components/AdminLayout';

const AdminRequestDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // New status flow for Form 137 and Form 138 requests
  const statusLabels = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'ready': 'Ready for Pickup',
    'completed': 'Completed',
    'stub-generated': 'Pickup Stub Generated', // for Form 137 legacy
  };

  const statusColors = {
    'pending': 'info',
    'approved': 'primary',
    'rejected': 'error',
    'ready': 'success',
    'completed': 'success',
    'stub-generated': 'success',
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoints
      const mockRequests = [
        {
          id: 1,
          type: 'Form 137',
          requestId: 'FORM137-1704067200000',
          status: 'pending',
          submittedAt: '2024-01-01T10:00:00Z',
          studentName: 'John M. Doe',
          userId: '123',
          formData: {
            surname: 'Doe',
            firstName: 'John',
            middleName: 'M',
            sex: 'Male',
            dateOfBirth: '2005-01-01',
            barangay: 'Sample Barangay',
            city: 'Sample City',
            province: 'Sample Province',
            learnerReferenceNumber: '123456789012',
            lastGradeLevel: 'Grade 11',
            strand: 'STEM',
            lastAttendedYear: '2023-2024',
            receivingSchool: 'Sample University',
            receivingSchoolAddress: 'Sample Address',
            purpose: 'College Application',
            parentGuardianName: 'Jane Doe',
            parentGuardianAddress: 'Sample Address',
            parentGuardianContact: '09123456789'
          }
        },
        {
          id: 2,
          type: 'Form 138',
          requestId: 'FORM138-1704153600000',
          status: 'approved',
          submittedAt: '2024-01-02T10:00:00Z',
          studentName: 'Jane A. Smith',
          userId: '124',
          formData: {
            surname: 'Smith',
            firstName: 'Jane',
            middleName: 'A',
            sex: 'Female',
            dateOfBirth: '2005-03-15',
            placeOfBirth: 'Sample City',
            lrn: '123456789013',
            barangay: 'Another Barangay',
            city: 'Another City',
            province: 'Another Province',
            gradeLevel: 'Grade 12',
            strand: 'ABM',
            schoolYear: '2023-2024',
            section: 'Einstein',
            adviser: 'Ms. Smith',
            purpose: 'Scholarship Application',
            numberOfCopies: '2',
            parentName: 'Robert Smith',
            parentAddress: 'Another Address',
            parentContact: '09123456788',
            downloadUrl: '/mock-report-card.pdf',
            pickupDate: null
          }
        },
        {
          id: 3,
          type: 'Form 137',
          requestId: 'FORM137-1704240000000',
          status: 'approved',
          submittedAt: '2024-01-03T14:30:00Z',
          studentName: 'Michael B. Johnson',
          userId: '125',
          formData: {
            surname: 'Johnson',
            firstName: 'Michael',
            middleName: 'B',
            sex: 'Male',
            dateOfBirth: '2004-11-20',
            barangay: 'Central Barangay',
            city: 'Central City',
            province: 'Central Province',
            learnerReferenceNumber: '123456789014',
            lastGradeLevel: 'Grade 12',
            strand: 'HUMSS',
            lastAttendedYear: '2023-2024',
            receivingSchool: 'Central University',
            receivingSchoolAddress: 'Central Address',
            purpose: 'University Transfer',
            parentGuardianName: 'Sarah Johnson',
            parentGuardianAddress: 'Central Address',
            parentGuardianContact: '09123456787'
          }
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusUpdate = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedRequest(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    setStatusUpdateLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the request status in state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: newStatus }
          : req
      ));
      
      handleCloseStatusDialog();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    const matchesTab = activeTab === 0 || 
                      (activeTab === 1 && request.type === 'Form 137') ||
                      (activeTab === 2 && request.type === 'Form 138');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Update statistics for new status flow
  const getStatistics = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const stubGenerated = requests.filter(r => r.status === 'stub-generated').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, stubGenerated, completed, rejected };
  };
  const stats = getStatistics();

  const renderRequestDetails = (request) => {
    if (!request) return null;

    const data = request.formData;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {request.type} Request Details
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Request ID: {request.requestId}
          </Typography>
        </Grid>
        
        {/* Student Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Student Information
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Full Name:</strong> {data.firstName} {data.middleName} {data.surname}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Sex:</strong> {data.sex}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Date of Birth:</strong> {data.dateOfBirth}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>LRN:</strong> {data.learnerReferenceNumber || data.lrn}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Address:</strong> {data.barangay}, {data.city}, {data.province}
          </Typography>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Academic Information
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Grade Level:</strong> {data.lastGradeLevel || data.gradeLevel}
          </Typography>
        </Grid>
        {(data.strand) && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Strand:</strong> {data.strand}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>School Year:</strong> {data.lastAttendedYear || data.schoolYear}
          </Typography>
        </Grid>
        {data.section && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Section:</strong> {data.section}
            </Typography>
          </Grid>
        )}
        {data.adviser && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Adviser:</strong> {data.adviser}
            </Typography>
          </Grid>
        )}

        {/* Request Specific Information */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Request Information
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Purpose:</strong> {data.purpose}
          </Typography>
        </Grid>
        {data.receivingSchool && (
          <Grid item xs={12}>
            <Typography variant="body2">
              <strong>Receiving School:</strong> {data.receivingSchool}
            </Typography>
          </Grid>
        )}
        {data.numberOfCopies && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Number of Copies:</strong> {data.numberOfCopies}
            </Typography>
          </Grid>
        )}

        {/* Parent/Guardian Information */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Parent/Guardian Information
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Name:</strong> {data.parentGuardianName || data.parentName}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Address:</strong> {data.parentGuardianAddress || data.parentAddress}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Contact:</strong> {data.parentGuardianContact || data.parentContact}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <DescriptionIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" component="h1">
                Document Requests Management
              </Typography>
            </Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchRequests}
              variant="outlined"
            >
              Refresh
            </Button>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.pending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {stats.approved}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Stub Generated
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.stubGenerated}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.completed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Rejected
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.rejected}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label={`All Requests (${requests.length})`} />
              <Tab label={`Form 137 (${requests.filter(r => r.type === 'Form 137').length})`} />
              <Tab label={`Form 138 (${requests.filter(r => r.type === 'Form 138').length})`} />
            </Tabs>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name, request ID, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Requests Table */}
          {filteredRequests.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No requests found matching the current filters.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Document Type</TableCell>
                    <TableCell>Grade Level</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {request.requestId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {request.studentName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {request.type === 'Form 137' ? (
                            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                          ) : (
                            <DescriptionIcon sx={{ mr: 1, color: 'secondary.main' }} />
                          )}
                          {request.type}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {request.formData.lastGradeLevel || request.formData.gradeLevel}
                          {request.formData.strand && ` - ${request.formData.strand}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[request.status]}
                          color={statusColors[request.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.submittedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewRequest(request)}
                              size="small"
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton
                              onClick={() => handleStatusUpdate(request)}
                              size="small"
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <PDFDownloadLink
                            document={
                              request.type === 'Form 137' ? (
                                <Form137RequestLetterPDF requestData={request.formData} />
                              ) : (
                                <Form138RequestLetterPDF requestData={request.formData} />
                              )
                            }
                            fileName={`${request.type.replace(' ', '')}_Request_${request.requestId}.pdf`}
                          >
                            {({ loading }) => (
                              <Tooltip title="Download Request Letter">
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={loading}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </PDFDownloadLink>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* View Request Dialog */}
          <Dialog
            open={viewDialogOpen}
            onClose={handleCloseViewDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Request Details - {selectedRequest?.requestId}
                </Typography>
                <IconButton onClick={handleCloseViewDialog}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {renderRequestDetails(selectedRequest)}
            </DialogContent>
            <DialogActions>
              <Box display="flex" gap={2}>
                {selectedRequest && (
                  <PDFDownloadLink
                    document={
                      selectedRequest.type === 'Form 137' ? (
                        <Form137RequestLetterPDF requestData={selectedRequest.formData} />
                      ) : (
                        <Form138RequestLetterPDF requestData={selectedRequest.formData} />
                      )
                    }
                    fileName={`${selectedRequest.type.replace(' ', '')}_Request_${selectedRequest.requestId}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        startIcon={<DownloadIcon />}
                        variant="contained"
                        disabled={loading}
                      >
                        {loading ? 'Generating PDF...' : 'Download PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
                <Button onClick={handleCloseViewDialog}>Close</Button>
              </Box>
            </DialogActions>
          </Dialog>

          {/* Status Update Dialog */}
          <Dialog
            open={statusDialogOpen}
            onClose={handleCloseStatusDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Request ID: {selectedRequest?.requestId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Student: {selectedRequest?.studentName}
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {/* Only allow valid transitions for Form 138 */}
                    {selectedRequest?.type === 'Form 138' ? (
                      <>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved (Upload/Download)</MenuItem>
                        <MenuItem value="ready">Ready for Pickup</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </>
                    ) : (
                      Object.entries(statusLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseStatusDialog}>Cancel</Button>
              <Button
                onClick={handleUpdateStatus}
                variant="contained"
                disabled={statusUpdateLoading || newStatus === selectedRequest?.status}
                startIcon={statusUpdateLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {statusUpdateLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </AdminLayout>
  );
};

export default AdminRequestDashboard;
