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
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Form137StubPDF from '../components/PDFTemplates/Form137StubPDF';
import { form137StubService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserForm137Dashboard = () => {
  const [stubs, setStubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Revised status flow for Form 137 appointment system
  const statusLabels = {
    'pending': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'stub-generated': 'Pickup Stub Generated',
    'completed': 'Completed',
  };

  const statusColors = {
    'pending': 'info',
    'approved': 'primary',
    'rejected': 'error',
    'stub-generated': 'success',
    'completed': 'success',
  };

  const statusSteps = [
    'pending',
    'approved',
    'stub-generated',
    'completed',
  ];

  useEffect(() => {
    fetchUserStubs();
  }, []);

  const fetchUserStubs = async () => {
    try {
      setLoading(true);
      const response = await form137StubService.getUserStubs();
      setStubs(response.data.data);
    } catch (error) {
      console.error('Error fetching user stubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveStep = (status) => {
    return statusSteps.indexOf(status);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'approved':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CheckCircleIcon color="error" />;
      case 'stub-generated':
        return <QrCodeIcon />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getInstructions = (status, stub) => {
    switch (status) {
      case 'pending':
        return 'Your request is pending admin approval. You will be notified once it is reviewed.';
      case 'approved':
        return `Your request has been approved. A pickup stub will be generated for your scheduled appointment: ${stub.pickupDate ? new Date(stub.pickupDate).toLocaleString() : ''}`;
      case 'rejected':
        return `Your request was rejected. Reason: ${stub.rejectionReason || 'Not specified.'}`;
      case 'stub-generated':
        return 'Your pickup stub is ready. Please present this stub and the letter from your receiving school on your scheduled pickup date.';
      case 'completed':
        return 'Your Form 137 pickup is completed. Thank you!';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Form 137 Requests
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track the status of your Form 137 transfer requests below.
      </Typography>

      {stubs.length === 0 ? (
        <Alert severity="info">
          You don't have any Form 137 requests yet. 
          <Button href="/user/form137-request" sx={{ ml: 1 }}>
            Create a new request
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {stubs.map((stub) => (
            <Grid item xs={12} key={stub._id}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {stub.stubCode ? `Stub Code: ${stub.stubCode}` : `Request Reference: ${stub._id}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Receiving School: {stub.receivingSchool}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requested: {formatDate(stub.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled Pickup: {stub.pickupDate ? formatDate(stub.pickupDate) : 'Not set'}
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                    <Chip
                      label={statusLabels[stub.status]}
                      color={statusColors[stub.status]}
                      icon={getStatusIcon(stub.status)}
                    />
                    {stub.status === 'stub-generated' && (
                      <PDFDownloadLink
                        document={<Form137StubPDF stubData={stub} />}
                        fileName={`Form137_Stub_${stub.stubCode}.pdf`}
                      >
                        {({ loading }) => (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
                            disabled={loading}
                          >
                            {loading ? 'Generating...' : 'Download Stub'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                  </Box>
                </Box>

                {/* Status Progress */}
                <Box mb={2}>
                  <Stepper activeStep={getActiveStep(stub.status)} orientation="horizontal">
                    {statusSteps.map((step, index) => (
                      <Step key={step} completed={getActiveStep(stub.status) > index}>
                        <StepLabel>
                          {statusLabels[step]}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                {/* Current Status Information */}
                <Alert 
                  severity={
                    stub.status === 'completed' ? 'success' : 
                    stub.status === 'rejected' ? 'error' : 
                    stub.status === 'stub-generated' ? 'success' : 'info'
                  }
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2">
                    {getInstructions(stub.status, stub)}
                  </Typography>
                </Alert>

                {/* Timeline of Events */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Request Timeline
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <QrCodeIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Request Submitted"
                          secondary={formatDate(stub.createdAt)}
                        />
                      </ListItem>
                      {stub.pickupDate && (
                        <>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <SchoolIcon color="info" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Pickup Scheduled"
                              secondary={formatDate(stub.pickupDate)}
                            />
                          </ListItem>
                        </>
                      )}
                      {stub.status === 'approved' && stub.approvedAt && (
                        <>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Request Approved"
                              secondary={formatDate(stub.approvedAt)}
                            />
                          </ListItem>
                        </>
                      )}
                      {stub.status === 'rejected' && stub.rejectedAt && (
                        <>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="error" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Request Rejected"
                              secondary={formatDate(stub.rejectedAt)}
                            />
                          </ListItem>
                        </>
                      )}
                      {stub.status === 'stub-generated' && stub.stubGeneratedAt && (
                        <>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <QrCodeIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Pickup Stub Generated"
                              secondary={formatDate(stub.stubGeneratedAt)}
                            />
                          </ListItem>
                        </>
                      )}
                      {stub.status === 'completed' && stub.completedAt && (
                        <>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Pickup Completed"
                              secondary={formatDate(stub.completedAt)}
                            />
                          </ListItem>
                        </>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UserForm137Dashboard;
