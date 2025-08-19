import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Checkbox,
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as FamilyIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Login as LoginIcon,
  UploadFile as UploadIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { DatePickerWrapper, DatePicker } from '../../components/DatePickerWrapper';
import { enrollmentService } from '../../services/api';
import AIDocumentUploader from '../../components/AIDocumentUploader';
import AIAssistantCard from '../../components/AIAssistantCard';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { generateStudentData } from '../../utils/mockDataGenerator';

const Enrollment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [aiExtracting, setAIExtracting] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  const [formData, setFormData] = useState({
    // Enrollment Type
    enrollmentType: '', // 'new' (includes both new students and transferees), 'old'
    // Student Information
    learnerReferenceNumber: '',
    surname: '',
    firstName: '',
    middleName: '',
    extension: '',
    dateOfBirth: null,
    placeOfBirth: '',
    sex: '',
    age: '',
    religion: '',
    citizenship: '',
    // Address Information
    houseNumber: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    // Contact Information
    contactNumber: '',
    emailAddress: '',
    // Previous School Information
    lastSchoolAttended: '',
    schoolAddress: '',
    gradeLevel: '',
    schoolYear: '',
    // Parent/Guardian Information
    fatherName: '',
    fatherOccupation: '',
    fatherContactNumber: '',
    motherName: '',
    motherOccupation: '',
    motherContactNumber: '',
    guardianName: '',
    guardianRelationship: '',
    guardianOccupation: '',
    guardianContactNumber: '',
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    emergencyContactAddress: '',
    // Enrollment Details
    gradeToEnroll: '',
    track: '', // For SHS
    // Documents (file uploads)
    form137File: null,
    form138File: null,
    goodMoralFile: null,
    medicalCertificateFile: null,
    parentIdFile: null,
    idPicturesFile: null,
    // Document status tracking
    form137: false,
    form138: false,
    goodMoral: false,
    medicalCertificate: false,
    parentId: false,
    idPictures: false,
    // Additional Information
    specialNeeds: '',
    allergies: '',
    medications: '',
    // Agreement
    agreementAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAIUploader, setShowAIUploader] = useState(false);

  // Utility to capitalize first letter of each word
  const capitalizeWords = (str) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  // Authentication guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Check if user already has an enrollment
  useEffect(() => {
    const checkExistingEnrollment = async () => {
      if (!isAuthenticated) return;
      
      setCheckingEnrollment(true);
      try {
        const response = await enrollmentService.getMyEnrollmentStatus();
        setEnrollmentStatus(response.data);
        
        if (response.data.hasEnrollment) {
          // User already has an enrollment, redirect to status page
          navigate('/enrollment-status');
        }
      } catch (error) {
        console.error('Error checking enrollment status:', error);
        // Continue to allow form if check fails
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkExistingEnrollment();
  }, [isAuthenticated, navigate]);

  // Auto-populate school info for continuing students
  useEffect(() => {
    if (formData.enrollmentType === 'old') {
      // For continuing students, auto-fill school information
      setFormData(prev => ({
        ...prev,
        lastSchoolAttended: 'Eastern La Trinidad National High School',
        schoolAddress: 'La Trinidad, Benguet'
      }));
    } else if (formData.enrollmentType !== '') {
      // Clear school info for new students and transferees
      setFormData(prev => ({
        ...prev,
        lastSchoolAttended: '',
        schoolAddress: ''
      }));
    }
  }, [formData.enrollmentType]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while checking existing enrollment
  if (checkingEnrollment) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Checking enrollment status...</Typography>
        </Box>
      </Container>
    );
  }

  // Accept extracted data and autofill the form
  const handleAIDataExtracted = (extracted) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        learnerReferenceNumber: extracted.learnerReferenceNumber || '',
        surname: extracted.surname || '',
        firstName: extracted.firstName || '',
        middleName: extracted.middleName || '',
        dateOfBirth: extracted.dateOfBirth ? new Date(extracted.dateOfBirth) : null,
        placeOfBirth: extracted.placeOfBirth || '',
        sex: extracted.sex || '',
        schoolYear: extracted.schoolYear || '',
        // Add more fields as you expand backend extraction
      };
      // Always autofill citizenship to Filipino unless extractor returns a non-empty value
      updated.citizenship = extracted.citizenship && extracted.citizenship.trim() ? extracted.citizenship : 'Filipino';
      return updated;
    });
    setShowAIUploader(false);
    setShowSuccess(true);
  };

  const steps = [
    'Enrollment Category',
    'Student, Address, School & Family Info',
    'Enrollment Details', 
    'Upload Documents', 
    'Review & Submit'
  ];

  const gradeLevels = [
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  const tracks = [
    'Technical-Vocational-Livelihood',
    'Accountancy and Business Management',
    'Science-Technology-Engineering-Mathematics'
  ];

  const requirements = [
    'Form 137 (Permanent Record)',
    'Form 138 (Report Card)',
    'Certificate of Good Moral Character',
    'Medical Certificate',
    'Recent 2x2 ID Pictures (4 pieces)',
    'Parent/Guardian Valid ID (Photocopy)'
  ];

  // File upload handler
  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
      [field.replace('File', '')]: !!file
    }));
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};

    switch (stepIndex) {
      case 0: // Enrollment Type
        if (!formData.enrollmentType) newErrors.enrollmentType = 'Please select enrollment type';
        break;
      case 1: // Combined Info
        if (!formData.learnerReferenceNumber.trim()) newErrors.learnerReferenceNumber = 'LRN is required';
        if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.placeOfBirth.trim()) newErrors.placeOfBirth = 'Place of birth is required';
        if (!formData.sex) newErrors.sex = 'Sex is required';
        if (!formData.religion.trim()) newErrors.religion = 'Religion is required';
        if (!formData.citizenship.trim()) newErrors.citizenship = 'Citizenship is required';
        if (!formData.houseNumber.trim()) newErrors.houseNumber = 'House number is required';
        if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
        if (!formData.city.trim()) newErrors.city = 'City/Municipality is required';
        if (!formData.province.trim()) newErrors.province = 'Province is required';
        if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (formData.emailAddress && !/\S+@\S+\.\S+/.test(formData.emailAddress)) {
          newErrors.emailAddress = 'Invalid email address';
        }
        if (formData.enrollmentType !== 'old') {
          if (!formData.lastSchoolAttended.trim()) newErrors.lastSchoolAttended = 'Last school attended is required';
          if (!formData.schoolAddress.trim()) newErrors.schoolAddress = 'School address is required';
        }
        if (!formData.gradeLevel.trim()) newErrors.gradeLevel = 'Grade level is required';
        if (!formData.schoolYear.trim()) newErrors.schoolYear = 'School year is required';
        if (!formData.fatherName.trim()) newErrors.fatherName = 'Father\'s name is required';
        if (!formData.motherName.trim()) newErrors.motherName = 'Mother\'s name is required';
        if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData.emergencyContactNumber.trim()) newErrors.emergencyContactNumber = 'Emergency contact number is required';
        break;
      case 2: // Enrollment Details
        if (!formData.gradeToEnroll) newErrors.gradeToEnroll = 'Grade to enroll is required';
        if ((formData.gradeToEnroll === 'Grade 11' || formData.gradeToEnroll === 'Grade 12')) {
          if (!formData.track) newErrors.track = 'Track is required for Senior High School';
        }
        break;
      case 3: // Upload Documents
        // Documents are now optional - no validation required
        // Users can proceed without uploading documents
        break;
      case 4: // Review & Submit
        if (!formData.agreementAccepted) newErrors.agreementAccepted = 'You must accept the enrollment agreement';
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

    setLoading(true);
    try {
      console.log('Submitting enrollment data:', formData);
      
      // Create FormData for file upload
      const formDataToSubmit = new FormData();
      
      // Determine specific enrollment type for backend
      let backendEnrollmentType = formData.enrollmentType;
      if (formData.enrollmentType === 'new') {
        // Auto-classify as transferee if enrolling in high school grades and coming from another school
        const isHighSchoolGrade = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].includes(formData.gradeToEnroll);
        const lastSchool = formData.lastSchoolAttended.toLowerCase();
        const isFromElementary = lastSchool.includes('elementary') || lastSchool.includes('elem') || 
                                 formData.gradeLevel === 'Grade 6' || formData.gradeLevel === 'Kinder' || 
                                 formData.gradeLevel.includes('Kindergarten');
        
        // If enrolling in high school but not coming from elementary, classify as transferee
        if (isHighSchoolGrade && !isFromElementary) {
          backendEnrollmentType = 'transferee';
        }
        
        console.log('Auto-classification:', {
          originalType: formData.enrollmentType,
          finalType: backendEnrollmentType,
          gradeToEnroll: formData.gradeToEnroll,
          lastSchool: formData.lastSchoolAttended,
          gradeLevel: formData.gradeLevel,
          isHighSchoolGrade,
          isFromElementary
        });
      }
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] && !key.includes('File')) {
          if (key === 'dateOfBirth' && formData[key]) {
            formDataToSubmit.append(key, formData[key].toISOString());
          } else if (key === 'enrollmentType') {
            // Use the determined backend type
            formDataToSubmit.append(key, backendEnrollmentType);
          } else {
            formDataToSubmit.append(key, formData[key]);
          }
        }
      });
      
      // Add file uploads
      if (formData.form137File) formDataToSubmit.append('form137File', formData.form137File);
      if (formData.form138File) formDataToSubmit.append('form138File', formData.form138File);
      if (formData.goodMoralFile) formDataToSubmit.append('goodMoralFile', formData.goodMoralFile);
      if (formData.medicalCertificateFile) formDataToSubmit.append('medicalCertificateFile', formData.medicalCertificateFile);
      if (formData.parentIdFile) formDataToSubmit.append('parentIdFile', formData.parentIdFile);
      if (formData.idPicturesFile) formDataToSubmit.append('idPicturesFile', formData.idPicturesFile);
      
      // Submit enrollment to backend with FormData
      const response = await enrollmentService.submitEnrollment(formDataToSubmit);
      console.log('Enrollment submission response:', response);
      setShowSuccess(true);

      // Reset form
      setFormData({
        enrollmentType: '',
        learnerReferenceNumber: '',
        surname: '',
        firstName: '',
        middleName: '',
        extension: '',
        dateOfBirth: null,
        placeOfBirth: '',
        sex: '',
        age: '',
        religion: '',
        citizenship: '',
        houseNumber: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        zipCode: '',
        contactNumber: '',
        emailAddress: '',
        lastSchoolAttended: '',
        schoolAddress: '',
        gradeLevel: '',
        schoolYear: '',
        fatherName: '',
        fatherOccupation: '',
        fatherContactNumber: '',
        motherName: '',
        motherOccupation: '',
        motherContactNumber: '',
        guardianName: '',
        guardianRelationship: '',
        guardianOccupation: '',
        guardianContactNumber: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactNumber: '',
        emergencyContactAddress: '',
        gradeToEnroll: '',
        track: '',
        form137File: null,
        form138File: null,
        goodMoralFile: null,
        medicalCertificateFile: null,
        parentIdFile: null,
        idPicturesFile: null,
        form137: false,
        form138: false,
        goodMoral: false,
        medicalCertificate: false,
        parentId: false,
        idPictures: false,
        specialNeeds: '',
        allergies: '',
        medications: '',
        agreementAccepted: false,
      });
      setActiveStep(0);
    } catch (error) {
      console.error('Enrollment submission error:', error);
      let errorMsg = 'Failed to submit enrollment application. Please try again.';
      
      if (error.response?.status === 400) {
        if (error.response.data?.hasExistingEnrollment) {
          // User already has an enrollment
          errorMsg = 'You have already submitted an enrollment application. You can only submit one enrollment per student.';
          // Redirect to enrollment status page after showing error
          setTimeout(() => {
            navigate('/enrollment-status');
          }, 3000);
        } else {
          errorMsg = error.response.data?.message || 'Invalid enrollment data. Please check your inputs and try again.';
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
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
        case 0: // Enrollment Type
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Select Enrollment Category
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Choose the category that best describes your enrollment status. New students and transferees follow the same streamlined process.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.enrollmentType}>
                  <FormLabel component="legend">Enrollment Type</FormLabel>
                  <RadioGroup
                    value={formData.enrollmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, enrollmentType: e.target.value }))}
                  >
                    <FormControlLabel 
                      value="new" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1">New Student / Transferee</Typography>
                          <Typography variant="body2" color="text.secondary">
                            First time enrolling at Eastern La Trinidad National High School or transferring from another school
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            • Same requirements and enrollment process for both new students and transferees
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="old" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1">Continuing Student</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Previously enrolled at Eastern La Trinidad National High School
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            • Simplified process with pre-filled school information
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                  {errors.enrollmentType && (
                    <FormHelperText>{errors.enrollmentType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          );

        case 1: // Combined Info
          return (
            <Grid container spacing={3}>
              {/* --- Student Information --- */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Student Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Please provide accurate student information as it appears on official documents.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <AIAssistantCard
                  show={!showAIUploader}
                  onStartAIProcessing={() => setShowAIUploader(true)}
                  instructions={
                    'Instructions:\n' +
                    '- Only upload PDF, JPEG, or PNG files of your Birth Certificate and Form 137.\n' +
                    '- Ensure that the files you upload are clear and readable. Blurry or poorly lit images may result in incorrect extraction.\n' +
                    '- After extraction, carefully review all input fields. Make sure the data filled in the form matches your official documents. Edit any incorrect or missing information before submitting.'
                  }
                />
              </Grid>
              {showAIUploader && (
                <Grid item xs={12}>
                  <AIDocumentUploader
                    formData={formData}
                    setFormData={setFormData}
                    onUploadComplete={handleAIDataExtracted}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Learner Reference Number (LRN)"
                  value={formData.learnerReferenceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, learnerReferenceNumber: e.target.value }))}
                  error={!!errors.learnerReferenceNumber}
                  helperText={errors.learnerReferenceNumber || 'Enter the 12-digit LRN'}
                  placeholder="e.g., 123456789012"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                  Full Name
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  required
                  label="Surname"
                  value={formData.surname}
                  onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                  error={!!errors.surname}
                  helperText={errors.surname}
                />
              </Grid>
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Extension (Jr., Sr., III)"
                  value={formData.extension}
                  onChange={(e) => setFormData(prev => ({ ...prev, extension: e.target.value }))}
                />
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Place of Birth"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                  error={!!errors.placeOfBirth}
                  helperText={errors.placeOfBirth}
                />
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Religion"
                  value={formData.religion}
                  onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))}
                  error={!!errors.religion}
                  helperText={errors.religion}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Citizenship"
                  value={formData.citizenship}
                  onChange={(e) => setFormData(prev => ({ ...prev, citizenship: e.target.value }))}
                  error={!!errors.citizenship}
                  helperText={errors.citizenship}
                  placeholder="e.g., Filipino"
                />
              </Grid>

              {/* --- Address & Contact --- */}
              <Grid item xs={12} mt={4}>
                <Typography variant="h6" gutterBottom>
                  Address & Contact Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provide your current residential address and contact information.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                  Residential Address
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="House Number"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseNumber: e.target.value }))}
                  error={!!errors.houseNumber}
                  helperText={errors.houseNumber}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Street/Subdivision"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber}
                  placeholder="e.g., 09123456789"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address (Optional)"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                  error={!!errors.emailAddress}
                  helperText={errors.emailAddress}
                  placeholder="e.g., student@email.com"
                />
              </Grid>

              {/* --- Previous School --- */}
              <Grid item xs={12} mt={4}>
                <Typography variant="h6" gutterBottom>
                  Previous School Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formData.enrollmentType === 'old' 
                    ? 'Provide details about your last completed grade level at Eastern La Trinidad National High School.'
                    : 'Provide details about your last attended school. This applies to both new students (from elementary) and transferees (from other high schools).'}
                </Typography>
              </Grid>
              {/* Show school info for new students and transferees only */}
              {formData.enrollmentType !== 'old' && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        New Students & Transferees - Unified Process
                      </Typography>
                      <Typography variant="body2">
                        Whether you're coming from elementary school or transferring from another high school, 
                        the enrollment requirements and process are the same. Simply provide information about 
                        your most recent school.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      required
                      label="Last School Attended"
                      value={formData.lastSchoolAttended}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastSchoolAttended: e.target.value }))}
                      error={!!errors.lastSchoolAttended}
                      helperText={errors.lastSchoolAttended}
                      placeholder="e.g., La Trinidad Elementary School"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth required error={!!errors.gradeLevel}>
                      <InputLabel>Grade Level Completed</InputLabel>
                      <Select
                        value={formData.gradeLevel}
                        label="Grade Level Completed"
                        onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                      >
                        <MenuItem value="Grade 6">Grade 6</MenuItem>
                        <MenuItem value="Grade 7">Grade 7</MenuItem>
                        <MenuItem value="Grade 8">Grade 8</MenuItem>
                        <MenuItem value="Grade 9">Grade 9</MenuItem>
                        <MenuItem value="Grade 10">Grade 10</MenuItem>
                        <MenuItem value="Grade 11">Grade 11</MenuItem>
                      </Select>
                      {errors.gradeLevel && <FormHelperText>{errors.gradeLevel}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      required
                      label="School Address"
                      value={formData.schoolAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, schoolAddress: e.target.value }))}
                      error={!!errors.schoolAddress}
                      helperText={errors.schoolAddress}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="School Year Completed"
                      value={formData.schoolYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, schoolYear: e.target.value }))}
                      error={!!errors.schoolYear}
                      helperText={errors.schoolYear}
                      placeholder="e.g., 2024-2025"
                    />
                  </Grid>
                </>
              )}
              {/* Show simplified form for continuing students */}
              {formData.enrollmentType === 'old' && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Continuing Student Information
                      </Typography>
                      <Typography variant="body2">
                        Since you're a continuing student at Eastern La Trinidad National High School, 
                        you only need to provide your last completed grade level and school year.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.gradeLevel}>
                      <InputLabel>Grade Level Completed</InputLabel>
                      <Select
                        value={formData.gradeLevel}
                        label="Grade Level Completed"
                        onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                      >
                        <MenuItem value="Grade 7">Grade 7</MenuItem>
                        <MenuItem value="Grade 8">Grade 8</MenuItem>
                        <MenuItem value="Grade 9">Grade 9</MenuItem>
                        <MenuItem value="Grade 10">Grade 10</MenuItem>
                        <MenuItem value="Grade 11">Grade 11</MenuItem>
                      </Select>
                      {errors.gradeLevel && <FormHelperText>{errors.gradeLevel}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="School Year Completed"
                      value={formData.schoolYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, schoolYear: e.target.value }))}
                      error={!!errors.schoolYear}
                      helperText={errors.schoolYear}
                      placeholder="e.g., 2024-2025"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Card sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          School Information
                        </Typography>
                        <Typography variant="body1">
                          <strong>Last School Attended:</strong> Eastern La Trinidad National High School
                        </Typography>
                        <Typography variant="body1">
                          <strong>School Address:</strong> La Trinidad, Benguet
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* --- Family Information --- */}
              <Grid item xs={12} mt={4}>
                <Typography variant="h6" gutterBottom>
                  Family Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Please provide information about your parents/guardians and emergency contact.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                  Father's Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Father's Full Name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                  error={!!errors.fatherName}
                  helperText={errors.fatherName}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Father's Occupation"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, fatherOccupation: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Father's Contact Number"
                  value={formData.fatherContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, fatherContactNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                  Mother's Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Mother's Full Name"
                  value={formData.motherName}
                  onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                  error={!!errors.motherName}
                  helperText={errors.motherName}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mother's Occupation"
                  value={formData.motherOccupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, motherOccupation: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mother's Contact Number"
                  value={formData.motherContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, motherContactNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                  Guardian Information (if applicable)
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Guardian's Full Name"
                  value={formData.guardianName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Relationship</InputLabel>
                  <Select
                    value={formData.guardianRelationship}
                    label="Relationship"
                    onChange={(e) => setFormData(prev => ({ ...prev, guardianRelationship: e.target.value }))}
                  >
                    <MenuItem value="">
                      <em>Select relationship</em>
                    </MenuItem>
                    <MenuItem value="Grandparent">Grandparent</MenuItem>
                    <MenuItem value="Aunt">Aunt</MenuItem>
                    <MenuItem value="Uncle">Uncle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Guardian's Occupation"
                  value={formData.guardianOccupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianOccupation: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Guardian's Contact Number"
                  value={formData.guardianContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianContactNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                  Emergency Contact
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  error={!!errors.emergencyContactName}
                  helperText={errors.emergencyContactName}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Relationship to Student"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                  placeholder="e.g., Mother, Father, Uncle"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Emergency Contact Number"
                  value={formData.emergencyContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactNumber: e.target.value }))}
                  error={!!errors.emergencyContactNumber}
                  helperText={errors.emergencyContactNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact Address"
                  value={formData.emergencyContactAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactAddress: e.target.value }))}
                />
              </Grid>
            </Grid>
          );

        case 2: // Enrollment Details
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Enrollment Details
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select the grade level and program you wish to enroll in.
                </Typography>
                {formData.enrollmentType === 'new' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> The system will automatically determine if you're a new student or transferee 
                      based on your grade level selection and previous school information for administrative purposes.
                    </Typography>
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.gradeToEnroll}>
                  <InputLabel>Grade Level to Enroll</InputLabel>
                  <Select
                    value={formData.gradeToEnroll}
                    label="Grade Level to Enroll"
                    onChange={(e) => setFormData(prev => ({ ...prev, gradeToEnroll: e.target.value, track: '' }))}
                  >
                    {gradeLevels.map((grade) => (
                      <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                    ))}
                  </Select>
                  {errors.gradeToEnroll && <FormHelperText>{errors.gradeToEnroll}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Senior High School Options */}
              {(formData.gradeToEnroll === 'Grade 11' || formData.gradeToEnroll === 'Grade 12') && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                      Senior High School Program
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Senior High School students must choose a track.
                    </Alert>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.track}>
                      <InputLabel>Track</InputLabel>
                      <Select
                        value={formData.track}
                        label="Track"
                        onChange={(e) => setFormData(prev => ({ ...prev, track: e.target.value }))}
                      >
                        {tracks.map((track) => (
                          <MenuItem key={track} value={track}>{track}</MenuItem>
                        ))}
                      </Select>
                      {errors.track && <FormHelperText>{errors.track}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {formData.track && (
                    <Grid item xs={12}>
                      <Card sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                        <CardContent>
                          <Typography variant="h6" color="primary" gutterBottom>
                            Program Selection Summary
                          </Typography>
                          <Typography variant="body1">
                            <strong>Grade Level:</strong> {formData.gradeToEnroll}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Track:</strong> {formData.track}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          );

        case 3: // Upload Documents
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Upload Documents (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  You can upload documents now or submit them later. Files should be in PDF, JPG, or PNG format.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Recommended Documents:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    While not required to proceed, having these documents ready will speed up your enrollment process:
                  </Typography>
                  <List dense>
                    {requirements.map((req, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText primary={`• ${req}`} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              </Grid>

              {/* Form 137 Upload */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, border: formData.form137File ? '2px solid green' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>Form 137 (Permanent Record)</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.form137File ? 'Change File' : 'Upload Form 137'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('form137File', e.target.files[0])}
                    />
                  </Button>
                  {formData.form137File && (
                    <Typography variant="body2" color="success.main">
                      ✓ {formData.form137File.name}
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* Form 138 Upload */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, border: formData.form138File ? '2px solid green' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>Form 138 (Report Card)</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.form138File ? 'Change File' : 'Upload Form 138'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('form138File', e.target.files[0])}
                    />
                  </Button>
                  {formData.form138File && (
                    <Typography variant="body2" color="success.main">
                      ✓ {formData.form138File.name}
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* Good Moral Upload */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, border: formData.goodMoralFile ? '2px solid green' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>Certificate of Good Moral Character</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.goodMoralFile ? 'Change File' : 'Upload Good Moral'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('goodMoralFile', e.target.files[0])}
                    />
                  </Button>
                  {formData.goodMoralFile && (
                    <Typography variant="body2" color="success.main">
                      ✓ {formData.goodMoralFile.name}
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* Medical Certificate Upload */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, border: formData.medicalCertificateFile ? '2px solid green' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>Medical Certificate</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.medicalCertificateFile ? 'Change File' : 'Upload Medical Certificate'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('medicalCertificateFile', e.target.files[0])}
                    />
                  </Button>
                  {formData.medicalCertificateFile && (
                    <Typography variant="body2" color="success.main">
                      ✓ {formData.medicalCertificateFile.name}
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* Parent ID Upload */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, border: formData.parentIdFile ? '2px solid green' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>Parent/Guardian Valid ID</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.parentIdFile ? 'Change File' : 'Upload Parent ID'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('parentIdFile', e.target.files[0])}
                    />
                  </Button>
                  {formData.parentIdFile && (
                    <Typography variant="body2" color="success.main">
                      ✓ {formData.parentIdFile.name}
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* ID Pictures Upload */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, border: formData.idPicturesFile ? '2px solid green' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>2x2 ID Pictures (4 pieces)</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.idPicturesFile ? 'Change File' : 'Upload ID Pictures'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('idPicturesFile', e.target.files[0])}
                    />
                  </Button>
                  {formData.idPicturesFile && (
                    <Typography variant="body2" color="success.main">
                      ✓ {formData.idPicturesFile.name}
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* Medical Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
                  Medical Information (Optional)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Special Needs or Disabilities (if any)"
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialNeeds: e.target.value }))}
                  placeholder="Please describe any special needs, learning disabilities, or physical conditions"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Known Allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="List any known allergies (food, medicine, environmental)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Current Medications"
                  value={formData.medications}
                  onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                  placeholder="List any medications currently being taken"
                />
              </Grid>
            </Grid>
          );

        case 4: // Review & Submit
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Review & Submit
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Please review all information before submitting your enrollment application.
                </Typography>
              </Grid>

              {/* Student Information Review */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Student Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">LRN:</Typography>
                      <Typography variant="body1">{formData.learnerReferenceNumber || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Full Name:</Typography>
                      <Typography variant="body1">
                        {`${formData.surname}, ${formData.firstName} ${formData.middleName} ${formData.extension}`.trim()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Date of Birth:</Typography>
                      <Typography variant="body1">
                        {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Sex:</Typography>
                      <Typography variant="body1">{formData.sex || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Address Review */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Address & Contact
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Address:</Typography>
                      <Typography variant="body1">
                        {`${formData.houseNumber} ${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}`.trim()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Contact Number:</Typography>
                      <Typography variant="body1">{formData.contactNumber || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Email:</Typography>
                      <Typography variant="body1">{formData.emailAddress || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Enrollment Details Review */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Enrollment Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Grade to Enroll:</Typography>
                      <Typography variant="body1">{formData.gradeToEnroll || 'Not selected'}</Typography>
                    </Grid>
                    {(formData.gradeToEnroll === 'Grade 11' || formData.gradeToEnroll === 'Grade 12') && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">Track:</Typography>
                        <Typography variant="body1">{formData.track || 'Not selected'}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              </Grid>

              {/* Family Information Review */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <FamilyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Family Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Father's Name:</Typography>
                      <Typography variant="body1">{formData.fatherName || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Mother's Name:</Typography>
                      <Typography variant="body1">{formData.motherName || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Emergency Contact:</Typography>
                      <Typography variant="body1">{formData.emergencyContactName || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Emergency Contact Number:</Typography>
                      <Typography variant="body1">{formData.emergencyContactNumber || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Documents Review */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Documents Checklist
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                      <Chip 
                        label="Form 137" 
                        color={formData.form137 ? "success" : "default"}
                        icon={formData.form137 ? <CheckIcon /> : undefined}
                        variant={formData.form137 ? "filled" : "outlined"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Chip 
                        label="Form 138" 
                        color={formData.form138 ? "success" : "default"}
                        icon={formData.form138 ? <CheckIcon /> : undefined}
                        variant={formData.form138 ? "filled" : "outlined"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Chip 
                        label="Good Moral Certificate" 
                        color={formData.goodMoral ? "success" : "default"}
                        icon={formData.goodMoral ? <CheckIcon /> : undefined}
                        variant={formData.goodMoral ? "filled" : "outlined"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Chip 
                        label="Medical Certificate" 
                        color={formData.medicalCertificate ? "success" : "default"}
                        icon={formData.medicalCertificate ? <CheckIcon /> : undefined}
                        variant={formData.medicalCertificate ? "filled" : "outlined"}
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Agreement */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Enrollment Agreement
                  </Typography>
                  <Typography variant="body2" paragraph>
                    By submitting this enrollment application, I certify that:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="• All information provided is true and complete to the best of my knowledge" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• I understand that providing false information may result in the rejection of this application" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• I agree to comply with all school policies and regulations" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• I understand that enrollment is subject to verification of documents and available slots" />
                    </ListItem>
                  </List>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreementAccepted}
                        onChange={(e) => setFormData(prev => ({ ...prev, agreementAccepted: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="I have read and agree to the enrollment terms and conditions"
                    sx={{ mt: 2 }}
                  />
                  {errors.agreementAccepted && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {errors.agreementAccepted}
                    </Typography>
                  )}
                </Card>
              </Grid>
            </Grid>
          );

        default:
          return <Typography>Step content not found</Typography>;
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 },
          backgroundColor: '#ffffff',
          borderRadius: '16px',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          backgroundColor: '#1976d2',
          borderRadius: '12px',
          p: 3,
          color: 'white'
        }}>
          <SchoolIcon sx={{ fontSize: 48, mr: 3 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Student Enrollment
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              Eastern La Trinidad National High School
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              School Year 2025-2026 • Complete your enrollment application online
            </Typography>
          </Box>
        </Box>

        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root .Mui-completed': {
              color: 'success.main',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: 'primary.main',
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleFormSubmit} noValidate>
          <Box sx={{ mt: 4, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                color: 'text.secondary',
              }}
            >
              Back
            </Button>
            
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              endIcon={activeStep === steps.length - 1 ? (loading ? <CircularProgress size={24} /> : <SendIcon />) : undefined}
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                }
              }}
            >
              {activeStep === steps.length - 1 
                ? 'Submit Enrollment' 
                : 'Next'}
            </Button>
          </Box>
        </form>

        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSuccess(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Enrollment application submitted successfully! You can track the status in My Requests.
          </Alert>
        </Snackbar>

        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowError(false)} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Paper>

    </Container>
  );
};

export default Enrollment;
