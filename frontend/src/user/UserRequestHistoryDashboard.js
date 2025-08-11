import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Form137RequestLetterPDF from '../components/PDFTemplates/Form137RequestLetterPDF';
import Form138RequestLetterPDF from '../components/PDFTemplates/Form138RequestLetterPDF';
import { useAuth } from '../context/AuthContext';

const UserRequestHistoryDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  // New status flow for Form 138 requests
  const statusLabels = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'ready': 'Ready for Pickup',
    'completed': 'Completed',
  };

  const statusColors = {
    'pending': 'info',
    'approved': 'primary',
    'rejected': 'error',
    'ready': 'success',
    'completed': 'success',
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
          studentName: `${user?.firstName || ''} ${user?.lastName || ''}`,
          formData: {
            surname: user?.lastName || 'Doe',
            firstName: user?.firstName || 'John',
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
          studentName: `${user?.firstName || ''} ${user?.lastName || ''}`,
          formData: {
            surname: user?.lastName || 'Doe',
            firstName: user?.firstName || 'John',
            middleName: 'M',
            sex: 'Male',
            dateOfBirth: '2005-01-01',
            placeOfBirth: 'Sample City',
            lrn: '123456789012',
            barangay: 'Sample Barangay',
            city: 'Sample City',
            province: 'Sample Province',
            gradeLevel: 'Grade 12',
            strand: 'ABM',
            schoolYear: '2023-2024',
            section: 'Einstein',
            adviser: 'Ms. Smith',
            purpose: 'Scholarship Application',
            numberOfCopies: '2',
            parentName: 'Jane Doe',
            parentAddress: 'Sample Address',
            parentContact: '09123456789',
            downloadUrl: '/mock-report-card.pdf',
            pickupDate: null
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

  const renderRequestDetails = (request) => {
    if (!request) return null;

    const data = request.formData;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {request.type} Request Details
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <DescriptionIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            My Document Requests
          </Typography>
        </Box>

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
            No requests found. Start by submitting a Form 137 or Form 138 request.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
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
                        label={statusLabels[request.status] || request.status}
                        color={statusColors[request.status] || 'default'}
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
                        {/* Show download link for Form 138 if approved */}
                        {request.type === 'Form 138' && request.status === 'approved' && request.formData.downloadUrl && (
                          <Tooltip title="Download Report Card">
                            <IconButton
                              size="small"
                              color="success"
                              component="a"
                              href={request.formData.downloadUrl}
                              target="_blank"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {/* Fallback: download request letter */}
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
                                color="secondary"
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
            {/* Progress indicator for Form 138 */}
            {selectedRequest?.type === 'Form 138' && (
              <Box sx={{ mb: 2 }}>
                <Stepper activeStep={['pending','approved','rejected','ready','completed'].indexOf(selectedRequest.status)} alternativeLabel>
                  {['Pending','Approved','Rejected','Ready for Pickup','Completed'].map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                  ))}
                </Stepper>
              </Box>
            )}
            {renderRequestDetails(selectedRequest)}
          </DialogContent>
          <DialogActions>
            <Box display="flex" gap={2}>
              {/* Download link for Form 138 if approved */}
              {selectedRequest && selectedRequest.type === 'Form 138' && selectedRequest.status === 'approved' && selectedRequest.formData.downloadUrl && (
                <Button
                  variant="contained"
                  color="success"
                  href={selectedRequest.formData.downloadUrl}
                  target="_blank"
                  startIcon={<DownloadIcon />}
                >
                  Download Report Card
                </Button>
              )}
              {/* Fallback: download request letter */}
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
      </Paper>
    </Container>
  );
};

export default UserRequestHistoryDashboard;
