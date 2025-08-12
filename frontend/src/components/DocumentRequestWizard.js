import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoFixHigh as AutoFixHighIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AIDocumentUploader from './AIDocumentUploader';
import { documentService } from '../services/api';

const steps = [
  'Document Type & Purpose',
  'Upload Documents',
  'Personal Information', 
  'Educational Information',
  'Review & Submit'
];

const DocumentRequestWizard = ({ onRequestCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    documentType: '',
    purpose: '',
    priority: 'normal',
    
    // Personal Info
    surname: '',
    givenName: '',
    middleName: '',
    dateOfBirth: null,
    placeOfBirth: '',
    province: '',
    town: '',
    barrio: '',
    sex: '',
    studentNumber: '',
    
    // Parent/Guardian Info
    parentGuardianName: '',
    parentGuardianAddress: '',
    parentGuardianOccupation: '',
    
    // Educational Info
    elementaryCourseCompleted: '',
    elementarySchool: '',
    elementaryYear: '',
    elementaryGenAve: '',
    yearGraduated: '',
    currentSchool: '',
    schoolAddress: '',
    trackStrand: '',
    gradeLevel: '',
    schoolYear: '',
    
    // Pickup Info
    preferredPickupDate: '',
    preferredPickupTime: '',
    additionalNotes: ''
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [autoFillApplied, setAutoFillApplied] = useState(false);

  const documentTypes = [
    { value: 'form137', label: 'Form 137 (Transfer Credentials)' },
    { value: 'form138', label: 'Form 138 (Report Card)' },
    { value: 'goodMoral', label: 'Certificate of Good Moral Character' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'transcript', label: 'Transcript of Records' }
  ];

  const priorities = [
    { value: 'normal', label: 'Normal (3-5 business days)' },
    { value: 'high', label: 'High Priority (2-3 business days)' },
    { value: 'urgent', label: 'Urgent (1-2 business days)' }
  ];

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleFileUpload = (uploadResult) => {
    setUploadedFiles(prev => [...prev, uploadResult]);
    if (uploadResult.data) {
      setExtractedData(uploadResult.data);
    }
  };

  const applyAutoFill = () => {
    if (extractedData && extractedData.form137Data) {
      const extracted = extractedData.form137Data;
      setFormData(prev => ({
        ...prev,
        surname: extracted.surname || prev.surname,
        givenName: extracted.givenName || prev.givenName,
        middleName: extracted.middleName || prev.middleName,
        dateOfBirth: extracted.dateOfBirth ? new Date(extracted.dateOfBirth) : prev.dateOfBirth,
        placeOfBirth: extracted.placeOfBirth || prev.placeOfBirth,
        studentNumber: extracted.studentNumber || prev.studentNumber,
        sex: extracted.sex || prev.sex,
        elementarySchool: extracted.elementarySchool || prev.elementarySchool,
        elementaryYear: extracted.elementaryYear || prev.elementaryYear
      }));
      setAutoFillApplied(true);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.documentType) newErrors.documentType = 'Document type is required';
        if (!formData.purpose) newErrors.purpose = 'Purpose is required';
        break;
      case 2:
        if (!formData.surname) newErrors.surname = 'Surname is required';
        if (!formData.givenName) newErrors.givenName = 'Given name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.sex) newErrors.sex = 'Sex is required';
        break;
      case 3:
        if (formData.documentType === 'form137' || formData.documentType === 'form138') {
          if (!formData.gradeLevel) newErrors.gradeLevel = 'Grade level is required';
          if (!formData.schoolYear) newErrors.schoolYear = 'School year is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'dateOfBirth' && formData[key]) {
            submitData.append(key, formData[key].toISOString());
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });
      
      // Add files
      uploadedFiles.forEach((fileData, index) => {
        if (fileData.file) {
          submitData.append('documents', fileData.file);
        }
      });
      
      const response = await documentService.createRequest(submitData);
      
      if (onRequestCreated) {
        onRequestCreated(response.data);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrors({ submit: 'Error submitting request. Please try again.' });
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
              <FormControl fullWidth error={!!errors.documentType}>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={formData.documentType}
                  onChange={handleInputChange('documentType')}
                  label="Document Type"
                >
                  {documentTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose of Request"
                value={formData.purpose}
                onChange={handleInputChange('purpose')}
                error={!!errors.purpose}
                helperText={errors.purpose}
                multiline
                rows={3}
                placeholder="e.g., For transfer to another school, college application, employment, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={handleInputChange('priority')}
                  label="Priority Level"
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <AIDocumentUploader onUploadComplete={handleFileUpload} />
            
            {extractedData && !autoFillApplied && (
              <Alert 
                severity="info" 
                action={
                  <Button 
                    startIcon={<AutoFixHighIcon />}
                    onClick={applyAutoFill}
                    size="small"
                  >
                    Auto-Fill Form
                  </Button>
                }
                sx={{ mt: 2 }}
              >
                AI detected information in your document. Click to auto-fill the form with extracted data.
              </Alert>
            )}
            
            {autoFillApplied && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Form auto-filled with extracted data. Please review and edit as needed.
              </Alert>
            )}
            
            {uploadedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
                {uploadedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.filename || `Document ${index + 1}`}
                    onDelete={() => {
                      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                    color="primary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Surname"
                value={formData.surname}
                onChange={handleInputChange('surname')}
                error={!!errors.surname}
                helperText={errors.surname}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Given Name"
                value={formData.givenName}
                onChange={handleInputChange('givenName')}
                error={!!errors.givenName}
                helperText={errors.givenName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.middleName}
                onChange={handleInputChange('middleName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleDateChange('dateOfBirth')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Place of Birth"
                value={formData.placeOfBirth}
                onChange={handleInputChange('placeOfBirth')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.sex}>
                <InputLabel>Sex</InputLabel>
                <Select
                  value={formData.sex}
                  onChange={handleInputChange('sex')}
                  label="Sex"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Number"
                value={formData.studentNumber}
                onChange={handleInputChange('studentNumber')}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade Level"
                value={formData.gradeLevel}
                onChange={handleInputChange('gradeLevel')}
                error={!!errors.gradeLevel}
                helperText={errors.gradeLevel}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="School Year"
                value={formData.schoolYear}
                onChange={handleInputChange('schoolYear')}
                error={!!errors.schoolYear}
                helperText={errors.schoolYear}
                placeholder="e.g., 2023-2024"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current/Last School"
                value={formData.currentSchool}
                onChange={handleInputChange('currentSchool')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School Address"
                value={formData.schoolAddress}
                onChange={handleInputChange('schoolAddress')}
              />
            </Grid>
            {(formData.documentType === 'form137' || formData.documentType === 'form138') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Track/Strand (for SHS)"
                  value={formData.trackStrand}
                  onChange={handleInputChange('trackStrand')}
                  placeholder="e.g., STEM, ABM, HUMSS"
                />
              </Grid>
            )}
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review Your Request</Typography>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Document Information</Typography>
                <Typography>Type: {documentTypes.find(t => t.value === formData.documentType)?.label}</Typography>
                <Typography>Purpose: {formData.purpose}</Typography>
                <Typography>Priority: {priorities.find(p => p.value === formData.priority)?.label}</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Personal Information</Typography>
                <Typography>Name: {formData.surname}, {formData.givenName} {formData.middleName}</Typography>
                <Typography>Date of Birth: {formData.dateOfBirth?.toLocaleDateString()}</Typography>
                <Typography>Sex: {formData.sex}</Typography>
                <Typography>Student Number: {formData.studentNumber}</Typography>
              </CardContent>
            </Card>
            
            {uploadedFiles.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Uploaded Documents</Typography>
                  {uploadedFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.filename || `Document ${index + 1}`}
                      color="primary"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
            
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Document Request
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 400, mb: 3 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained">
            Next
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default DocumentRequestWizard;
