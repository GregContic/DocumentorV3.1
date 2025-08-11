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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Login as LoginIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DatePickerWrapper, DatePicker } from '../../components/DatePickerWrapper';
import { documentService } from '../../services/api';
import AIDocumentUploader from '../../components/AIDocumentUploader';
import AIAssistantCard from '../../components/AIAssistantCard';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const GoodMoralRequest = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    documentType: 'Certificate of Good Moral Character',
    // Student Information
    surname: '',
    givenName: '',
    middleName: '',
    sex: '',
    dateOfBirth: null,
    placeOfBirth: '',
    province: '',
    town: '',
    barrio: '',
    studentNumber: '',
    // Parent/Guardian Information
    parentGuardianName: '',
    parentGuardianAddress: '',
    parentGuardianOccupation: '',
    // Educational Information
    currentSchool: '',
    schoolAddress: '',
    yearGraduated: '',
    // Request Details
    purpose: '',
    preferredPickupDate: '',
    preferredPickupTime: '',
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAIUploader, setShowAIUploader] = useState(false);

  const steps = [
    'Personal Information',
    'Academic Information',
    'Request Details',
    'Review & Submit'
  ];

  const purposes = [
    'College Application',
    'Scholarship Application',
    'Job Application',
    'Volunteer Work',
    'Transfer to Another School',
    'Immigration Requirements',
    'Other'
  ];

  const pickupTimes = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM'
  ];

  // AI Document Assistant handler
  const handleAIDataExtracted = (extractedData) => {
    if (extractedData) {
      const updatedFormData = { ...formData };
      
      // Map extracted data to form fields
      if (extractedData.personalInfo) {
        if (extractedData.personalInfo.firstName) updatedFormData.givenName = extractedData.personalInfo.firstName;
        if (extractedData.personalInfo.lastName) updatedFormData.surname = extractedData.personalInfo.lastName;
        if (extractedData.personalInfo.middleName) updatedFormData.middleName = extractedData.personalInfo.middleName;
        if (extractedData.personalInfo.dateOfBirth) updatedFormData.dateOfBirth = new Date(extractedData.personalInfo.dateOfBirth);
        if (extractedData.personalInfo.sex) updatedFormData.sex = extractedData.personalInfo.sex;
        if (extractedData.personalInfo.placeOfBirth) updatedFormData.placeOfBirth = extractedData.personalInfo.placeOfBirth;
      }
      
      if (extractedData.address) {
        if (extractedData.address.province) updatedFormData.province = extractedData.address.province;
        if (extractedData.address.city) updatedFormData.town = extractedData.address.city;
        if (extractedData.address.barangay) updatedFormData.barrio = extractedData.address.barangay;
      }
      
      if (extractedData.education) {
        if (extractedData.education.school) updatedFormData.currentSchool = extractedData.education.school;
        if (extractedData.education.schoolAddress) updatedFormData.schoolAddress = extractedData.education.schoolAddress;
        if (extractedData.education.yearGraduated) updatedFormData.yearGraduated = extractedData.education.yearGraduated;
      }
      
      if (extractedData.guardian) {
        if (extractedData.guardian.name) updatedFormData.parentGuardianName = extractedData.guardian.name;
        if (extractedData.guardian.address) updatedFormData.parentGuardianAddress = extractedData.guardian.address;
        if (extractedData.guardian.occupation) updatedFormData.parentGuardianOccupation = extractedData.guardian.occupation;
      }
      
      setFormData(updatedFormData);
      setShowAIUploader(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.surname) newErrors.surname = 'Surname is required';
        if (!formData.givenName) newErrors.givenName = 'Given name is required';
        if (!formData.sex) newErrors.sex = 'Sex is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.placeOfBirth) newErrors.placeOfBirth = 'Place of birth is required';
        if (!formData.province) newErrors.province = 'Province is required';
        if (!formData.town) newErrors.town = 'Town/City is required';
        if (!formData.barrio) newErrors.barrio = 'Barangay is required';
        break;
      case 1: // Academic Information
        if (!formData.currentSchool) newErrors.currentSchool = 'School name is required';
        if (!formData.schoolAddress) newErrors.schoolAddress = 'School address is required';
        if (!formData.yearGraduated) newErrors.yearGraduated = 'Year graduated is required';
        break;
      case 2: // Request Details
        if (!formData.purpose) newErrors.purpose = 'Purpose is required';
        if (!formData.preferredPickupDate) newErrors.preferredPickupDate = 'Preferred pickup date is required';
        if (!formData.preferredPickupTime) newErrors.preferredPickupTime = 'Preferred pickup time is required';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const response = await documentService.createRequest(formData);
      console.log('Request submitted successfully:', response);
      setShowSuccess(true);
      
      // Navigate to my requests page after a delay
      setTimeout(() => {
        navigate('/my-requests');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to submit request');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Surname"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                error={!!errors.surname}
                helperText={errors.surname}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Given Name"
                name="givenName"
                value={formData.givenName}
                onChange={handleInputChange}
                error={!!errors.givenName}
                helperText={errors.givenName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.sex}>
                <InputLabel>Sex</InputLabel>
                <Select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  label="Sex"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
                {errors.sex && <FormHelperText>{errors.sex}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePickerWrapper>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dateOfBirth,
                      helperText: errors.dateOfBirth,
                      required: true
                    }
                  }}
                />
              </DatePickerWrapper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Place of Birth"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleInputChange}
                error={!!errors.placeOfBirth}
                helperText={errors.placeOfBirth}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                error={!!errors.province}
                helperText={errors.province}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Town/City"
                name="town"
                value={formData.town}
                onChange={handleInputChange}
                error={!!errors.town}
                helperText={errors.town}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Barangay"
                name="barrio"
                value={formData.barrio}
                onChange={handleInputChange}
                error={!!errors.barrio}
                helperText={errors.barrio}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Number (if applicable)"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Academic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School Name"
                name="currentSchool"
                value={formData.currentSchool}
                onChange={handleInputChange}
                error={!!errors.currentSchool}
                helperText={errors.currentSchool}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School Address"
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleInputChange}
                error={!!errors.schoolAddress}
                helperText={errors.schoolAddress}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year Graduated"
                name="yearGraduated"
                value={formData.yearGraduated}
                onChange={handleInputChange}
                error={!!errors.yearGraduated}
                helperText={errors.yearGraduated}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Parent/Guardian Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent/Guardian Name"
                name="parentGuardianName"
                value={formData.parentGuardianName}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent/Guardian Occupation"
                name="parentGuardianOccupation"
                value={formData.parentGuardianOccupation}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parent/Guardian Address"
                name="parentGuardianAddress"
                value={formData.parentGuardianAddress}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Request Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.purpose}>
                <InputLabel>Purpose</InputLabel>
                <Select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  label="Purpose"
                >
                  {purposes.map((purpose) => (
                    <MenuItem key={purpose} value={purpose}>
                      {purpose}
                    </MenuItem>
                  ))}
                </Select>
                {errors.purpose && <FormHelperText>{errors.purpose}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Pickup Date"
                name="preferredPickupDate"
                type="date"
                value={formData.preferredPickupDate}
                onChange={handleInputChange}
                error={!!errors.preferredPickupDate}
                helperText={errors.preferredPickupDate}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0] // Today's date
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.preferredPickupTime}>
                <InputLabel>Preferred Pickup Time</InputLabel>
                <Select
                  name="preferredPickupTime"
                  value={formData.preferredPickupTime}
                  onChange={handleInputChange}
                  label="Preferred Pickup Time"
                >
                  {pickupTimes.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
                {errors.preferredPickupTime && <FormHelperText>{errors.preferredPickupTime}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Any additional information or special requests..."
              />
            </Grid>
          </Grid>
        );
        
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Review Your Request
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Personal Information</Typography>
                  <Typography><strong>Name:</strong> {formData.surname}, {formData.givenName} {formData.middleName}</Typography>
                  <Typography><strong>Sex:</strong> {formData.sex}</Typography>
                  <Typography><strong>Date of Birth:</strong> {formData.dateOfBirth?.toLocaleDateString()}</Typography>
                  <Typography><strong>Place of Birth:</strong> {formData.placeOfBirth}</Typography>
                  <Typography><strong>Address:</strong> {formData.barrio}, {formData.town}, {formData.province}</Typography>
                  {formData.studentNumber && <Typography><strong>Student Number:</strong> {formData.studentNumber}</Typography>}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Academic Information</Typography>
                  <Typography><strong>School:</strong> {formData.currentSchool}</Typography>
                  <Typography><strong>School Address:</strong> {formData.schoolAddress}</Typography>
                  <Typography><strong>Year Graduated:</strong> {formData.yearGraduated}</Typography>
                  {formData.parentGuardianName && <Typography><strong>Parent/Guardian:</strong> {formData.parentGuardianName}</Typography>}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Request Details</Typography>
                  <Typography><strong>Document Type:</strong> Certificate of Good Moral Character</Typography>
                  <Typography><strong>Purpose:</strong> {formData.purpose}</Typography>
                  <Typography><strong>Preferred Pickup Date:</strong> {formData.preferredPickupDate}</Typography>
                  <Typography><strong>Preferred Pickup Time:</strong> {formData.preferredPickupTime}</Typography>
                  {formData.additionalNotes && <Typography><strong>Additional Notes:</strong> {formData.additionalNotes}</Typography>}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Please review all information carefully before submitting. Once submitted, you will receive a confirmation 
                  and can track the status of your request in the "My Requests" section.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
  };

  // Login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please log in to request a Certificate of Good Moral Character.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            sx={{ mt: 2 }}
          >
            Login to Continue
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Certificate of Good Moral Character Request
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            Fill out the form below to request your Certificate of Good Moral Character
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* AI Assistant Card */}
        <Box sx={{ mb: 4 }}>
          <AIAssistantCard
            title="Need Help Filling Out the Form?"
            description="Our AI assistant can help extract information from your documents to auto-fill this form."
            onUploadClick={() => setShowAIUploader(true)}
          />
        </Box>

        {/* AI Document Uploader */}
        {showAIUploader && (
          <Box sx={{ mb: 4 }}>
            <AIDocumentUploader
              onDataExtracted={handleAIDataExtracted}
              onClose={() => setShowAIUploader(false)}
              expectedDocumentType="good-moral-request"
            />
          </Box>
        )}

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          
          <Box sx={{ flex: '1 1 auto' }} />
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Certificate of Good Moral Character request submitted successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GoodMoralRequest;
