import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  School as SchoolIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'info',
};
const EnrollmentAdminDashboard = () => {
  // Export to Excel handler
  const handleExportToExcel = () => {
    // Always use the full enrollments array, not paginated/filtered
    const accepted = enrollments.filter(e => e.status === 'enrolled');
    if (accepted.length === 0) {
      setError('No accepted enrollees to export.');
      return;
    }
    // Helper to calculate age from date of birth
    function calculateAge(dobStr) {
      if (!dobStr) return '';
      const dob = new Date(dobStr);
      if (isNaN(dob.getTime())) return '';
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    }
    // Map to requested fields for Excel
    const data = accepted.map(e => ({
      'Learner Reference Number': e.learnerReferenceNumber || '',
      'Surname': e.surname || '',
      'First Name': e.firstName || '',
      'Middle Name': e.middleName || '',
      'Extension': e.extension || e.extensionName || '',
      'Date of Birth': e.dateOfBirth || '',
      'Place of Birth': e.placeOfBirth || '',
      'Sex': e.sex || '',
      'Age': calculateAge(e.dateOfBirth),
      'Religion': e.religion || '',
      'Citizenship': e.citizenship || '',
      'House Number': e.houseNumber || '',
      'Street': e.street || '',
      'Barangay': e.barangay || '',
      'City': e.city || '',
      'Province': e.province || '',
      'Zip Code': e.zipCode || '',
      'Contact Number': e.contactNumber || '',
      'Email Address': (e.user?.email || e.emailAddress || ''),
      'Last School Attended': e.lastSchoolAttended || '',
      'School Address': e.schoolAddress || '',
      'Grade Level': e.gradeToEnroll || e.gradeLevel || '',
      'School Year': e.schoolYear || '',
      "Father's Name": e.fatherName || '',
      "Mother's Name": e.motherName || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Accepted Enrollees');
    XLSX.writeFile(workbook, 'accepted_enrollees.xlsx');
  };
  const [enrollments, setEnrollments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    assigned: 0
  });
  // Assign Section modal states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedEnrollmentForSection, setSelectedEnrollmentForSection] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [sectionFetchError, setSectionFetchError] = useState('');

  // Add useEffect to fetch enrollments on component mount
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleOpenAssignSection = async (enrollment) => {
    setSelectedEnrollmentForSection(enrollment);
    setAssignDialogOpen(true);
    setAvailableSections([]);
    setSelectedSectionId('');
    setSectionFetchError('');
    try {
      const token = localStorage.getItem('token');
      let gradeLevel = enrollment.gradeToEnroll || enrollment.gradeLevel;
      
      console.log('[AssignSection] Original gradeLevel from enrollment:', gradeLevel);
      
      // Normalize gradeLevel - if it's just a number, add "Grade " prefix
      if (/^[7-9]$|^10$|^11$|^12$/.test(gradeLevel)) {
        gradeLevel = `Grade ${gradeLevel}`;
      }
      
      console.log('[AssignSection] Normalized gradeLevel sent to backend:', gradeLevel);
      console.log('[AssignSection] Full enrollment object:', enrollment);
      
      const url = `http://localhost:5000/api/sections/grade/${encodeURIComponent(gradeLevel)}`;
      console.log('[AssignSection] Fetching sections from URL:', url);
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[AssignSection] Sections response from backend:', data);
        setAvailableSections(Array.isArray(data) ? data : []);
        if (!data.length) {
          setSectionFetchError(`No sections found for ${gradeLevel}. Create sections in the Section Management page first.`);
        }
      } else {
        const errorText = await res.text();
        console.error('[AssignSection] Backend error:', res.status, errorText);
        setSectionFetchError(`Failed to fetch sections (status ${res.status}). Check console for details.`);
      }
    } catch (err) {
      console.error('[AssignSection] Fetch error:', err);
      setSectionFetchError('Network error while fetching sections.');
    }
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedEnrollmentForSection(null);
    setAvailableSections([]);
    setSelectedSectionId('');
    setSectionFetchError('');
  };

  const handleAssignSection = async () => {
    if (!selectedSectionId) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      // Always use the exact, trimmed section name for assignment
      const selectedSectionObj = availableSections.find(s => s._id === selectedSectionId);
      const sectionName = selectedSectionObj && selectedSectionObj.name ? selectedSectionObj.name.trim() : '';
      
      console.log('[AssignSection] Assigning student to section:', sectionName);
      console.log('[AssignSection] Selected section object:', selectedSectionObj);
      console.log('[AssignSection] Enrollment ID:', selectedEnrollmentForSection._id);
      
      const res = await fetch(`http://localhost:5000/api/enrollments/${selectedEnrollmentForSection._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'enrolled',
          section: sectionName,
          reviewNotes: `Assigned to section ${sectionName}`,
        }),
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log('[AssignSection] Assignment successful:', result);
        setSuccessMessage('Section assigned successfully!');
        setShowSuccessMessage(true);
        fetchEnrollments();
        handleCloseAssignDialog();
      } else {
        const errorText = await res.text();
        console.error('[AssignSection] Assignment failed:', res.status, errorText);
        setError(`Failed to assign section (status ${res.status}). Check console for details.`);
      }
    } catch (err) {
      console.error('[AssignSection] Assignment error:', err);
      setError('Network error while assigning section.');
    } finally {
      setAssigning(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Fetching enrollments from API...');
      const response = await fetch('http://localhost:5000/api/enrollments/admin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch enrollments: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched enrollments:', data);
      setEnrollments(Array.isArray(data) ? data : []);
      
      // Calculate stats
      const enrollmentArray = Array.isArray(data) ? data : [];
      const newStats = {
        total: enrollmentArray.length,
        pending: enrollmentArray.filter(e => e.status === 'pending').length,
        approved: enrollmentArray.filter(e => e.status === 'approved').length,
        rejected: enrollmentArray.filter(e => e.status === 'rejected').length,
        assigned: enrollmentArray.filter(e => e.status === 'enrolled' && e.section && e.section.trim() !== '').length
      };
      setStats(newStats);
      
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError(error.message || 'Failed to load enrollments. Please check your connection and try again.');
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

  const handleStatusChange = async (enrollmentId, newStatus) => {
    if (newStatus === 'rejected') {
      setSelectedEnrollment(enrollments.find(enrollment => enrollment._id === enrollmentId));
      setRejectDialogOpen(true);
      return;
    }
    
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/enrollments/${enrollmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          reviewNotes: `Status updated to ${newStatus}` 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update enrollment status: ${response.status}`);
      }

      const data = await response.json();
      setSuccessMessage(`Enrollment ${newStatus} successfully!`);
      setShowSuccessMessage(true);
      fetchEnrollments();
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      setError('Failed to update enrollment status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectEnrollment = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/enrollments/${selectedEnrollment._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
          reviewNotes: rejectionReason.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reject enrollment: ${response.status}`);
      }

      const data = await response.json();
      setSuccessMessage('Enrollment rejected successfully');
      setShowSuccessMessage(true);
      fetchEnrollments();
      handleCloseRejectDialog();
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      setError('Failed to reject enrollment. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedEnrollment(null);
    setRejectionReason('');
  };

  const handleViewDetails = (enrollment) => {
    setEnrollmentDetails(enrollment);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setEnrollmentDetails(null);
  };

  const handleArchive = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/enrollments/${id}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEnrollments(prev => prev.filter(enrollment => enrollment._id !== id));
        setSuccessMessage('Enrollment archived successfully');
        setShowSuccessMessage(true);
      } else {
        throw new Error('Failed to archive enrollment');
      }
    } catch (error) {
      console.error('Error archiving enrollment:', error);
      setError('Failed to archive enrollment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/enrollments/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setEnrollments(prev => prev.filter(enrollment => enrollment._id !== id));
          setSuccessMessage('Enrollment deleted successfully');
          setShowSuccessMessage(true);
        } else {
          throw new Error('Failed to delete enrollment');
        }
      } catch (error) {
        console.error('Error deleting enrollment:', error);
        setError('Failed to delete enrollment');
      }
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    // Get student name from actual enrollment data
    const studentName = enrollment.firstName && enrollment.lastName 
      ? `${enrollment.firstName} ${enrollment.lastName}` 
      : '';
    const enrollmentNumber = enrollment.enrollmentNumber || '';
    let gradeLevel = enrollment.gradeToEnroll || enrollment.gradeLevel || '';
    const learnerReferenceNumber = enrollment.learnerReferenceNumber || '';

    // Normalize grade level for comparison
    let normalizedGrade = gradeLevel.trim();
    if (/^\d+$/.test(normalizedGrade)) normalizedGrade = `Grade ${normalizedGrade}`;

    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learnerReferenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gradeLevel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || normalizedGrade === gradeFilter;
    return matchesSearch && matchesStatus && matchesGrade;
  });

  // Helper to calculate age from date of birth (for modal display)
  function calculateAgeFromDOB(dobStr) {
    if (!dobStr) return '';
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  // Helper to format date as YYYY-MM-DD
  function formatDateYMD(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().slice(0, 10);
  }

  // Helper to display track based on grade level
  function getTrackDisplay(gradeLevel, track) {
    if (!gradeLevel) return track || '';
    
    // Extract grade number from grade level string
    const gradeMatch = gradeLevel.toString().match(/\d+/);
    if (!gradeMatch) return track || '';
    
    const gradeNumber = parseInt(gradeMatch[0]);
    
    // Grades 7-10 are trackless, so show "non-applicable"
    if (gradeNumber >= 7 && gradeNumber <= 10) {
      return 'non-applicable';
    }
    
    // Grades 11-12 should show the actual track
    return track || '';
  }
  return (
    <AdminLayout title="Enrollment Management Dashboard">
      <Container maxWidth="xl">
        {/* Modern Header Card */}
        <Box sx={{ 
          mb: 4,
          p: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
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
            background: 'linear-gradient(45deg, rgba(76,175,80,0.05) 0%, rgba(139,195,74,0.05) 100%)',
            zIndex: 0
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="700" sx={{ 
              color: '#1f2937',
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Student Enrollment Management
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#6b7280',
              fontWeight: 500,
              opacity: 0.9
            }}>
              Manage and process student enrollment applications
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Total Enrollments"
              value={stats.total}
              icon={<SchoolIcon />}
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
              title="Rejected"
              value={stats.rejected}
              icon={<CancelIcon />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Assigned to a Section"
              value={stats.assigned}
              icon={<AssignmentIcon />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            component={RouterLink}
            to="/admin/enrollment-archive"
            variant="outlined"
            size="large"
            startIcon={<ArchiveIcon />}
            sx={{
              borderColor: '#4caf50',
              color: '#4caf50',
              backgroundColor: 'white',
              borderWidth: 2,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#388e3c',
                backgroundColor: '#f1f8e9',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 6px -1px rgba(76, 175, 80, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            View Enrollment Archive
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleExportToExcel}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Export Accepted Enrollees to Excel
          </Button>
          
          <Button
            onClick={fetchEnrollments}
            variant="outlined"
            size="large"
            disabled={loading}
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
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Refresh Data'}
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
                Search & Filter Enrollments
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search by student name or grade level..."
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
                          borderColor: '#4caf50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4caf50',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
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
                          borderColor: '#4caf50',
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Filter by Grade Level"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f9fafb',
                        '&.Mui-focused fieldset': {
                          borderColor: '#4caf50',
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    <MenuItem value="all">All Grades</MenuItem>
                    <MenuItem value="Grade 7">Grade 7</MenuItem>
                    <MenuItem value="Grade 8">Grade 8</MenuItem>
                    <MenuItem value="Grade 9">Grade 9</MenuItem>
                    <MenuItem value="Grade 10">Grade 10</MenuItem>
                    <MenuItem value="Grade 11">Grade 11</MenuItem>
                    <MenuItem value="Grade 12">Grade 12</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Modern Enrollments Table */}
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
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
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
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
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
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Grade Level
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Section
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                        color: 'white',
                        py: 3, 
                        borderBottom: 'none',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Application Date
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
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
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
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
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
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
                    {filteredEnrollments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((enrollment) => (
                        <TableRow key={enrollment._id} sx={{
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(139,195,74,0.05) 100%)',
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
                          }}>
                            {enrollment.firstName && enrollment.surname
                              ? `${enrollment.firstName} ${enrollment.surname}`
                              : enrollment.studentName || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            py: 2.5, 
                            color: '#6b7280',
                            borderBottom: 'none'
                          }}>
                            {enrollment.user?.email || enrollment.emailAddress || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            py: 2.5, 
                            fontWeight: 500,
                            color: '#374151',
                            borderBottom: 'none'
                          }}>
                            {enrollment.gradeToEnroll || enrollment.gradeLevel || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            py: 2.5, 
                            color: '#6b7280',
                            borderBottom: 'none'
                          }}>
                            {enrollment.section}
                          </TableCell>
                          <TableCell sx={{ 
                            py: 2.5, 
                            color: '#6b7280',
                            borderBottom: 'none'
                          }}>
                            {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : ''}
                          </TableCell>
                          <TableCell sx={{ py: 2.5, borderBottom: 'none' }}>
                            <Chip
                              label={enrollment.status}
                              color={statusColors[enrollment.status]}
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
                              onClick={() => handleViewDetails(enrollment)}
                              sx={{ 
                                minWidth: 'auto',
                                px: 3,
                                py: 1,
                                borderRadius: 3,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {enrollment.status === 'pending' && (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleStatusChange(enrollment._id, 'approved')}
                                    sx={{ 
                                      textTransform: 'none',
                                      borderRadius: 2,
                                      fontWeight: 500,
                                      px: 2,
                                      py: 0.5,
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleStatusChange(enrollment._id, 'rejected')}
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
                              {enrollment.status === 'approved' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleOpenAssignSection(enrollment)}
                                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 500, px: 2, py: 0.5 }}
                                >
                                  Assign Section
                                </Button>
                              )}
                              {(enrollment.status === 'enrolled' || enrollment.status === 'rejected') && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  startIcon={<ArchiveIcon />}
                                  onClick={() => handleArchive(enrollment._id)}
                                  sx={{ 
                                    textTransform: 'none', 
                                    borderRadius: 2, 
                                    fontWeight: 500, 
                                    px: 2, 
                                    py: 0.5,
                                    borderColor: 'orange',
                                    color: 'orange',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                      borderColor: 'darkorange',
                                    }
                                  }}
                                >
                                  Archive
                                </Button>
                              )}
                            </Box>
                          </TableCell>
        {/* Assign Section Modal */}
        <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Section</DialogTitle>
          <DialogContent>
            {sectionFetchError ? (
              <Alert severity="info" sx={{ mb: 2 }}>{sectionFetchError}</Alert>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select a section for <b>{selectedEnrollmentForSection?.firstName} {selectedEnrollmentForSection?.surname}</b> ({selectedEnrollmentForSection?.gradeToEnroll || selectedEnrollmentForSection?.gradeLevel})
                </Typography>
                <Select
                  fullWidth
                  value={selectedSectionId}
                  onChange={e => setSelectedSectionId(e.target.value)}
                  displayEmpty
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="" disabled>Select section</MenuItem>
                  {availableSections.map(section => (
                    <MenuItem key={section._id} value={section._id}>{section.name} (Adviser: {section.adviser})</MenuItem>
                  ))}
                </Select>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAssignDialog} disabled={assigning}>Cancel</Button>
            <Button onClick={handleAssignSection} variant="contained" disabled={!selectedSectionId || assigning || !!sectionFetchError}>
              {assigning ? <CircularProgress size={20} color="inherit" /> : 'Assign'}
            </Button>
          </DialogActions>
        </Dialog>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
                  component="div"
                  count={filteredEnrollments.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </Paper>
          </>
        )}

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

        {/* Enrollment Details Dialog */}
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
              backgroundColor: '#4caf50',
              color: 'white',
              py: 3,
              px: 4,
            }}
          >
            <Typography variant="h5" fontWeight="600">
              Enrollment Application Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 4, maxHeight: '70vh', overflowY: 'auto' }}>
            {enrollmentDetails && (
              <Grid container spacing={3}>
                {/* Student Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Student Information</Typography>
                  <Typography><b>Learner Reference Number:</b> {enrollmentDetails.learnerReferenceNumber || ''}</Typography>
                  <Typography><b>Surname:</b> {enrollmentDetails.surname || ''}</Typography>
                  <Typography><b>First Name:</b> {enrollmentDetails.firstName || ''}</Typography>
                  <Typography><b>Middle Name:</b> {enrollmentDetails.middleName || ''}</Typography>
                  <Typography><b>Extension:</b> {enrollmentDetails.extension || ''}</Typography>
                  <Typography><b>Date of Birth:</b> {formatDateYMD(enrollmentDetails.dateOfBirth)}</Typography>
                  <Typography><b>Place of Birth:</b> {enrollmentDetails.placeOfBirth || ''}</Typography>
                  <Typography><b>Sex:</b> {enrollmentDetails.sex || ''}</Typography>
                  <Typography><b>Age:</b> {calculateAgeFromDOB(enrollmentDetails.dateOfBirth)}</Typography>
                  <Typography><b>Religion:</b> {enrollmentDetails.religion || ''}</Typography>
                  <Typography><b>Citizenship:</b> {enrollmentDetails.citizenship || ''}</Typography>
                </Grid>
                {/* Address Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Address Information</Typography>
                  <Typography><b>House Number:</b> {enrollmentDetails.houseNumber || ''}</Typography>
                  <Typography><b>Street:</b> {enrollmentDetails.street || ''}</Typography>
                  <Typography><b>Barangay:</b> {enrollmentDetails.barangay || ''}</Typography>
                  <Typography><b>City:</b> {enrollmentDetails.city || ''}</Typography>
                  <Typography><b>Province:</b> {enrollmentDetails.province || ''}</Typography>
                  <Typography><b>Zip Code:</b> {enrollmentDetails.zipCode || ''}</Typography>
                </Grid>
                {/* Contact Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Contact Information</Typography>
                  <Typography><b>Contact Number:</b> {enrollmentDetails.contactNumber || ''}</Typography>
                  <Typography><b>Email Address:</b> {enrollmentDetails.user?.email || enrollmentDetails.emailAddress || ''}</Typography>
                </Grid>
                {/* Previous School Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Previous School Information</Typography>
                  <Typography><b>Last School Attended:</b> {enrollmentDetails.lastSchoolAttended || ''}</Typography>
                  <Typography><b>School Address:</b> {enrollmentDetails.schoolAddress || ''}</Typography>
                  <Typography><b>Grade Level:</b> {enrollmentDetails.gradeLevel || ''}</Typography>
                  <Typography><b>School Year:</b> {enrollmentDetails.schoolYear || ''}</Typography>
                </Grid>
                {/* Parent/Guardian Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Parent/Guardian Information</Typography>
                  <Typography><b>Father's Name:</b> {enrollmentDetails.fatherName || ''}</Typography>
                  <Typography><b>Father's Occupation:</b> {enrollmentDetails.fatherOccupation || ''}</Typography>
                  <Typography><b>Father's Contact Number:</b> {enrollmentDetails.fatherContactNumber || ''}</Typography>
                  <Typography><b>Mother's Name:</b> {enrollmentDetails.motherName || ''}</Typography>
                  <Typography><b>Mother's Occupation:</b> {enrollmentDetails.motherOccupation || ''}</Typography>
                  <Typography><b>Mother's Contact Number:</b> {enrollmentDetails.motherContactNumber || ''}</Typography>
                  <Typography><b>Guardian's Name:</b> {enrollmentDetails.guardianName || ''}</Typography>
                  <Typography><b>Guardian's Relationship:</b> {enrollmentDetails.guardianRelationship || ''}</Typography>
                  <Typography><b>Guardian's Occupation:</b> {enrollmentDetails.guardianOccupation || ''}</Typography>
                  <Typography><b>Guardian's Contact Number:</b> {enrollmentDetails.guardianContactNumber || ''}</Typography>
                </Grid>
                {/* Emergency Contact */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Emergency Contact</Typography>
                  <Typography><b>Name:</b> {enrollmentDetails.emergencyContactName || ''}</Typography>
                  <Typography><b>Relationship:</b> {enrollmentDetails.emergencyContactRelationship || ''}</Typography>
                  <Typography><b>Contact Number:</b> {enrollmentDetails.emergencyContactNumber || ''}</Typography>
                  <Typography><b>Address:</b> {enrollmentDetails.emergencyContactAddress || ''}</Typography>
                </Grid>
                {/* Enrollment Details */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Enrollment Details</Typography>
                  <Typography><b>Enrollment Type:</b> {enrollmentDetails.enrollmentType || ''}</Typography>
                  <Typography><b>Grade to Enroll:</b> {enrollmentDetails.gradeToEnroll || ''}</Typography>
                  <Typography><b>Track:</b> {getTrackDisplay(enrollmentDetails.gradeToEnroll || enrollmentDetails.gradeLevel, enrollmentDetails.track)}</Typography>
                  <Typography><b>Section:</b> {enrollmentDetails.section || ''}</Typography>
                  <Typography><b>Status:</b> {enrollmentDetails.status || ''}</Typography>
                  <Typography><b>Application Date:</b> {enrollmentDetails.createdAt ? new Date(enrollmentDetails.createdAt).toLocaleDateString() : ''}</Typography>
                </Grid>
                {/* Documents */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Documents</Typography>
                  {/* Form 137 */}
                  <Typography>
                    <b>Form 137:</b> {enrollmentDetails.form137File ? (
                      (() => {
                        const fileName = enrollmentDetails.form137File.split(/[/\\]/).pop();
                        return (
                          <a href={`http://localhost:5000/uploads/enrollments/${fileName}`} target="_blank" rel="noopener noreferrer">View</a>
                        );
                      })()
                    ) : 'Not Submitted'}
                  </Typography>
                  {/* Form 138 */}
                  <Typography>
                    <b>Form 138:</b> {enrollmentDetails.form138File ? (
                      (() => {
                        const fileName = enrollmentDetails.form138File.split(/[/\\]/).pop();
                        return (
                          <a href={`http://localhost:5000/uploads/enrollments/${fileName}`} target="_blank" rel="noopener noreferrer">View</a>
                        );
                      })()
                    ) : 'Not Submitted'}
                  </Typography>
                  {/* Good Moral */}
                  <Typography>
                    <b>Good Moral:</b> {enrollmentDetails.goodMoralFile ? (
                      (() => {
                        const fileName = enrollmentDetails.goodMoralFile.split(/[/\\]/).pop();
                        return (
                          <a href={`http://localhost:5000/uploads/enrollments/${fileName}`} target="_blank" rel="noopener noreferrer">View</a>
                        );
                      })()
                    ) : 'Not Submitted'}
                  </Typography>
                  {/* Medical Certificate */}
                  <Typography>
                    <b>Medical Certificate:</b> {enrollmentDetails.medicalCertificateFile ? (
                      (() => {
                        const fileName = enrollmentDetails.medicalCertificateFile.split(/[/\\]/).pop();
                        return (
                          <a href={`http://localhost:5000/uploads/enrollments/${fileName}`} target="_blank" rel="noopener noreferrer">View</a>
                        );
                      })()
                    ) : 'Not Submitted'}
                  </Typography>
                  {/* Parent/Guardian ID */}
                  <Typography>
                    <b>Parent/Guardian ID:</b> {enrollmentDetails.parentIdFile ? (
                      (() => {
                        const fileName = enrollmentDetails.parentIdFile.split(/[/\\]/).pop();
                        return (
                          <a href={`http://localhost:5000/uploads/enrollments/${fileName}`} target="_blank" rel="noopener noreferrer">View</a>
                        );
                      })()
                    ) : 'Not Submitted'}
                  </Typography>
                  {/* ID Pictures */}
                  <Typography>
                    <b>ID Pictures:</b> {enrollmentDetails.idPicturesFile ? (
                      (() => {
                        const fileName = enrollmentDetails.idPicturesFile.split(/[/\\]/).pop();
                        return (
                          <a href={`http://localhost:5000/uploads/enrollments/${fileName}`} target="_blank" rel="noopener noreferrer">View</a>
                        );
                      })()
                    ) : 'Not Submitted'}
                  </Typography>
                </Grid>
                {/* Additional Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Additional Information</Typography>
                  <Typography><b>Special Needs:</b> {enrollmentDetails.specialNeeds || ''}</Typography>
                  <Typography><b>Allergies:</b> {enrollmentDetails.allergies || ''}</Typography>
                  <Typography><b>Medications:</b> {enrollmentDetails.medications || ''}</Typography>
                </Grid>
              </Grid>
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
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#388e3c',
                },
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
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
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
              Reject Enrollment Application
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please provide a reason for rejecting this enrollment application:
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
              onClick={handleRejectEnrollment}
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
              {updating ? <CircularProgress size={20} color="inherit" /> : 'Reject Application'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Section Modal */}
        <Dialog 
          open={assignDialogOpen} 
          onClose={handleCloseAssignDialog}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              minHeight: '400px',
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: '#5c67f2',
              color: 'white',
              py: 3,
              px: 4,
            }}
          >
            <Typography variant="h5" component="span" fontWeight="600">
              Assign Section
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {selectedEnrollmentForSection?.studentName} - Grade {selectedEnrollmentForSection?.gradeLevel}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {sectionFetchError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {sectionFetchError}
              </Alert>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Select a section for this student:
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&.Mui-focused': { color: 'white' }
                    }}
                  >
                    Section
                  </InputLabel>
                  <Select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    label="Section"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  >
                    {availableSections.map((section) => (
                      <MenuItem key={section._id} value={section._id}>
                        {section.name} (Capacity: {section.capacity})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {availableSections.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No sections available for Grade {selectedEnrollmentForSection?.gradeLevel}. 
                    Please create a section first.
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Button 
              onClick={handleCloseAssignDialog}
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
              onClick={handleAssignSection}
              variant="contained"
              disabled={assigning || !selectedSectionId}
              sx={{ 
                ml: 2,
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #21CBF3, #2196F3)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {assigning ? <CircularProgress size={20} color="inherit" /> : 'Assign Section'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default EnrollmentAdminDashboard;
