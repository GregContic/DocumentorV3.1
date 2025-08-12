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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/material';
import {
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { documentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DocumentRequestWizard from '../components/DocumentRequestWizard';

const EnhancedUserRequestDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { user } = useAuth();

  const statusLabels = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'pending': 'Pending Review',
    'processing': 'Processing',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'completed': 'Completed',
    'ready-for-pickup': 'Ready for Pickup'
  };

  const statusColors = {
    'draft': 'default',
    'submitted': 'info',
    'pending': 'warning',
    'processing': 'primary',
    'approved': 'success',
    'rejected': 'error',
    'completed': 'success',
    'ready-for-pickup': 'secondary'
  };

  const documentTypeLabels = {
    'form137': 'Form 137 (Transfer Credentials)',
    'form138': 'Form 138 (Report Card)',
    'goodMoral': 'Certificate of Good Moral Character',
    'diploma': 'Diploma',
    'transcript': 'Transcript of Records'
  };

  const priorityLabels = {
    'low': 'Low Priority',
    'normal': 'Normal',
    'high': 'High Priority',
    'urgent': 'Urgent'
  };

  useEffect(() => {
    fetchUserRequests();
    
    // Set up auto-refresh if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchUserRequests, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const response = await documentService.getMyRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching user requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreated = (newRequest) => {
    setShowCreateDialog(false);
    fetchUserRequests();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return <ScheduleIcon />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'approved':
      case 'completed':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CheckCircleIcon color="error" />;
      case 'ready-for-pickup':
        return <QrCodeIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getProcessingProgress = (processingSteps) => {
    if (!processingSteps || processingSteps.length === 0) return 0;
    const completed = processingSteps.filter(step => step.status === 'completed').length;
    return (completed / processingSteps.length) * 100;
  };

  const getEstimatedTimeRemaining = (estimatedCompletionDate) => {
    if (!estimatedCompletionDate) return null;
    
    const now = new Date();
    const completion = new Date(estimatedCompletionDate);
    const diffTime = completion.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
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

  const getInstructions = (request) => {
    switch (request.status) {
      case 'submitted':
      case 'pending':
        return 'Your request is being reviewed by our admin team. You will be notified once it is processed.';
      case 'processing':
        return 'Your request is currently being processed. Check the progress below for updates.';
      case 'approved':
        return 'Your request has been approved and will be processed soon.';
      case 'rejected':
        return `Your request was rejected. Reason: ${request.rejectionReason || 'Not specified.'}`;
      case 'completed':
        return 'Your document is ready! You can now download it or pick it up from the school office.';
      case 'ready-for-pickup':
        return 'Your document is ready for pickup. Please visit the school office during business hours.';
      default:
        return '';
    }
  };

  const renderProcessingTimeline = (request) => {
    if (!request.processingSteps || request.processingSteps.length === 0) {
      return null;
    }

    return (
      <Timeline>
        {request.processingSteps.map((step, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
              {step.completedAt && formatDate(step.completedAt)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot 
                color={
                  step.status === 'completed' ? 'success' : 
                  step.status === 'in-progress' ? 'primary' : 
                  step.status === 'failed' ? 'error' : 'grey'
                }
              >
                {step.status === 'completed' && <CheckCircleIcon fontSize="small" />}
                {step.status === 'in-progress' && <CircularProgress size={16} />}
              </TimelineDot>
              {index < request.processingSteps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">
                {step.step}
              </Typography>
              <Typography color="text.secondary">
                Status: {step.status}
              </Typography>
              {step.notes && (
                <Typography variant="body2" color="text.secondary">
                  {step.notes}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Document Requests
        </Typography>
        <Box>
          <Tooltip title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}>
            <IconButton 
              onClick={() => setAutoRefresh(!autoRefresh)}
              color={autoRefresh ? 'primary' : 'default'}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{ ml: 2 }}
          >
            New Request
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Track the status of your document requests and get real-time updates on processing progress.
      </Typography>

      {requests.length === 0 ? (
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setShowCreateDialog(true)}
            >
              Create Request
            </Button>
          }
        >
          You don't have any document requests yet. Create your first request to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} key={request._id}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {documentTypeLabels[request.documentType] || request.documentType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Purpose: {request.purpose}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requested: {formatDate(request.createdAt)}
                    </Typography>
                    {request.estimatedCompletionDate && (
                      <Typography variant="body2" color="text.secondary">
                        Expected: {formatDate(request.estimatedCompletionDate)} 
                        ({getEstimatedTimeRemaining(request.estimatedCompletionDate)})
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                    <Chip
                      label={statusLabels[request.status]}
                      color={statusColors[request.status]}
                      icon={getStatusIcon(request.status)}
                    />
                    <Chip
                      label={priorityLabels[request.priority]}
                      size="small"
                      variant="outlined"
                    />
                    <IconButton 
                      onClick={() => setSelectedRequest(request)}
                      size="small"
                    >
                      <InfoIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Processing Progress */}
                {request.processingSteps && request.processingSteps.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Processing Progress ({Math.round(getProcessingProgress(request.processingSteps))}%)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProcessingProgress(request.processingSteps)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                {/* Current Status Information */}
                <Alert 
                  severity={
                    request.status === 'completed' ? 'success' : 
                    request.status === 'rejected' ? 'error' : 
                    request.status === 'processing' ? 'info' : 'info'
                  }
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2">
                    {getInstructions(request)}
                  </Typography>
                </Alert>

                {/* Review Notes */}
                {request.reviewNotes && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Admin Notes:</strong> {request.reviewNotes}
                    </Typography>
                  </Alert>
                )}

                {/* Action Buttons */}
                {request.status === 'completed' && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      size="small"
                    >
                      Download Document
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Request Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Document Request</DialogTitle>
        <DialogContent>
          <DocumentRequestWizard onRequestCreated={handleRequestCreated} />
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Request Details - {selectedRequest && documentTypeLabels[selectedRequest.documentType]}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" gutterBottom>Processing Timeline</Typography>
              {renderProcessingTimeline(selectedRequest)}
              
              {selectedRequest.extractedData && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>Extracted Information</Typography>
                  <Alert severity="info">
                    AI successfully extracted information from your uploaded documents.
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default EnhancedUserRequestDashboard;
