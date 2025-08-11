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
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import Form137RequestLetterPDF from '../../components/PDFTemplates/Form137RequestLetterPDF';
import { DatePickerWrapper, DatePicker } from '../../components/DatePickerWrapper';
import { documentService } from '../../services/api';
import AIDocumentUploader from '../../components/AIDocumentUploader';
import AIAssistantCard from '../../components/AIAssistantCard';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Form137Request = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    documentType: 'Form 137',
    // Student Information
    surname: '',
    firstName: '',
    middleName: '',
    sex: '',
    dateOfBirth: null,
    barangay: '',
    city: '',
    province: '',
    learnerReferenceNumber: '',
    // Academic Information
    lastGradeLevel: '',
    strand: '',
    lastAttendedYear: '',
    receivingSchool: '',
    receivingSchoolAddress: '',
    purpose: '',
    // Parent/Guardian Information
    parentGuardianName: '',
    parentGuardianAddress: '',
    parentGuardianContact: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAIUploader, setShowAIUploader] = useState(false);
  const [generatedRequestLetter, setGeneratedRequestLetter] = useState(null);

  // AI Document Assistant handler
  // Accepts flat extractor_api output and maps to form fields
  const handleAIDataExtracted = (extractedData) => {
    if (extractedData) {
      // Log the full backend response for debugging
      console.log('Full backend response from extractor_api:', JSON.stringify(extractedData, null, 2));
      const updatedFormData = { ...formData };
      // Map both possible key names for robustness
      updatedFormData.surname = extractedData.surname || extractedData.lastName || formData.surname;
      updatedFormData.firstName = extractedData.firstName || formData.firstName;
      updatedFormData.middleName = extractedData.middleName || formData.middleName;
      updatedFormData.learnerReferenceNumber = extractedData.learnerReferenceNumber || extractedData.lrn || formData.learnerReferenceNumber;
      // Robust date parsing
      if (extractedData.dateOfBirth || extractedData.birthDate) {
        let dateStr = extractedData.dateOfBirth || extractedData.birthDate;
        let date = null;
        if (typeof dateStr === 'string') {
          const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
          if (isoMatch) {
            date = new Date(dateStr);
          } else {
            const tryDate = new Date(dateStr);
            if (!isNaN(tryDate)) date = tryDate;
          }
        } else if (dateStr instanceof Date && !isNaN(dateStr)) {
          date = dateStr;
        }
        if (date && !isNaN(date)) updatedFormData.dateOfBirth = date;
      }
      updatedFormData.sex = extractedData.sex || extractedData.gender || formData.sex;
      updatedFormData.city = extractedData.city || extractedData.placeOfBirth || formData.city;
      updatedFormData.lastAttendedYear = extractedData.lastAttendedYear || extractedData.schoolYear || formData.lastAttendedYear;
      updatedFormData.receivingSchool = extractedData.receivingSchool || extractedData.schoolName || formData.receivingSchool;
      updatedFormData.receivingSchoolAddress = extractedData.receivingSchoolAddress || extractedData.schoolAddress || formData.receivingSchoolAddress;
      updatedFormData.parentGuardianName = extractedData.parentGuardianName || extractedData.father || extractedData.mother || formData.parentGuardianName;
      // Optionally, add more mappings as needed
      setFormData(updatedFormData);
      setShowAIUploader(false);
    }
  };

  const requirements = [
    'Valid School ID or Any Valid Government ID',
    'Authorization Letter (if not the student)',
    'Submit the generated request letter to the School Registrar',
    'Wait for admin verification and approval',
    'Collect your Form 137 upon notification',
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
        if (!formData.learnerReferenceNumber.trim()) newErrors.learnerReferenceNumber = 'Learner Reference Number (LRN) is required';
        break;
      case 1: // Academic Details
        if (!formData.lastGradeLevel.trim()) newErrors.lastGradeLevel = 'Last grade level is required';
        if ((formData.lastGradeLevel === 'Grade 11' || formData.lastGradeLevel === 'Grade 12') && !formData.strand.trim()) {
          newErrors.strand = 'Strand is required for Grade 11 and 12 students';
        }
        if (!formData.lastAttendedYear.trim()) newErrors.lastAttendedYear = 'Last attended year is required';
        if (!formData.receivingSchool.trim()) newErrors.receivingSchool = 'Receiving school is required';
        if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
        break;
      case 2: // Parent/Guardian Information
        if (!formData.parentGuardianName.trim()) newErrors.parentGuardianName = 'Parent/Guardian name is required';
        if (!formData.parentGuardianAddress.trim()) newErrors.parentGuardianAddress = 'Parent/Guardian address is required';
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
      setErrorMessage('Please log in to submit your Form 137 request.');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting Form 137 request:', formData);
      
      // Submit the document request to the database
      const response = await documentService.createRequest(formData);
      console.log('Request submitted successfully:', response);
      
      // Generate request letter data for PDF download
      const requestLetterData = {
        ...formData,
        requestId: `FORM137-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending_verification',
        requestDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      
      // Automatically generate and download PDF
      await generateAndDownloadPDF(requestLetterData);
      
      setGeneratedRequestLetter(requestLetterData);
      setShowSuccess(true);
      setActiveStep(activeStep + 1); // Move to final step showing confirmation
      
      // Navigate to my requests page after a delay
      setTimeout(() => {
        navigate('/my-requests');
      }, 4000);
      
    } catch (error) {
      console.error('Request submission error:', error);
      
      // More detailed error handling
      let errorMsg = 'Failed to submit Form 137 request. Please try again.';
      if (error.response?.status === 401) {
        errorMsg = 'You need to be logged in to submit a request. Please log in and try again.';
      } else if (error.response?.status === 400) {
        errorMsg = 'Invalid form data. Please check your inputs and try again.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (!isAuthenticated) {
        errorMsg = 'Please log in to submit your Form 137 request.';
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to automatically generate and download PDF
  const generateAndDownloadPDF = async (requestLetterData) => {
    try {
      // Generate PDF blob
      const pdfDoc = <Form137RequestLetterPDF requestData={requestLetterData} />;
      const blob = await pdf(pdfDoc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Form137_Request_${requestLetterData.requestId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
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
                    textFieldProps={{
                      fullWidth: true,
                      required: true,
                      error: !!errors.dateOfBirth,
                      helperText: errors.dateOfBirth,
                    }}
                  />
                </DatePickerWrapper>
              </Grid>
              
              {/* Address */}
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
              
              {/* LRN */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Learner Reference Number (LRN)"
                  value={formData.learnerReferenceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, learnerReferenceNumber: e.target.value }))}
                  error={!!errors.learnerReferenceNumber}
                  helperText={errors.learnerReferenceNumber}
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
                  Provide details about your academic history and the receiving school.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.lastGradeLevel}>
                  <InputLabel>Last Grade Level Completed</InputLabel>
                  <Select
                    value={formData.lastGradeLevel}
                    label="Last Grade Level Completed"
                    onChange={(e) => {
                      const selectedGrade = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        lastGradeLevel: selectedGrade,
                        // Clear strand if not Grade 11 or 12
                        strand: (selectedGrade === 'Grade 11' || selectedGrade === 'Grade 12') ? prev.strand : ''
                      }));
                    }}
                  >
                    <MenuItem value="Grade 7">Grade 7</MenuItem>
                    <MenuItem value="Grade 8">Grade 8</MenuItem>
                    <MenuItem value="Grade 9">Grade 9</MenuItem>
                    <MenuItem value="Grade 10">Grade 10</MenuItem>
                    <MenuItem value="Grade 11">Grade 11</MenuItem>
                    <MenuItem value="Grade 12">Grade 12</MenuItem>
                  </Select>
                  {errors.lastGradeLevel && <FormHelperText>{errors.lastGradeLevel}</FormHelperText>}
                </FormControl>
              </Grid>
              
              {/* Conditional Strand Dropdown for Grade 11 and 12 */}
              {(formData.lastGradeLevel === 'Grade 11' || formData.lastGradeLevel === 'Grade 12') && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.strand}>
                    <InputLabel>Strand</InputLabel>
                    <Select
                      value={formData.strand}
                      label="Strand"
                      onChange={(e) => setFormData(prev => ({ ...prev, strand: e.target.value }))}
                    >
                      <MenuItem value="ABM">ABM (Accountancy, Business & Management)</MenuItem>
                      <MenuItem value="STEM">STEM (Science, Technology, Engineering & Mathematics)</MenuItem>
                      <MenuItem value="HUMSS">HUMSS (Humanities & Social Sciences)</MenuItem>
                      <MenuItem value="GAS">GAS (General Academic Strand)</MenuItem>
                      <MenuItem value="TVL">TVL (Technical-Vocational-Livelihood)</MenuItem>
                    </Select>
                    {errors.strand && <FormHelperText>{errors.strand}</FormHelperText>}
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} md={formData.lastGradeLevel === 'Grade 11' || formData.lastGradeLevel === 'Grade 12' ? 12 : 6}>
                <TextField
                  fullWidth
                  required
                  label="Last Attended School Year"
                  value={formData.lastAttendedYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastAttendedYear: e.target.value }))}
                  error={!!errors.lastAttendedYear}
                  helperText={errors.lastAttendedYear}
                  placeholder="e.g., 2023-2024"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Receiving School (School you're transferring to)"
                  value={formData.receivingSchool}
                  onChange={(e) => setFormData(prev => ({ ...prev, receivingSchool: e.target.value }))}
                  error={!!errors.receivingSchool}
                  helperText={errors.receivingSchool}
                  placeholder="Full name of the school you're transferring to"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Receiving School Address (Optional)"
                  value={formData.receivingSchoolAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, receivingSchoolAddress: e.target.value }))}
                  placeholder="Address of the receiving school"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Purpose of Transfer"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  error={!!errors.purpose}
                  helperText={errors.purpose}
                  placeholder="e.g., Transfer to new school, College application"
                  multiline
                  rows={3}
                />
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
                  Provide parent or guardian contact information for the transfer process.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Parent/Guardian Full Name"
                  value={formData.parentGuardianName}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentGuardianName: e.target.value }))}
                  error={!!errors.parentGuardianName}
                  helperText={errors.parentGuardianName}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Parent/Guardian Address"
                  value={formData.parentGuardianAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentGuardianAddress: e.target.value }))}
                  error={!!errors.parentGuardianAddress}
                  helperText={errors.parentGuardianAddress}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Contact Number (Optional)"
                  value={formData.parentGuardianContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentGuardianContact: e.target.value }))}
                  placeholder="Contact number for notifications"
                />
              </Grid>
            </Grid>
          );

        case 3: // Generate Request Letter
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Generate Form 137 Request Letter
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Review your information and generate your formal Form 137 request letter.
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
                        <strong>LRN:</strong> {formData.learnerReferenceNumber}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Last Grade:</strong> {formData.lastGradeLevel} ({formData.lastAttendedYear})
                        {(formData.lastGradeLevel === 'Grade 11' || formData.lastGradeLevel === 'Grade 12') && formData.strand && (
                          <span> - {formData.strand}</span>
                        )}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Receiving School:</strong> {formData.receivingSchool}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Purpose:</strong> {formData.purpose}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Parent/Guardian:</strong> {formData.parentGuardianName}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ backgroundColor: '#e8f5e8' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="success.main">
                          Form 137 Request Submitted Successfully!
                        </Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        <strong>Request ID:</strong> {generatedRequestLetter.requestId}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Submitted Date:</strong> {generatedRequestLetter.requestDate}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Your Form 137 request has been successfully submitted and is now being processed. 
                        A copy of your request letter has been automatically downloaded to your device. You can track the status in your dashboard.
                      </Typography>
                      
                      {/* Optional manual download button in case auto-download failed */}
                      {generatedRequestLetter && (
                        <Box mt={2}>
                          <PDFDownloadLink
                            document={<Form137RequestLetterPDF requestData={generatedRequestLetter} />}
                            fileName={`Form137_Request_${generatedRequestLetter.requestId}.pdf`}
                          >
                            {({ loading }) => (
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                                disabled={loading}
                                size="small"
                              >
                                {loading ? 'Generating PDF...' : 'Download Again'}
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
                      'Present the collection stub to collect your Form 137'
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
          return null;
      }
    } catch (error) {
      console.error('Error in renderStepContent:', error);
      return (
        <Alert severity="error">
          An error occurred while rendering this step. Please refresh the page and try again.
        </Alert>
      );
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 },
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Form 137 / SF10 Request Intent Declaration
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" paragraph>
            Generate a pickup stub for your Form 137 / SF10 transfer request. This is a preparation document for the official school-to-school transfer process.
          </Typography>
        </Box>

        {/* Auth Check */}
        {!isAuthenticated && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography>Please log in to generate your Form 137 stub.</Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                startIcon={<LoginIcon />}
                size="small"
              >
                Login
              </Button>
            </Box>
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box component="form" onSubmit={handleFormSubmit}>
          {renderStepContent(activeStep)}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
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

        {/* Requirements */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Requirements for School Registrar Visit
          </Typography>
          <List>
            {requirements.map((req, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={req} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            Form 137 request submitted successfully! You can track your request status in the dashboard.
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setShowError(false)}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default Form137Request;
