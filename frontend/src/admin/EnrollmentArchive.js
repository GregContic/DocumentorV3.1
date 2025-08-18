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
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Fade,
  Slide,
  Avatar,
  Stack,
  Badge,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Info as InfoIcon,
  Archive as ArchiveIcon,
  School as EnrollmentIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Grade as GradeIcon,
  Class as SectionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { enrollmentService } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const EnrollmentArchive = () => {
  const [archivedEnrollments, setArchivedEnrollments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchArchivedEnrollments();
  }, []);

  const fetchArchivedEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching archived enrollments...');
      const response = await enrollmentService.getArchivedEnrollments();
      console.log('Archived enrollments response:', response);
      setArchivedEnrollments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching archived enrollments:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load archived enrollments. Please ensure the server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreEnrollment = async (enrollmentId) => {
    try {
      await enrollmentService.restoreEnrollment(enrollmentId);
      setSuccessMessage('Enrollment restored successfully!');
      fetchArchivedEnrollments();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Error restoring enrollment:', error);
      setError('Failed to restore enrollment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEnrollment(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter enrollments
  const filteredEnrollments = archivedEnrollments.filter(enrollment => {
    const studentName = `${enrollment.firstName || ''} ${enrollment.surname || ''}`.toLowerCase();
    const email = (enrollment.user?.email || enrollment.emailAddress || '').toLowerCase();
    const enrollmentNumber = (enrollment.enrollmentNumber || '').toLowerCase();
    const gradeLevel = (enrollment.gradeToEnroll || '').toLowerCase();
    const section = (enrollment.section || '').toLowerCase();
    const status = (enrollment.status || '').toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();
    
    return studentName.includes(searchLower) ||
           email.includes(searchLower) ||
           enrollmentNumber.includes(searchLower) ||
           gradeLevel.includes(searchLower) ||
           section.includes(searchLower) ||
           status.includes(searchLower);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'enrolled': return 'primary';
      case 'under-review': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      case 'enrolled': return <SchoolIcon />;
      case 'under-review': return <InfoIcon />;
      case 'archived': return <ArchiveIcon />;
      default: return <InfoIcon />;
    }
  };

  const renderEnrollmentTable = () => (
    <Fade in timeout={300}>
      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'success.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <EnrollmentIcon />
            </Avatar>
            <Typography variant="h6" fontWeight="600">
              Archived Enrollments
            </Typography>
            <Badge 
              badgeContent={filteredEnrollments.length} 
              color="secondary"
              sx={{ ml: 'auto' }}
            />
          </Box>
          <TextField
            fullWidth
            placeholder="Search by student name, email, enrollment number, grade, or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid rgba(255,255,255,0.3)',
                },
                '& input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              m: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
          >
            {error}
          </Alert>
        ) : filteredEnrollments.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <ArchiveIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Archived Enrollments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No enrollments match your search criteria.' : 'No enrollments have been archived yet.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Enrollment #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Student Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Grade Level
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Section
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Archived Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEnrollments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((enrollment, index) => {
                      const studentName = `${enrollment.firstName || ''} ${enrollment.surname || ''}`.trim();
                      const email = enrollment.user?.email || enrollment.emailAddress || 'N/A';
                      return (
                        <TableRow 
                          key={enrollment._id} 
                          hover
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(76, 175, 80, 0.04)',
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'rgba(0,0,0,0.02)',
                            },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={enrollment.enrollmentNumber}
                              size="small"
                              variant="outlined"
                              sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {studentName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {studentName || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GradeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2" fontWeight={500}>
                                {enrollment.gradeToEnroll || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SectionIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                              <Typography variant="body2" fontWeight={500}>
                                {enrollment.section || 'Not Assigned'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={enrollment.status} 
                              color={getStatusColor(enrollment.status)}
                              icon={getStatusIcon(enrollment.status)}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                borderRadius: 2,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {enrollment.archivedAt ? new Date(enrollment.archivedAt).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details" arrow>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<ViewIcon />}
                                  onClick={() => handleViewDetails(enrollment)}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    backgroundColor: 'success.main',
                                    '&:hover': {
                                      backgroundColor: 'success.dark',
                                      transform: 'translateY(-1px)',
                                      boxShadow: 3,
                                    },
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                              <Tooltip title="Restore Enrollment" arrow>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRestoreEnrollment(enrollment._id)}
                                  sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    color: '#4caf50',
                                    '&:hover': {
                                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                                      transform: 'translateY(-1px)',
                                    },
                                  }}
                                >
                                  <RestoreIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
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
              count={filteredEnrollments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid rgba(0,0,0,0.1)',
                bgcolor: '#f8fafc',
              }}
            />
          </>
        )}
      </Paper>
    </Fade>
  );

  const renderDetailsDialog = () => (
    <Dialog 
      open={dialogOpen} 
      onClose={handleCloseDialog} 
      maxWidth="lg" 
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: 'success.main',
          color: 'white',
          py: 3,
          px: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <EnrollmentIcon />
          </Avatar>
          <Typography variant="h5" fontWeight="600">
            Enrollment Details
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {selectedEnrollment && (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                  Student Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Enrollment Number
                  </Typography>
                  <Chip
                    label={selectedEnrollment.enrollmentNumber}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Student Name
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body1" fontWeight={500}>
                      {`${selectedEnrollment.firstName || ''} ${selectedEnrollment.middleName || ''} ${selectedEnrollment.surname || ''}`.trim()}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedEnrollment.user?.email || selectedEnrollment.emailAddress || 'N/A'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Grade Level to Enroll
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedEnrollment.gradeToEnroll || 'N/A'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Section
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedEnrollment.section || 'Not Assigned'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedEnrollment.status} 
                    color={getStatusColor(selectedEnrollment.status)}
                    icon={getStatusIcon(selectedEnrollment.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedEnrollment.dateOfBirth ? new Date(selectedEnrollment.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Contact Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedEnrollment.contactNumber || 'N/A'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Archive Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Archived At: {selectedEnrollment.archivedAt ? new Date(selectedEnrollment.archivedAt).toLocaleString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Archived By: {selectedEnrollment.archivedBy ? `${selectedEnrollment.archivedBy.firstName} ${selectedEnrollment.archivedBy.lastName}` : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              
              {selectedEnrollment.reviewNotes && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Review Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedEnrollment.reviewNotes}
                    </Typography>
                  </Card>
                </Grid>
              )}
              
              {selectedEnrollment.rejectionReason && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Rejection Reason
                    </Typography>
                    <Typography variant="body1">
                      {selectedEnrollment.rejectionReason}
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button 
          onClick={handleCloseDialog}
          variant="contained"
          sx={{ 
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <AdminLayout title="Enrollment Archive">
      <Container maxWidth="xl">
        {/* Header Section */}
        <Fade in timeout={600}>
          <Card 
            sx={{
              mb: 4, 
              backgroundColor: 'success.main',
              color: 'white',
              borderRadius: 4,
              boxShadow: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  mr: 3, 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: 28 
                }}>
                  <ArchiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3" component="h1" fontWeight="700" gutterBottom>
                    Enrollment Archive
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    View and manage archived enrollment applications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Success Message */}
        {successMessage && (
          <Fade in timeout={300}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-icon': { fontSize: 24 }
              }}
            >
              {successMessage}
            </Alert>
          </Fade>
        )}

        {/* Table Content */}
        {renderEnrollmentTable()}
        {renderDetailsDialog()}
      </Container>
    </AdminLayout>
  );
};

export default EnrollmentArchive;
