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
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Form138RequestLetterPDF from '../../components/PDFTemplates/Form138RequestLetterPDF';
import { DatePickerWrapper, DatePicker } from '../../components/DatePickerWrapper';
import { documentService } from '../../services/api';
import AIDocumentUploader from '../../components/AIDocumentUploader';
import AIAssistantCard from '../../components/AIAssistantCard';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Form138Request = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    documentType: 'Form 138',
    // Student Information
    surname: '',
    firstName: '',
    middleName: '',
    sex: '',
    dateOfBirth: null,
    placeOfBirth: '',
    lrn: '',
    barangay: '',
    city: '',
    province: '',
    // Academic Information
    gradeLevel: '',
    schoolYear: '',
    section: '',
    adviser: '',
    // Request Details
    purpose: '',
    numberOfCopies: '1',
    // Parent/Guardian Information
    parentName: '',
    parentAddress: '',
    parentContact: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAIUploader, setShowAIUploader] = useState(false);
  const [generatedRequestLetter, setGeneratedRequestLetter] = useState(null);

  // AI Document Assistant handler
  const handleAIDataExtracted = (extractedData) => {
    if (extractedData) {
      const updatedFormData = { ...formData };
      
      // Map extracted data to form fields
      if (extractedData.personalInfo) {
        if (extractedData.personalInfo.firstName) updatedFormData.firstName = extractedData.personalInfo.firstName;
        if (extractedData.personalInfo.lastName) updatedFormData.surname = extractedData.personalInfo.lastName;
        if (extractedData.personalInfo.middleName) updatedFormData.middleName = extractedData.personalInfo.middleName;
        if (extractedData.personalInfo.lrn) updatedFormData.lrn = extractedData.personalInfo.lrn;
        if (extractedData.personalInfo.dateOfBirth) updatedFormData.dateOfBirth = new Date(extractedData.personalInfo.dateOfBirth);
        if (extractedData.personalInfo.sex) updatedFormData.sex = extractedData.personalInfo.sex;
        if (extractedData.personalInfo.placeOfBirth) updatedFormData.placeOfBirth = extractedData.personalInfo.placeOfBirth;
      }
      
      if (extractedData.address) {
        if (extractedData.address.city) updatedFormData.city = extractedData.address.city;
        if (extractedData.address.province) updatedFormData.province = extractedData.address.province;
        if (extractedData.address.barangay) updatedFormData.barangay = extractedData.address.barangay;
      }
      
      if (extractedData.academicInfo) {
        if (extractedData.academicInfo.gradeLevel) updatedFormData.gradeLevel = extractedData.academicInfo.gradeLevel;
        if (extractedData.academicInfo.schoolYear) updatedFormData.schoolYear = extractedData.academicInfo.schoolYear;
        if (extractedData.academicInfo.section) updatedFormData.section = extractedData.academicInfo.section;
        if (extractedData.academicInfo.adviser) updatedFormData.adviser = extractedData.academicInfo.adviser;
      }
      
      if (extractedData.parentInfo) {
        if (extractedData.parentInfo.guardianName) updatedFormData.parentName = extractedData.parentInfo.guardianName;
        if (extractedData.parentInfo.guardianContact) updatedFormData.parentContact = extractedData.parentInfo.guardianContact;
        if (extractedData.parentInfo.guardianAddress) updatedFormData.parentAddress = extractedData.parentInfo.guardianAddress;
      }
      
      setFormData(updatedFormData);
      setShowAIUploader(false);
    }
  };

  const requirements = [
    'Valid School ID or Any Valid Government ID',
    'Authorization Letter (if not the student)',
    'Submit the generated request letter to the School Registrar',
    'Wait for admin verification and approval',
    'Collect your Form 138 upon notification',
  ];

  const steps = ['Student Information', 'Academic Details', 'Parent/Guardian Info', 'Generate Request Letter'];

  const validateStep = (stepIndex) => {
    const newErrors = {};

    switch (stepIndex) {
      case 0: // Student Information
        if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.sex) newErrors.sex = 'Sex is required';
        if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
        if (!formData.city.trim()) newErrors.city = 'City/Municipality is required';
        if (!formData.province.trim()) newErrors.province = 'Province is required';
        break;
      case 1: // Academic Details
        if (!formData.gradeLevel.trim()) newErrors.gradeLevel = 'Grade level is required';
        if (!formData.schoolYear.trim()) newErrors.schoolYear = 'School year is required';
        if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
        break;
      case 2: // Parent/Guardian Information
        if (!formData.parentName.trim()) newErrors.parentName = 'Parent/Guardian name is required';
        if (!formData.parentAddress.trim()) newErrors.parentAddress = 'Parent/Guardian address is required';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    try {
      const isValid = validateStep(activeStep);
      
      if (isValid) {
        setActiveStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      setErrorMessage('An error occurred while proceeding to the next step.');
      setShowError(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    // Check authentication before submitting
    if (!isAuthenticated) {
      setErrorMessage('Please log in to submit your Form 138 request.');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting Form 138 request:', formData);
      
      // Submit the document request to the database
      const response = await documentService.createRequest(formData);
      console.log('Request submitted successfully:', response);
      
      // Also generate request letter data for PDF download
      const requestLetterData = {
        ...formData,
        requestId: `FORM138-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending_verification'
      };
      
      setGeneratedRequestLetter(requestLetterData);
      setShowSuccess(true);
      setActiveStep(activeStep + 1); // Move to final step showing the letter
      
      // Navigate to my requests page after a delay
      setTimeout(() => {
        navigate('/my-requests');
      }, 3000);
      
    } catch (error) {
      console.error('Request submission error:', error);
      
      // More detailed error handling
      let errorMsg = 'Failed to submit Form 138 request. Please try again.';
      if (error.response?.status === 401) {
        errorMsg = 'You need to be logged in to submit a request. Please log in and try again.';
      } else if (error.response?.status === 400) {
        errorMsg = 'Invalid form data. Please check your inputs and try again.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (!isAuthenticated) {
        errorMsg = 'Please log in to submit your Form 138 request.';
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    try {
      switch (step) {
        case 0: // Student Information
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Student Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fill out the student's personal information below. You can use our AI assistant to automatically extract information from document images.
                </Typography>
              </Grid>

              {/* AI Assistant Card */}
              <Grid item xs={12}>
                <AIAssistantCard
                  title="AI Document Assistant"
                  description="Upload a document image to automatically extract student information"
                  show={!showAIUploader}
                  onStartAIProcessing={() => setShowAIUploader(true)}
                />
              </Grid>
              
              {/* AI Document Uploader */}
              {showAIUploader && (
                <Grid item xs={12}>
                  <AIDocumentUploader
                    formData={formData}
                    setFormData={setFormData}
                    onDataExtracted={handleAIDataExtracted}
                  />
                </Grid>
              )}

              {/* Name Fields */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Surname (Last Name)"
                  value={formData.surname}
                  onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                  error={!!errors.surname}
                  helperText={errors.surname}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                />
              </Grid>
              
              {/* Other Personal Info */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.sex}>
                  <InputLabel>Sex</InputLabel>
                  <Select
                    value={formData.sex}
                    label="Sex"
                    onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                  {errors.sex && <FormHelperText>{errors.sex}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePickerWrapper>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, dateOfBirth: newValue }))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth
                      }
                    }}
                  />
                </DatePickerWrapper>
              </Grid>

              {/* Address Fields */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Barangay"
                  value={formData.barangay}
                  onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                  error={!!errors.barangay}
                  helperText={errors.barangay}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="City/Municipality"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  error={!!errors.city}
                  helperText={errors.city}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Province"
                  value={formData.province}
                  onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                  error={!!errors.province}
                  helperText={errors.province}
                />
              </Grid>

              {/* Additional Info */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Place of Birth"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Learner Reference Number (LRN)"
                  value={formData.lrn}
                  onChange={(e) => setFormData(prev => ({ ...prev, lrn: e.target.value }))}
                />
              </Grid>
            </Grid>
          );

        case 1: // Academic Details
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Academic Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provide details about your academic information for the Form 138 request.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.gradeLevel}>
                  <InputLabel>Grade Level</InputLabel>
                  <Select
                    value={formData.gradeLevel}
                    label="Grade Level"
                    onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                  >
                    <MenuItem value="Grade 7">Grade 7</MenuItem>
                    <MenuItem value="Grade 8">Grade 8</MenuItem>
                    <MenuItem value="Grade 9">Grade 9</MenuItem>
                    <MenuItem value="Grade 10">Grade 10</MenuItem>
                    <MenuItem value="Grade 11">Grade 11</MenuItem>
                    <MenuItem value="Grade 12">Grade 12</MenuItem>
                  </Select>
                  {errors.gradeLevel && <FormHelperText>{errors.gradeLevel}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="School Year"
                  placeholder="e.g., 2023-2024"
                  value={formData.schoolYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolYear: e.target.value }))}
                  error={!!errors.schoolYear}
                  helperText={errors.schoolYear}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Section"
                  value={formData.section}
                  onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Class Adviser"
                  value={formData.adviser}
                  onChange={(e) => setFormData(prev => ({ ...prev, adviser: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Purpose of Request"
                  placeholder="e.g., Transfer to another school, College application"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  error={!!errors.purpose}
                  helperText={errors.purpose}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Number of Copies</InputLabel>
                  <Select
                    value={formData.numberOfCopies}
                    label="Number of Copies"
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfCopies: e.target.value }))}
                  >
                    <MenuItem value="1">1 Copy</MenuItem>
                    <MenuItem value="2">2 Copies</MenuItem>
                    <MenuItem value="3">3 Copies</MenuItem>
                    <MenuItem value="4">4 Copies</MenuItem>
                    <MenuItem value="5">5 Copies</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          );

        case 2: // Parent/Guardian Information
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Parent/Guardian Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provide contact information for your parent or guardian.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Parent/Guardian Full Name"
                  value={formData.parentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                  error={!!errors.parentName}
                  helperText={errors.parentName}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Parent/Guardian Address"
                  value={formData.parentAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentAddress: e.target.value }))}
                  error={!!errors.parentAddress}
                  helperText={errors.parentAddress}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Contact Number"
                  value={formData.parentContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentContact: e.target.value }))}
                  placeholder="e.g., 09123456789"
                />
              </Grid>
            </Grid>
          );

        case 3: // Generate Request Letter
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Generate Form 138 Request Letter
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Review your information and generate your formal Form 138 request letter.
                </Typography>
              </Grid>
              
              {!generatedRequestLetter ? (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Review Your Information
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Student:</strong> {formData.firstName} {formData.middleName} {formData.surname}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>LRN:</strong> {formData.lrn || 'N/A'}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Grade Level:</strong> {formData.gradeLevel} ({formData.schoolYear})
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Section:</strong> {formData.section || 'N/A'}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Purpose:</strong> {formData.purpose}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Parent/Guardian:</strong> {formData.parentName}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ backgroundColor: '#e8f5e8' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <DescriptionIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="success.main">
                          Request Letter Generated Successfully!
                        </Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        <strong>Request ID:</strong> {generatedRequestLetter.requestId}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Your Form 138 request has been successfully submitted and is now being processed. You can download a copy of your request letter below and track the status in your dashboard.
                      </Typography>
                      
                      {generatedRequestLetter && (
                        <Box mt={2}>
                          <PDFDownloadLink
                            document={<Form138RequestLetterPDF requestData={generatedRequestLetter} />}
                            fileName={`Form138_Request_${generatedRequestLetter.requestId}.pdf`}
                          >
                            {({ loading }) => (
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                                disabled={loading}
                                size="large"
                              >
                                {loading ? 'Generating PDF...' : 'Download Request Letter'}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: '#fff3cd' }}>
                  <Typography variant="h6" gutterBottom color="warning.dark">
                    Next Steps:
                  </Typography>
                  <List dense>
                    {[
                      'Submit this formal request letter to the School Registrar',
                      'Bring required supporting documents (ID, authorization letter if applicable)',
                      'Wait for admin verification of your request',
                      'You will receive a collection stub once approved',
                      'Present the collection stub to collect your Form 138'
                    ].map((instruction, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <InfoIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={instruction} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          );

        default:
          return 'Unknown step';
      }
    } catch (error) {
      console.error('Error rendering step content:', error);
      return (
        <Alert severity="error">
          An error occurred while loading this step. Please try refreshing the page.
        </Alert>
      );
    }
  };

  const getStepIcon = (index) => {
    const icons = [AssignmentIcon, SchoolIcon, DescriptionIcon, CheckIcon];
    const IconComponent = icons[index] || AssignmentIcon;
    return <IconComponent />;
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please log in to your account to request Form 138 (Report Card).
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Form 138 (Report Card) Request
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
          Generate a formal request letter for your Form 138 (Report Card)
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel icon={getStepIcon(index)}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mt: 4 }}>
          <form onSubmit={handleFormSubmit}>
            {renderStepContent(activeStep)}
          </form>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                !generatedRequestLetter && (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !isAuthenticated}
                    startIcon={loading ? <CircularProgress size={20} /> : <DescriptionIcon />}
                  >
                    {loading ? 'Generating Request Letter...' : 'Generate Request Letter'}
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={loading}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Requirements Section */}
        <Box sx={{ mt: 4 }}>
          <Paper elevation={1} sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              Requirements for Form 138 Request:
            </Typography>
            <List>
              {requirements.map((requirement, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={requirement} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Form 138 request letter generated successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Form138Request;
