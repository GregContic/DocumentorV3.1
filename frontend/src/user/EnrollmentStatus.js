import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { enrollmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EnrollmentConfirmationDownload from '../components/PDFTemplates/EnrollmentConfirmationPDF';
import QRCodeGenerator from '../components/QRCodeGenerator';

const EnrollmentStatus = () => {
  const [loading, setLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [hasEnrollment, setHasEnrollment] = useState(false);
  const [error, setError] = useState('');
  const [adviser, setAdviser] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchEnrollmentStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchEnrollmentStatus = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getMyEnrollmentStatus();
      setHasEnrollment(response.data.hasEnrollment);
      if (response.data.hasEnrollment) {
        setEnrollmentData(response.data.enrollment);
        // If enrolled and has section, fetch adviser
        if (response.data.enrollment.status === 'enrolled' && response.data.enrollment.section) {
          fetchSectionAdviser(response.data.enrollment.section, response.data.enrollment.gradeToEnroll);
        } else {
          setAdviser('');
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment status:', error);
      setError('Failed to load enrollment status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch adviser for the assigned section
  const fetchSectionAdviser = async (sectionName, gradeToEnroll) => {
    try {
      // Always use the "Grade X" format for gradeLevel
      let gradeLevel = gradeToEnroll;
      if (!/^Grade /.test(gradeLevel)) {
        gradeLevel = `Grade ${gradeLevel}`;
      }
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/sections/grade/${encodeURIComponent(gradeLevel)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        // Find the section with the matching name
        const found = data.find(s => s.name.trim() === sectionName.trim());
        setAdviser(found && found.adviser ? found.adviser : '');
      } else {
        setAdviser('');
      }
    } catch {
      setAdviser('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under-review': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'enrolled': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ScheduleIcon />;
      case 'under-review': return <ScheduleIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      case 'enrolled': return <CheckCircleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const steps = ['Application Submitted', 'Under Review', 'Decision Made', 'Enrollment Complete'];

  const getActiveStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'under-review': return 1;
      case 'approved': return 2;
      case 'enrolled': return 3;
      case 'rejected': return 2;
      default: return 0;
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to view your enrollment status.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchEnrollmentStatus}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Enrollment Status
      </Typography>

      {!hasEnrollment ? (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Enrollment Application Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't submitted an enrollment application yet. Start your enrollment process now.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<SchoolIcon />}
              onClick={() => navigate('/enrollment')}
            >
              Start Enrollment Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status Overview */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Enrollment Application #{enrollmentData.enrollmentNumber}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      icon={getStatusIcon(enrollmentData.status)}
                      label={enrollmentData.status.replace('-', ' ').toUpperCase()}
                      color={getStatusColor(enrollmentData.status)}
                      size="medium"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Applied on {new Date(enrollmentData.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={fetchEnrollmentStatus}
                    startIcon={<ScheduleIcon />}
                  >
                    Refresh Status
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Progress Stepper */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Application Progress
              </Typography>
              <Stepper activeStep={getActiveStep(enrollmentData.status)} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label} completed={index < getActiveStep(enrollmentData.status)}>
                    <StepLabel 
                      error={enrollmentData.status === 'rejected' && index === 2}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Status Details */}
          {enrollmentData.status === 'rejected' && (enrollmentData.rejectionReason || enrollmentData.reviewNotes) && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Application Rejected
              </Typography>
              {enrollmentData.rejectionReason && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Reason:</strong> {enrollmentData.rejectionReason}
                </Typography>
              )}
              {enrollmentData.reviewNotes && (
                <Typography variant="body2">
                  <strong>Additional Notes:</strong> {enrollmentData.reviewNotes}
                </Typography>
              )}
              {enrollmentData.reviewedAt && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Reviewed on {new Date(enrollmentData.reviewedAt).toLocaleString()}
                </Typography>
              )}
            </Alert>
          )}

          {enrollmentData.status === 'approved' && (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Application Approved!
                </Typography>
                <Typography variant="body2">
                  Congratulations! Your enrollment application has been approved. Please wait for further instructions or contact the school for next steps.
                </Typography>
                {enrollmentData.reviewNotes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Notes: {enrollmentData.reviewNotes}
                  </Typography>
                )}
              </Alert>

              {/* QR Code for Verification */}
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Verification Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Show this QR code during enrollment or verification
                  </Typography>
                  <QRCodeGenerator 
                    data={{
                      enrollmentId: enrollmentData._id,
                      enrollmentNumber: enrollmentData.enrollmentNumber,
                      studentName: `${enrollmentData.firstName} ${enrollmentData.surname}`,
                      lrn: enrollmentData.learnerReferenceNumber,
                      gradeLevel: enrollmentData.gradeToEnroll,
                      status: enrollmentData.status,
                      approvedDate: enrollmentData.reviewedAt
                    }}
                    size={200}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Enrollment #: {enrollmentData.enrollmentNumber}
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}

          {enrollmentData.status === 'enrolled' && (
            <Alert severity="success" sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Successfully Enrolled!
              </Typography>
              <Typography variant="body2">
                Welcome! You are now officially enrolled. Check your school email for class schedules and other important information.
              </Typography>
              {enrollmentData.section && (
                <>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Assigned Section:</strong> {enrollmentData.section}
                  </Typography>
                  {adviser && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Adviser:</strong> {adviser}
                    </Typography>
                  )}
                </>
              )}
            </Alert>
          )}

          {/* Application Details */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Application Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Student Name"
                        secondary={`${enrollmentData.firstName} ${enrollmentData.middleName || ''} ${enrollmentData.surname}`.trim()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="LRN"
                        secondary={enrollmentData.learnerReferenceNumber}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Grade to Enroll"
                        secondary={`Grade ${enrollmentData.gradeToEnroll} - ${enrollmentData.track || 'N/A'}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <ContactIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Contact Number"
                        secondary={enrollmentData.contactNumber}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary={`${enrollmentData.barangay}, ${enrollmentData.city}, ${enrollmentData.province}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Updated"
                        secondary={new Date(enrollmentData.updatedAt).toLocaleString()}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              {enrollmentData.status === 'rejected' && (
                <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/enrollment')}
                    startIcon={<SchoolIcon />}
                  >
                    Submit New Application
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default EnrollmentStatus;
