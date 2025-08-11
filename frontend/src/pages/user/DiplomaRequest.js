import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DatePickerWrapper, DatePicker, TimePicker } from '../../components/DatePickerWrapper';
import { formatDate, addDaysToDate, isWeekendDay } from '../../utils/dateUtils';
import { documentService } from '../../services/api';
import AIDocumentUploader from '../../components/AIDocumentUploader';
import AIAssistantCard from '../../components/AIAssistantCard';

const DiplomaRequest = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);  const [formData, setFormData] = useState({
    documentType: 'High School Diploma',
    purpose: '',
    studentNumber: '',
    yearGraduated: '',
    fullName: '',
    preferredPickupDate: null,
    preferredPickupTime: null,
    additionalNotes: '',
  });  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAIUploader, setShowAIUploader] = useState(false);

  const requirements = [
    'Valid School ID or Any Valid Government ID',
    'Request Form (will be provided)',
    'Clearance Form',
    'Proof of Payment',
  ];

  const steps = ['Personal Details', 'Graduation Information', 'Schedule Pickup', 'Review & Submit'];

  const validateStep = (stepIndex) => {
    const newErrors = {};

    switch (stepIndex) {
      case 0:
        if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
        if (!formData.studentNumber.trim()) newErrors.studentNumber = 'Student number is required';
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        break;
      case 1:
        if (!formData.yearGraduated.trim()) newErrors.yearGraduated = 'Year graduated is required';
        break;
      case 2:
        if (!formData.preferredPickupDate) newErrors.preferredPickupDate = 'Pickup date is required';
        if (!formData.preferredPickupTime) newErrors.preferredPickupTime = 'Pickup time is required';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      await documentService.createRequest(formData);
      setShowSuccess(true);
      // Reset form
      setFormData({
        documentType: 'High School Diploma',
        purpose: '',
        studentNumber: '',
        yearGraduated: '',
        fullName: '',
        preferredPickupDate: null,
        preferredPickupTime: null,
        additionalNotes: '',
      });
      setActiveStep(0);
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage('Failed to submit request. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // AI Document Assistant handler
  const handleAIDataExtracted = (extractedData) => {
    if (extractedData) {
      const updatedFormData = { ...formData };
      
      // Map extracted data to form fields
      if (extractedData.personalInfo) {
        if (extractedData.personalInfo.firstName && extractedData.personalInfo.lastName) {
          const fullName = `${extractedData.personalInfo.firstName} ${extractedData.personalInfo.middleName || ''} ${extractedData.personalInfo.lastName}`.trim();
          updatedFormData.fullName = fullName;
        }
      }
      
      if (extractedData.academicInfo) {
        if (extractedData.academicInfo.studentNumber) updatedFormData.studentNumber = extractedData.academicInfo.studentNumber;
        if (extractedData.academicInfo.yearGraduated) updatedFormData.yearGraduated = extractedData.academicInfo.yearGraduated;
      }
      
      setFormData(updatedFormData);
      setShowAIUploader(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Details
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fill out your personal information below. You can use our AI assistant to automatically extract information from document images.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Full Name (as it appears on diploma)"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Student Number"
                value={formData.studentNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, studentNumber: e.target.value }))}
                error={!!errors.studentNumber}
                helperText={errors.studentNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Purpose of Request"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                error={!!errors.purpose}
                helperText={errors.purpose}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Graduation Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Year Graduated"
                value={formData.yearGraduated}
                onChange={(e) => setFormData(prev => ({ ...prev, yearGraduated: e.target.value }))}
                error={!!errors.yearGraduated}
                helperText={errors.yearGraduated}
                placeholder="e.g., 2024"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <DatePickerWrapper>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Schedule Pickup
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Preferred Pickup Date"
                  value={formData.preferredPickupDate}
                  onChange={(newDate) => {
                    setFormData(prev => ({
                      ...prev,
                      preferredPickupDate: newDate
                    }));
                  }}
                  shouldDisableDate={isWeekendDay}
                  minDate={new Date()}
                  maxDate={addDaysToDate(new Date(), 30)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.preferredPickupDate,
                      helperText: errors.preferredPickupDate
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Preferred Pickup Time"
                  value={formData.preferredPickupTime}
                  onChange={(newTime) => {
                    if (newTime) {
                      // Set time to exact hours only (no minutes)
                      newTime.setMinutes(0);
                      setFormData(prev => ({
                        ...prev,
                        preferredPickupTime: newTime
                      }));
                    }
                  }}
                  minTime={new Date(0, 0, 0, 8)} // 8 AM
                  maxTime={new Date(0, 0, 0, 15)} // 3 PM
                  minutesStep={60}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.preferredPickupTime,
                      helperText: errors.preferredPickupTime
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DatePickerWrapper>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Your Request
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Document Type"
                    secondary={formData.documentType}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Student Information"
                    secondary={`${formData.fullName} (${formData.studentNumber})`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Purpose"
                    secondary={formData.purpose}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Graduation Year"
                    secondary={formData.yearGraduated}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Pickup Schedule"
                    secondary={`Date: ${formData.preferredPickupDate ? formData.preferredPickupDate.toLocaleDateString() : 'Not set'}, Time: ${formData.preferredPickupTime ? formData.preferredPickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Not set'}`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Request High School Diploma
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Fill out the form below to request your High School Diploma. Please ensure you have completed all clearances.
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
                disabled={loading}
              >
                Submit Request
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            )}
          </Box>
        </form>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Requirements
          </Typography>
          <List>
            {requirements.map((req, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={req} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Request submitted successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* AI Document Assistant */}
      {showAIUploader && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0, 0, 0, 0.5)', 
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}>
          <Box sx={{ 
            maxWidth: 800, 
            width: '100%', 
            maxHeight: '90vh', 
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3
          }}>
            <AIDocumentUploader
              onDataExtracted={handleAIDataExtracted}
              formData={formData}
              setFormData={setFormData}
            />
            <Button
              onClick={() => setShowAIUploader(false)}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Close
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default DiplomaRequest;
