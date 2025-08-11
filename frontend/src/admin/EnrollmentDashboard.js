import React, { useEffect, useState } from 'react';
import { enrollmentService } from '../services/api';
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
  CircularProgress,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  IconButton,
  TextField,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import * as XLSX from 'xlsx';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  FamilyRestroom as FamilyIcon,
  LocalHospital as MedicalIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';

const EnrollmentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [enrollmentToReject, setEnrollmentToReject] = useState(null);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sectionUpdating, setSectionUpdating] = useState(null); // student id being updated
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [manageSectionsOpen, setManageSectionsOpen] = useState(false);
  const [sectionsByGrade, setSectionsByGrade] = useState({
    '7': ['Section A', 'Section B'],
    '8': ['Section A', 'Section B'],
    '9': ['Section A', 'Section B'],
    '10': ['Section A', 'Section B'],
    '11': ['STEM', 'ABM', 'HUMSS', 'GAS'],
    '12': ['STEM', 'ABM', 'HUMSS', 'GAS'],
  });

  // Add state for filters at the top of the component
  const [rejectionReasonFilter, setRejectionReasonFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEnrollment(null);
  };

  const handleViewDocuments = () => {
    setDocumentsDialogOpen(true);
  };

  const handleCloseDocumentsDialog = () => {
    setDocumentsDialogOpen(false);
  };

  // Helper function to get the correct file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    // Extract filename from the full path
    // The path might be something like: "uploads/enrollments/form137File-1234567890-filename.pdf"
    // We need to get everything after "uploads/"
    const pathParts = filePath.split('uploads');
    if (pathParts.length > 1) {
      // Remove the leading slash if it exists
      const relativePath = pathParts[1].startsWith('/') ? pathParts[1].substring(1) : pathParts[1];
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${relativePath}`;
    }
    
    // If the path doesn't contain "uploads", assume it's just the filename
    const filename = filePath.split('/').pop() || filePath.split('\\').pop();
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/enrollments/${filename}`;
  };

  const handleRejectClick = (enrollment) => {
    setEnrollmentToReject(enrollment);
    setRejectionDialogOpen(true);
  };

  const handleRejectCancel = () => {
    setRejectionDialogOpen(false);
    setEnrollmentToReject(null);
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setUpdating(true);
    try {
      await enrollmentService.updateEnrollmentStatus(enrollmentToReject._id, { 
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      
      // Refresh the enrollments list
      const res = await enrollmentService.getAllEnrollments();
      setEnrollments(res.data);
      
      // Update the selected enrollment if it's still open
      if (selectedEnrollment && selectedEnrollment._id === enrollmentToReject._id) {
        const updatedEnrollment = res.data.find(e => e._id === enrollmentToReject._id);
        setSelectedEnrollment(updatedEnrollment);
      }
      
      // Close dialogs and reset state
      setRejectionDialogOpen(false);
      setEnrollmentToReject(null);
      setRejectionReason('');
    } catch (err) {
      setError('Failed to reject enrollment');
    }
    setUpdating(false);
  };

  const handleStatusUpdate = async (enrollmentId, status) => {
    // If status is rejected, open the rejection dialog instead
    if (status === 'rejected') {
      const enrollment = enrollments.find(e => e._id === enrollmentId) || selectedEnrollment;
      handleRejectClick(enrollment);
      return;
    }

    setUpdating(true);
    try {
      await enrollmentService.updateEnrollmentStatus(enrollmentId, { status });
      // Refresh the enrollments list
      const res = await enrollmentService.getAllEnrollments();
      setEnrollments(res.data);
      // Update the selected enrollment if it's still open
      if (selectedEnrollment && selectedEnrollment._id === enrollmentId) {
        const updatedEnrollment = res.data.find(e => e._id === enrollmentId);
        setSelectedEnrollment(updatedEnrollment);
      }
    } catch (err) {
      setError('Failed to update enrollment status');
    }
    setUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Export to Excel handler
  const handleExportToExcel = () => {
    // Filter only accepted students with sections
    const acceptedStudents = enrollments.filter(enr => 
      enr.status === 'approved' && enr.section
    );

    // Map enrollments to a flat array of objects for Excel with all required fields
    const data = acceptedStudents.map((enr) => ({
      // 1. Basic Learner Information
      'LRN': enr.learnerReferenceNumber || '',
      'Last Name': enr.surname || '',
      'First Name': enr.firstName || '',
      'Middle Name': enr.middleName || '',
      'Extension Name': enr.extension || '',
      'Sex': enr.sex || '',
      'Birthdate': enr.dateOfBirth ? new Date(enr.dateOfBirth).toISOString().split('T')[0] : '',
      'Age': enr.age || '',

      // 2. Enrollment Details
      'Grade Level': enr.gradeToEnroll || '',
      'Track': enr.track || '',
      'Strand': '', // If you have strand data, add it here
      'Enrollment Type': enr.enrollmentType || '',
      'School Year': enr.schoolYear || '',
      'Date of Enrollment': enr.createdAt ? new Date(enr.createdAt).toISOString().split('T')[0] : '',
      'Section': enr.section || '',
      'Status': enr.status || '',

      // 3. Address & Contact
      'House Number/Street': `${enr.houseNumber || ''} ${enr.street || ''}`.trim(),
      'Barangay': enr.barangay || '',
      'Municipality/City': enr.city || '',
      'Province': enr.province || '',
      'Zip Code': enr.zipCode || '',
      'Contact Number': enr.contactNumber || '',
      'Email Address': enr.emailAddress || '',

      // 4. Guardian/Parent Info
      'Parent/Guardian Name': enr.guardianName || `${enr.fatherName || ''} ${enr.motherName ? '/ ' + enr.motherName : ''}`.trim(),
      'Relationship to Learner': enr.guardianRelationship || '',
      'Parent/Guardian Contact Number': enr.guardianContactNumber || enr.fatherContactNumber || enr.motherContactNumber || '',

      // 5. Previous School Info
      'Last School Attended': enr.lastSchoolAttended || '',
      'School ID': '', // If you have school ID data, add it here
      'School Address': enr.schoolAddress || ''
    }));

    // Create worksheet with the data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add some styling to the header row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let i = range.s.c; i <= range.e.c; i++) {
      const address = XLSX.utils.encode_col(i) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
      };
    }

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Accepted Students');

    // Generate the Excel file
    XLSX.writeFile(workbook, `Accepted_Students_with_Sections_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Section assignment handler
  const handleSectionChange = async (enrollmentId, newSection) => {
    setSectionUpdating(enrollmentId);
    try {
      await enrollmentService.updateEnrollmentSection(enrollmentId, { section: newSection });
      // Refresh enrollments
      const res = await enrollmentService.getAllEnrollments();
      setEnrollments(res.data);
    } catch (err) {
      setError('Failed to update section');
    }
    setSectionUpdating(null);
  };

  // Section options (customize as needed)
  const sectionOptions = ['Section A', 'Section B', 'Section C'];

  // Open assign section dialog
  const handleOpenAssignDialog = async (student) => {
    setAssigningStudent(student);
    setSelectedSection(student.section || '');
    setAssignDialogOpen(true);
    try {
      const res = await enrollmentService.getSectionsByGrade(student.gradeToEnroll);
      setAvailableSections(res.data.sections || []);
    } catch (err) {
      setAvailableSections([]);
    }
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setAssigningStudent(null);
    setAvailableSections([]);
    setSelectedSection('');
  };

  // Assign section to student
  const handleConfirmAssign = async () => {
    if (!assigningStudent || !selectedSection) return;
    setSectionUpdating(assigningStudent._id);
    try {
      await enrollmentService.updateEnrollmentSection(assigningStudent._id, { section: selectedSection });
      const res = await enrollmentService.getAllEnrollments();
      setEnrollments(res.data);
      setSnackbar({ open: true, message: 'Section assigned successfully!', severity: 'success' });
      handleCloseAssignDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to assign section.', severity: 'error' });
    }
    setSectionUpdating(null);
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to delete this enrollment request?')) return;
    setLoading(true);
    try {
      await enrollmentService.deleteEnrollment(enrollmentId);
      const res = await enrollmentService.getAllEnrollments();
      setEnrollments(res.data);
      setSnackbar({ open: true, message: 'Enrollment deleted successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete enrollment.', severity: 'error' });
    }
    setLoading(false);
  };

  const handleOpenManageSections = () => setManageSectionsOpen(true);
  const handleCloseManageSections = () => setManageSectionsOpen(false);

  useEffect(() => {
    enrollmentService.getAllEnrollments()
      .then(res => {
        setEnrollments(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch enrollments');
        setLoading(false);
      });
  }, []);

  // Filter enrollments by search term
  const filteredEnrollments = enrollments.filter(e => {
    const name = `${e.surname || ''} ${e.firstName || ''} ${e.middleName || ''}`.toLowerCase();
    const lrn = (e.learnerReferenceNumber || '').toString().toLowerCase();
    const track = (e.track || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || lrn.includes(term) || track.includes(term);
  });

  // Filter accepted students with search term
  const filteredAcceptedEnrollments = enrollments.filter(e => {
    if (e.status !== 'approved') return false;
    
    const name = `${e.surname || ''} ${e.firstName || ''} ${e.middleName || ''}`.toLowerCase();
    const lrn = (e.learnerReferenceNumber || '').toString().toLowerCase();
    const track = (e.track || '').toLowerCase();
    const gradeLevel = (e.gradeToEnroll || '').toString().toLowerCase();
    const section = (e.section || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return name.includes(term) || lrn.includes(term) || track.includes(term) || 
           gradeLevel.includes(term) || section.includes(term);
  });

  // Filter rejected students with search term
  const filteredRejectedEnrollments = enrollments.filter(e => {
    if (e.status !== 'rejected') return false;
    
    const name = `${e.surname || ''} ${e.firstName || ''} ${e.middleName || ''}`.toLowerCase();
    const lrn = (e.learnerReferenceNumber || '').toString().toLowerCase();
    const track = (e.track || '').toLowerCase();
    const rejectionReason = (e.rejectionReason || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return name.includes(term) || lrn.includes(term) || track.includes(term) || 
           rejectionReason.includes(term);
  });

  return (
    <AdminLayout title="Student Enrollment Dashboard">
      <Container maxWidth="xl">
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Student Enrollment Dashboard
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              label="Search by Name, LRN, Track, Grade, or Section"
              variant="outlined"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ width: 350 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleOpenManageSections}>
                Manage Sections
              </Button>
              <Button variant="contained" color="success" onClick={handleExportToExcel}>
                Export to Excel
              </Button>
            </Box>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="All Enrollments" />
              <Tab label="Accepted Students" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>
          {activeTab === 0 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>LRN</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Grade to Enroll</TableCell>
                        <TableCell>Section</TableCell>
                        <TableCell>Track</TableCell>
                        <TableCell>Date Submitted</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEnrollments.map((e) => (
                        <TableRow key={e._id}>
                          <TableCell>{e.learnerReferenceNumber}</TableCell>
                          <TableCell>{e.surname}, {e.firstName} {e.middleName}</TableCell>
                          <TableCell>{e.gradeToEnroll}</TableCell>
                          <TableCell>
                            {e.section ? (
                              <Chip label={e.section} color="primary" size="small" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not Assigned
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{e.track}</TableCell>
                          <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={e.status || 'pending'} 
                              color={getStatusColor(e.status || 'pending')} 
                              size="small" 
                              icon={
                                (e.status === 'approved' && <ApproveIcon />) ||
                                (e.status === 'rejected' && <RejectIcon />) ||
                                <PendingIcon />
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewDetails(e)}
                              sx={{ mr: 1 }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteEnrollment(e._id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
          {activeTab === 1 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Grade Level</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assigned Section</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAcceptedEnrollments.map((e) => (
                        <TableRow key={e._id}>
                          <TableCell>{e.surname}, {e.firstName} {e.middleName}</TableCell>
                          <TableCell>{e.gradeToEnroll}</TableCell>
                          <TableCell>
                            <Chip label={e.status} color={getStatusColor(e.status)} size="small" />
                          </TableCell>
                          <TableCell>{e.section || 'Unassigned'}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOpenAssignDialog(e)}
                              disabled={sectionUpdating === e._id}
                            >
                              Assign Section
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {/* Assign Section Dialog */}
              <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog}>
                <DialogTitle>Assign Section</DialogTitle>
                <DialogContent>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Section</InputLabel>
                    <Select
                      value={selectedSection}
                      label="Section"
                      onChange={e => setSelectedSection(e.target.value)}
                    >
                      {availableSections.length === 0 && <MenuItem value="" disabled>No sections available</MenuItem>}
                      {availableSections.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseAssignDialog}>Cancel</Button>
                  <Button
                    onClick={handleConfirmAssign}
                    variant="contained"
                    disabled={!selectedSection || sectionUpdating === (assigningStudent && assigningStudent._id)}
                  >
                    Confirm Assignment
                  </Button>
                </DialogActions>
              </Dialog>
              {/* Success/Error Snackbar */}
              <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </>
          )}
          {activeTab === 2 && (
            <>
              {/* Filter Bar for Rejection Reason and Date Range */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="Rejection Reason"
                  size="small"
                  value={rejectionReasonFilter || ''}
                  onChange={e => setRejectionReasonFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="From"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dateFromFilter || ''}
                  onChange={e => setDateFromFilter(e.target.value)}
                />
                <TextField
                  label="To"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dateToFilter || ''}
                  onChange={e => setDateToFilter(e.target.value)}
                />
                <Button variant="outlined" onClick={() => { setRejectionReasonFilter(''); setDateFromFilter(''); setDateToFilter(''); }}>Clear Filters</Button>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Grade Level</TableCell>
                        <TableCell>Date Rejected</TableCell>
                        <TableCell>Rejection Reason</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRejectedEnrollments
                        .filter(e =>
                          (!rejectionReasonFilter || (e.rejectionReason || '').toLowerCase().includes(rejectionReasonFilter.toLowerCase())) &&
                          (!dateFromFilter || (e.reviewedAt && new Date(e.reviewedAt) >= new Date(dateFromFilter))) &&
                          (!dateToFilter || (e.reviewedAt && new Date(e.reviewedAt) <= new Date(dateToFilter)))
                        )
                        .map((e) => (
                          <TableRow key={e._id}>
                            <TableCell sx={{ fontFamily: 'Gotham, Nunito, Montserrat', color: '#2A2A2A' }}>{e.surname}, {e.firstName} {e.middleName}</TableCell>
                            <TableCell sx={{ fontFamily: 'Gotham', color: '#2A2A2A' }}>{e.gradeToEnroll}</TableCell>
                            <TableCell sx={{ fontFamily: 'Gotham', color: '#2A2A2A' }}>{e.reviewedAt ? new Date(e.reviewedAt).toLocaleString() : 'N/A'}</TableCell>
                            <TableCell sx={{ maxWidth: 220, fontFamily: 'Gotham', color: '#2A2A2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {e.rejectionReason && e.rejectionReason.length > 40 ? (
                                <Tooltip title={e.rejectionReason} arrow>
                                  <span>{e.rejectionReason.slice(0, 40)}...</span>
                                </Tooltip>
                              ) : (
                                e.rejectionReason || 'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(e)}
                              >
                                View Form
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>

      {/* Enrollment Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            Student Enrollment Details
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
          {selectedEnrollment && (
            <Grid container spacing={3}>
              
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">Personal Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">LRN</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.learnerReferenceNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Last Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.surname}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">First Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.firstName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Middle Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.middleName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Extension</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.extension || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Sex</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.sex}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedEnrollment.dateOfBirth ? new Date(selectedEnrollment.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Place of Birth</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.placeOfBirth || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Age</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.age || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Religion</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.religion || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Citizenship</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.citizenship || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Address & Contact Information */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">Address & Contact Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Complete Address</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {`${selectedEnrollment.houseNumber || ''} ${selectedEnrollment.street || ''}, ${selectedEnrollment.barangay || ''}, ${selectedEnrollment.city || ''}, ${selectedEnrollment.province || ''} ${selectedEnrollment.zipCode || ''}`.trim()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.contactNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Email Address</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.emailAddress || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Academic Information */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">Academic Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Last School Attended</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.lastSchoolAttended || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">School Address</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.schoolAddress || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Grade Level Completed</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.gradeLevel || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">School Year</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.schoolYear || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Grade to Enroll</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.gradeToEnroll || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Track</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.track || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Family Information */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FamilyIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">Family Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Father's Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.fatherName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Father's Occupation</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.fatherOccupation || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Father's Contact</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.fatherContactNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Mother's Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.motherName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Mother's Occupation</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.motherOccupation || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Mother's Contact</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.motherContactNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Guardian's Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.guardianName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Guardian's Relationship</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.guardianRelationship || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Guardian's Contact</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.guardianContactNumber || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Emergency Contact</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Emergency Contact Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.emergencyContactName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Relationship</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.emergencyContactRelationship || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.emergencyContactNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Emergency Contact Address</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.emergencyContactAddress || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Medical Information */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MedicalIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">Medical Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Special Needs</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.specialNeeds || 'None'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Allergies</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.allergies || 'None'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Medications</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedEnrollment.medications || 'None'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Document Requirements */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Document Requirements</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">Form 137:</Typography>
                      <Chip 
                        label={selectedEnrollment.form137 ? 'Submitted' : 'Not Submitted'} 
                        color={selectedEnrollment.form137 ? 'success' : 'error'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">Form 138:</Typography>
                      <Chip 
                        label={selectedEnrollment.form138 ? 'Submitted' : 'Not Submitted'} 
                        color={selectedEnrollment.form138 ? 'success' : 'error'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">Good Moral Certificate:</Typography>
                      <Chip 
                        label={selectedEnrollment.goodMoral ? 'Submitted' : 'Not Submitted'} 
                        color={selectedEnrollment.goodMoral ? 'success' : 'error'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">Medical Certificate:</Typography>
                      <Chip 
                        label={selectedEnrollment.medicalCertificate ? 'Submitted' : 'Not Submitted'} 
                        color={selectedEnrollment.medicalCertificate ? 'success' : 'error'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Submission Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Submission Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Date Submitted</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(selectedEnrollment.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Agreement Accepted</Typography>
                    <Chip 
                      label={selectedEnrollment.agreementAccepted ? 'Yes' : 'No'} 
                      color={selectedEnrollment.agreementAccepted ? 'success' : 'error'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Current Status</Typography>
                    <Chip 
                      label={selectedEnrollment.status || 'pending'} 
                      color={getStatusColor(selectedEnrollment.status || 'pending')} 
                      size="small" 
                    />
                  </Grid>
                  {selectedEnrollment.reviewedAt && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Reviewed Date</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedEnrollment.reviewedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  {selectedEnrollment.rejectionReason && (
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
                        {selectedEnrollment.rejectionReason}
                      </Typography>
                    </Grid>
                  )}
                  {selectedEnrollment.reviewNotes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Review Notes</Typography>
                      <Typography variant="body1" fontWeight={500} 
                        sx={{ 
                          bgcolor: 'grey.50', 
                          p: 2, 
                          borderRadius: 1, 
                          mt: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}
                      >
                        {selectedEnrollment.reviewNotes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>

            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          {selectedEnrollment && (
            <Box sx={{ display: 'flex', gap: 2, mr: 'auto' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleStatusUpdate(selectedEnrollment._id, 'approved')}
                disabled={updating || selectedEnrollment.status === 'approved'}
              >
                {updating ? 'Updating...' : 'Approve'}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleStatusUpdate(selectedEnrollment._id, 'rejected')}
                disabled={updating || selectedEnrollment.status === 'rejected'}
              >
                {updating ? 'Updating...' : 'Reject'}
              </Button>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedEnrollment && (
              <Button 
                variant="outlined" 
                onClick={handleViewDocuments}
                startIcon={<VisibilityIcon />}
              >
                View Documents
              </Button>
            )}
            <Button onClick={handleCloseDialog} variant="contained">
              Close
            </Button>
          </Box>
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
            Reject Enrollment
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
            Please provide a reason for rejecting this enrollment application:
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
          {enrollmentToReject && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Student: {enrollmentToReject.firstName} {enrollmentToReject.surname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                LRN: {enrollmentToReject.learnerReferenceNumber}
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
            {updating ? 'Rejecting...' : 'Reject Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Documents Viewing Dialog */}
      <Dialog
        open={documentsDialogOpen}
        onClose={handleCloseDocumentsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Student Documents - {selectedEnrollment ? `${selectedEnrollment.firstName} ${selectedEnrollment.surname}` : ''}
          </Typography>
          <IconButton onClick={handleCloseDocumentsDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          {selectedEnrollment && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Below are the documents uploaded by the student. Click on any document to view or download it.
                </Typography>
              </Grid>

              {/* Form 137 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Form 137 (Permanent Record)
                    </Typography>
                  </Box>
                  {selectedEnrollment.form137File ? (
                    <Box>
                      <Chip 
                        label="✓ Uploaded" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 2, backgroundColor: '#4ade80', color: 'white' }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const fileUrl = getFileUrl(selectedEnrollment.form137File);
                          if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          } else {
                            alert('File not found');
                          }
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Chip 
                      label="Not Uploaded" 
                      color="error" 
                      size="small" 
                      sx={{ backgroundColor: '#ef4444', color: 'white' }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Form 138 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Form 138 (Report Card)
                    </Typography>
                  </Box>
                  {selectedEnrollment.form138File ? (
                    <Box>
                      <Chip 
                        label="✓ Uploaded" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 2, backgroundColor: '#4ade80', color: 'white' }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const fileUrl = getFileUrl(selectedEnrollment.form138File);
                          if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          } else {
                            alert('File not found');
                          }
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Chip 
                      label="Not Uploaded" 
                      color="error" 
                      size="small" 
                      sx={{ backgroundColor: '#ef4444', color: 'white' }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Good Moral Certificate */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Good Moral Certificate
                    </Typography>
                  </Box>
                  {selectedEnrollment.goodMoralFile ? (
                    <Box>
                      <Chip 
                        label="✓ Uploaded" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 2, backgroundColor: '#4ade80', color: 'white' }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const fileUrl = getFileUrl(selectedEnrollment.goodMoralFile);
                          if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          } else {
                            alert('File not found');
                          }
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Chip 
                      label="Not Uploaded" 
                      color="error" 
                      size="small" 
                      sx={{ backgroundColor: '#ef4444', color: 'white' }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Medical Certificate */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MedicalIcon sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Medical Certificate
                    </Typography>
                  </Box>
                  {selectedEnrollment.medicalCertificateFile ? (
                    <Box>
                      <Chip 
                        label="✓ Uploaded" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 2, backgroundColor: '#4ade80', color: 'white' }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const fileUrl = getFileUrl(selectedEnrollment.medicalCertificateFile);
                          if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          } else {
                            alert('File not found');
                          }
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Chip 
                      label="Not Uploaded" 
                      color="error" 
                      size="small" 
                      sx={{ backgroundColor: '#ef4444', color: 'white' }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Parent ID */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FamilyIcon sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Parent/Guardian ID
                    </Typography>
                  </Box>
                  {selectedEnrollment.parentIdFile ? (
                    <Box>
                      <Chip 
                        label="✓ Uploaded" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 2, backgroundColor: '#4ade80', color: 'white' }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const fileUrl = getFileUrl(selectedEnrollment.parentIdFile);
                          if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          } else {
                            alert('File not found');
                          }
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Chip 
                      label="Not Uploaded" 
                      color="error" 
                      size="small" 
                      sx={{ backgroundColor: '#ef4444', color: 'white' }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* ID Pictures */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      ID Pictures (2x2)
                    </Typography>
                  </Box>
                  {selectedEnrollment.idPicturesFile ? (
                    <Box>
                      <Chip 
                        label="✓ Uploaded" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 2, backgroundColor: '#4ade80', color: 'white' }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const fileUrl = getFileUrl(selectedEnrollment.idPicturesFile);
                          if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          } else {
                            alert('File not found');
                          }
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Chip 
                      label="Not Uploaded" 
                      color="error" 
                      size="small" 
                      sx={{ backgroundColor: '#ef4444', color: 'white' }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Document Summary */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  mt: 2
                }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                    Document Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {[
                      { label: 'Form 137', file: selectedEnrollment.form137File },
                      { label: 'Form 138', file: selectedEnrollment.form138File },
                      { label: 'Good Moral', file: selectedEnrollment.goodMoralFile },
                      { label: 'Medical Certificate', file: selectedEnrollment.medicalCertificateFile },
                      { label: 'Parent ID', file: selectedEnrollment.parentIdFile },
                      { label: 'ID Pictures', file: selectedEnrollment.idPicturesFile },
                    ].map((doc, index) => (
                      <Chip
                        key={index}
                        label={doc.label}
                        color={doc.file ? 'success' : 'error'}
                        size="small"
                        icon={doc.file ? <CheckCircleIcon /> : <CancelIcon />}
                        sx={{ 
                          backgroundColor: doc.file ? '#4ade80' : '#ef4444', 
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Documents uploaded: {[
                      selectedEnrollment.form137File,
                      selectedEnrollment.form138File,
                      selectedEnrollment.goodMoralFile,
                      selectedEnrollment.medicalCertificateFile,
                      selectedEnrollment.parentIdFile,
                      selectedEnrollment.idPicturesFile
                    ].filter(file => file).length} of 6
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Button 
            onClick={handleCloseDocumentsDialog}
            variant="contained"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Sections Dialog */}
      <Dialog open={manageSectionsOpen} onClose={handleCloseManageSections} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Sections</DialogTitle>
        <DialogContent>
          {Object.entries(sectionsByGrade).map(([grade, sections]) => (
            <Box key={grade} sx={{ mb: 3 }}>
              <Typography variant="h6">Grade {grade}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {sections.map((section, idx) => (
                  <Chip key={section + idx} label={section} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseManageSections}>Close</Button>
    </DialogActions>
  </Dialog>

      {/* Manage Sections Dialog */}
      <Dialog open={manageSectionsOpen} onClose={handleCloseManageSections} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Sections</DialogTitle>
        <DialogContent>
          {Object.entries(sectionsByGrade).map(([grade, sections]) => (
            <Box key={grade} sx={{ mb: 3 }}>
              <Typography variant="h6">Grade {grade}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {sections.map((section, idx) => (
                  <Chip key={section + idx} label={section} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseManageSections}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  </AdminLayout>
  );
};

export default EnrollmentDashboard;
