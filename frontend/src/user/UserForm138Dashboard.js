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
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Form138StubPDF from '../components/PDFTemplates/Form138StubPDF';
import { form138StubService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserForm138Dashboard = () => {
  const [stubs, setStubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Status labels for Form 138 stub system
  const statusLabels = {
    'stub-generated': 'Stub Generated',
    'submitted-to-registrar': 'Submitted to Registrar',
    'verified-by-registrar': 'Verified by Registrar',
    'processing': 'Processing Document',
    'ready-for-pickup': 'Ready for Pickup',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };

  const statusColors = {
    'stub-generated': 'info',
    'submitted-to-registrar': 'warning',
    'verified-by-registrar': 'primary',
    'processing': 'secondary',
    'ready-for-pickup': 'success',
    'completed': 'default',
    'cancelled': 'error'
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'stub-generated':
        return <QrCodeIcon />;
      case 'submitted-to-registrar':
        return <AssignmentIcon />;
      case 'verified-by-registrar':
        return <CheckCircleIcon />;
      case 'processing':
        return <ScheduleIcon />;
      case 'ready-for-pickup':
        return <SchoolIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <RadioButtonUncheckedIcon />;
      default:
        return <RadioButtonUncheckedIcon />;
    }
  };

  useEffect(() => {
    fetchUserStubs();
  }, []);

  const fetchUserStubs = async () => {
    try {
      setLoading(true);
      const response = await form138StubService.getUserStubs();
      setStubs(response.data.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching Form 138 stubs:', error);
      setError('Failed to fetch your Form 138 stubs');
    } finally {
      setLoading(false);
    }
  };

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

  const getStepIndex = (status) => {
    const steps = ['stub-generated', 'submitted-to-registrar', 'verified-by-registrar', 'processing', 'ready-for-pickup', 'completed'];
    return steps.indexOf(status);
  };

  const getActiveStep = (status) => {
    const stepIndex = getStepIndex(status);
    return stepIndex === -1 ? 0 : stepIndex;
  };

  const isStepCompleted = (stepIndex, currentStatus) => {
    const currentStepIndex = getStepIndex(currentStatus);
    return stepIndex < currentStepIndex || currentStatus === 'completed';
  };

  const renderStubCard = (stub) => (
    <Card key={stub._id} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Form 138 Request - {stub.stubCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Student: {stub.firstName} {stub.middleName} {stub.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Grade Level: {stub.gradeLevel} ({stub.schoolYear})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Purpose: {stub.purpose}
            </Typography>
          </Box>
          <Chip
            label={statusLabels[stub.status] || stub.status}
            color={statusColors[stub.status] || 'default'}
            icon={getStatusIcon(stub.status)}
          />
        </Box>

        {/* Status Stepper */}
        <Box sx={{ mt: 3, mb: 3 }}>
          <Stepper activeStep={getActiveStep(stub.status)} alternativeLabel>
            {[
              'Stub Generated',
              'Submitted to Registrar',
              'Verified by Registrar',
              'Processing Document',
              'Ready for Pickup',
              'Completed'
            ].map((label, index) => (
              <Step key={label} completed={isStepCompleted(index, stub.status)}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Student Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">LRN:</Typography>
            <Typography variant="body2" gutterBottom>{stub.lrn || 'N/A'}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Date of Birth:</Typography>
            <Typography variant="body2" gutterBottom>
              {stub.dateOfBirth ? new Date(stub.dateOfBirth).toLocaleDateString() : 'N/A'}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary">Address:</Typography>
            <Typography variant="body2" gutterBottom>
              {stub.barangay}, {stub.city}, {stub.province}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Section:</Typography>
            <Typography variant="body2" gutterBottom>{stub.section || 'N/A'}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Adviser:</Typography>
            <Typography variant="body2" gutterBottom>{stub.adviser || 'N/A'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Number of Copies:</Typography>
            <Typography variant="body2" gutterBottom>{stub.numberOfCopies || '1'}</Typography>
          </Grid>
        </Grid>

        {/* Parent/Guardian Information */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary">Parent/Guardian:</Typography>
        <Typography variant="body2" gutterBottom>{stub.parentName}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Contact: {stub.parentContact || 'N/A'}
        </Typography>

        {/* Timestamps */}
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Created:</Typography>
            <Typography variant="body2" gutterBottom>{formatDate(stub.createdAt)}</Typography>
          </Grid>
          {stub.verifiedAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Verified:</Typography>
              <Typography variant="body2" gutterBottom>{formatDate(stub.verifiedAt)}</Typography>
            </Grid>
          )}
          {stub.readyAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Ready for Pickup:</Typography>
              <Typography variant="body2" gutterBottom>{formatDate(stub.readyAt)}</Typography>
            </Grid>
          )}
          {stub.completedAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Completed:</Typography>
              <Typography variant="body2" gutterBottom>{formatDate(stub.completedAt)}</Typography>
            </Grid>
          )}
        </Grid>

        {/* Registrar Notes */}
        {stub.registrarNotes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">Registrar Notes:</Typography>
            <Typography variant="body2" gutterBottom>{stub.registrarNotes}</Typography>
          </>
        )}

        {/* Actions */}
        <Box display="flex" gap={2} mt={3}>
          <PDFDownloadLink
            document={<Form138StubPDF stubData={stub} />}
            fileName={`Form138_Stub_${stub.stubCode}.pdf`}
          >
            {({ loading }) => (
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download Stub'}
              </Button>
            )}
          </PDFDownloadLink>

          {stub.qrCode && (
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              onClick={() => {
                const win = window.open();
                win.document.write(`
                  <html>
                    <head><title>QR Code - ${stub.stubCode}</title></head>
                    <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                      <div style="text-align: center;">
                        <h2>Form 138 Stub QR Code</h2>
                        <p>Stub Code: ${stub.stubCode}</p>
                        <img src="${stub.qrCode}" alt="QR Code" style="max-width: 300px;" />
                      </div>
                    </body>
                  </html>
                `);
              }}
            >
              View QR Code
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Form 138 (Report Card) Requests
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track your Form 138 request stubs and download pickup documents.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            component="a"
            href="/request-form138"
            sx={{ mb: 3 }}
          >
            Request New Form 138
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : stubs.length === 0 ? (
          <Box textAlign="center" py={6}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Form 138 Requests Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You haven't submitted any Form 138 requests yet.
            </Typography>
            <Button variant="contained" component="a" href="/request-form138">
              Request Form 138
            </Button>
          </Box>
        ) : (
          <Box>
            {stubs.map(renderStubCard)}
          </Box>
        )}

        {/* Instructions */}
        <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Form 138 Request Process:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Submit your Form 138 request through the system"
                secondary="Fill out the required information and generate your request stub"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AssignmentIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Submit the generated stub to the School Registrar"
                secondary="Bring your printed stub and required documents to the registrar's office"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Wait for verification and processing"
                secondary="The registrar will verify your request and process your Form 138"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <QrCodeIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Collect your Form 138 when ready"
                secondary="Present your stub and QR code for verification during pickup"
              />
            </ListItem>
          </List>
        </Paper>
      </Paper>
    </Container>
  );
};

export default UserForm138Dashboard;
