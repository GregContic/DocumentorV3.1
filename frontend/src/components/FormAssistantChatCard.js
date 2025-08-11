import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  SmartToy,
  Help,
  AutoAwesome,
  Upload,
  CheckCircle,
  Info,
  Search,
  Phone,
  Email,
} from '@mui/icons-material';

const FormAssistantChatCard = ({ onAIUpload, formType = 'Form 137', formData, setFormData, errors }) => {
  const [expanded, setExpanded] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [lrnDialogOpen, setLrnDialogOpen] = useState(false);
  const [lrnLookupData, setLrnLookupData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    previousSchool: ''
  });
  const [lrnLookupResult, setLrnLookupResult] = useState(null);
  const [lrnLoading, setLrnLoading] = useState(false);
  const [validationResults, setValidationResults] = useState([]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleFieldGuidance = () => {
    setHelpDialogOpen(true);
  };

  const handleValidationCheck = () => {
    const results = validateForm();
    setValidationResults(results);
    setValidationDialogOpen(true);
  };

  const handleLrnLookup = () => {
    setLrnDialogOpen(true);
  };

  const validateForm = () => {
    const results = [];
    
    // Basic validation checks
    if (formData) {
      if (!formData.firstName || formData.firstName.trim() === '') {
        results.push({ field: 'First Name', status: 'error', message: 'First name is required' });
      } else {
        results.push({ field: 'First Name', status: 'success', message: 'Valid' });
      }

      if (!formData.surname || formData.surname.trim() === '') {
        results.push({ field: 'Surname', status: 'error', message: 'Surname is required' });
      } else {
        results.push({ field: 'Surname', status: 'success', message: 'Valid' });
      }

      if (!formData.learnerReferenceNumber || formData.learnerReferenceNumber.trim() === '') {
        results.push({ field: 'LRN', status: 'warning', message: 'LRN is missing - use "Forgot LRN?" option' });
      } else if (formData.learnerReferenceNumber.length !== 12) {
        results.push({ field: 'LRN', status: 'error', message: 'LRN must be exactly 12 digits' });
      } else {
        results.push({ field: 'LRN', status: 'success', message: 'Valid' });
      }

      if (!formData.dateOfBirth) {
        results.push({ field: 'Date of Birth', status: 'error', message: 'Date of birth is required' });
      } else {
        results.push({ field: 'Date of Birth', status: 'success', message: 'Valid' });
      }

      // Add more validation based on form type
      if (formType.includes('137') || formType.includes('Enrollment')) {
        if (!formData.lastSchoolAttended || formData.lastSchoolAttended.trim() === '') {
          results.push({ field: 'Last School Attended', status: 'error', message: 'Last school attended is required' });
        }
      }
    } else {
      results.push({ field: 'Form Data', status: 'error', message: 'No form data available to validate' });
    }

    return results;
  };

  const performLrnLookup = async () => {
    setLrnLoading(true);
    
    // Simulate API call for LRN lookup
    setTimeout(() => {
      // Mock LRN lookup result
      if (lrnLookupData.firstName && lrnLookupData.lastName && lrnLookupData.birthDate) {
        setLrnLookupResult({
          found: true,
          lrn: '123456789012',
          fullName: `${lrnLookupData.firstName} ${lrnLookupData.lastName}`,
          previousSchool: lrnLookupData.previousSchool || 'Eastern La Trinidad National High School'
        });
      } else {
        setLrnLookupResult({
          found: false,
          message: 'No matching record found. Please contact the registrar\'s office.'
        });
      }
      setLrnLoading(false);
    }, 2000);
  };

  const applyLrnToForm = () => {
    if (lrnLookupResult && lrnLookupResult.found && setFormData) {
      setFormData(prev => ({
        ...prev,
        learnerReferenceNumber: lrnLookupResult.lrn
      }));
      setLrnDialogOpen(false);
      setLrnLookupResult(null);
    }
  };

  const assistanceItems = [
    {
      icon: <Upload color="primary" />,
      title: 'AI Document Upload',
      description: 'Upload your old documents and let AI auto-fill the form',
      action: 'Upload Document',
      onClick: onAIUpload,
    },
    {
      icon: <Search color="secondary" />,
      title: 'Forgot LRN?',
      description: 'Look up your Learner Reference Number using your personal details',
      action: 'Find LRN',
      onClick: handleLrnLookup,
    },
    {
      icon: <Help color="info" />,
      title: 'Field Guidance',
      description: `Get help understanding ${formType} requirements and field explanations`,
      action: 'Get Help',
      onClick: handleFieldGuidance,
    },
    {
      icon: <CheckCircle color="success" />,
      title: 'Validation Check',
      description: 'Check if all required fields are properly filled and valid',
      action: 'Check Form',
      onClick: handleValidationCheck,
    },
  ];

  const quickTips = [
    `${formType} is your official academic record`,
    'All fields marked with * are required',
    'Double-check your personal information for accuracy',
    'Use the "Forgot LRN?" feature if you don\'t know your LRN',
    'Contact the registrar\'s office: (074) 422-2104 for assistance',
  ];

  const getFieldHelp = () => {
    const helpData = {
      'Form 137': {
        'LRN': 'Your 12-digit Learner Reference Number assigned by DepEd',
        'Full Name': 'Enter your complete name as it appears on your birth certificate',
        'Date of Birth': 'Use the format MM/DD/YYYY',
        'Last School Attended': 'Name of the school you last attended',
        'Grade Level': 'The grade level you completed at your last school',
        'School Year': 'The school year when you last attended (e.g., 2023-2024)'
      },
      'Form 138': {
        'Student Number': 'Your student ID number from your current/previous school',
        'Grade Level': 'The grade level you need the report card for',
        'School Year': 'The specific school year you need records for'
      },
      'Enrollment': {
        'LRN': 'Your 12-digit Learner Reference Number from DepEd',
        'Grade to Enroll': 'Select the grade level you want to enroll in',
        'Track': 'For Senior High School, choose your academic track',
        'Previous School': 'Complete name and address of your last school'
      },
      'School Form 9': {
        'Student Number': 'Your assigned student ID number',
        'Grade Level': 'Current grade level you are enrolled in'
      },
      'School Form 10': {
        'Student Number': 'Your school-assigned student identification number',
        'Academic Year': 'The school year you need the learner\'s profile for'
      },
      'Diploma Request': {
        'Student Number': 'Your student ID when you graduated',
        'Year Graduated': 'The year you completed your studies'
      }
    };

    return helpData[formType] || helpData['Form 137'];
  };

  return (
    <Card
      sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        border: '1px solid #2196f3',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ cursor: 'pointer' }}
          onClick={handleToggle}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SmartToy color="primary" />
            <Typography variant="h6" color="primary" fontWeight={600}>
              AI Form Assistant
            </Typography>
            <Chip
              label="Smart Help"
              size="small"
              icon={<AutoAwesome />}
              color="primary"
              variant="outlined"
            />
          </Box>
          <IconButton color="primary">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Get AI-powered assistance with your {formType} request
        </Typography>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* AI Assistance Options */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Available Assistance:
            </Typography>
            <List dense>
              {assistanceItems.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.description}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={item.onClick}
                    sx={{ ml: 1 }}
                  >
                    {item.action}
                  </Button>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Quick Tips */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              <Info fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Quick Tips:
            </Typography>
            <Box sx={{ pl: 2 }}>
              {quickTips.map((tip, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    position: 'relative',
                    pl: 2,
                    mb: 0.5,
                    '&::before': {
                      content: '"•"',
                      position: 'absolute',
                      left: 0,
                      color: 'primary.main',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  {tip}
                </Typography>
              ))}
            </Box>

            {/* Call to Action */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                borderRadius: 1,
                border: '1px dashed #1976d2',
              }}
            >
              <Typography variant="body2" color="primary" textAlign="center">
                💡 <strong>Pro Tip:</strong> Use the floating chat button (bottom-right) for instant help anytime!
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </CardContent>

      {/* Field Guidance Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Help color="info" />
            {formType} Field Guide
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Here's help with common fields in your {formType} request:
          </Typography>
          
          {Object.entries(getFieldHelp()).map(([field, description]) => (
            <Accordion key={field} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" color="primary">
                  {field}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  {description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Need more help?</strong><br />
              📞 Call: (074) 422-2104<br />
              📧 Email: registrar@eltnhs.edu.ph<br />
              🕒 Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Validation Results Dialog */}
      <Dialog open={validationDialogOpen} onClose={() => setValidationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            Form Validation Results
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Here's the status of your form fields:
          </Typography>
          
          {validationResults.map((result, index) => (
            <Alert 
              key={index} 
              severity={result.status === 'success' ? 'success' : result.status === 'warning' ? 'warning' : 'error'}
              sx={{ mb: 1 }}
            >
              <Typography variant="body2">
                <strong>{result.field}:</strong> {result.message}
              </Typography>
            </Alert>
          ))}

          {validationResults.length === 0 && (
            <Alert severity="info">
              No form data available to validate. Please fill out the form first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* LRN Lookup Dialog */}
      <Dialog open={lrnDialogOpen} onClose={() => setLrnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Search color="secondary" />
            Find Your LRN
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your personal details to look up your Learner Reference Number:
          </Typography>
          
          {!lrnLookupResult && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="First Name"
                value={lrnLookupData.firstName}
                onChange={(e) => setLrnLookupData(prev => ({...prev, firstName: e.target.value}))}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lrnLookupData.lastName}
                onChange={(e) => setLrnLookupData(prev => ({...prev, lastName: e.target.value}))}
                required
              />
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={lrnLookupData.birthDate}
                onChange={(e) => setLrnLookupData(prev => ({...prev, birthDate: e.target.value}))}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Previous School (Optional)"
                value={lrnLookupData.previousSchool}
                onChange={(e) => setLrnLookupData(prev => ({...prev, previousSchool: e.target.value}))}
                helperText="This can help verify your identity"
              />
            </Box>
          )}

          {lrnLookupResult && (
            <Box>
              {lrnLookupResult.found ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>LRN Found!</strong><br />
                    LRN: <strong>{lrnLookupResult.lrn}</strong><br />
                    Name: {lrnLookupResult.fullName}<br />
                    Previous School: {lrnLookupResult.previousSchool}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {lrnLookupResult.message}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {!lrnLookupResult && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Can't find your LRN?</strong><br />
                📞 Call the registrar's office: (074) 422-2104<br />
                📧 Email: registrar@eltnhs.edu.ph<br />
                Visit the school office with a valid ID
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setLrnDialogOpen(false);
            setLrnLookupResult(null);
            setLrnLookupData({ firstName: '', lastName: '', birthDate: '', previousSchool: '' });
          }}>
            Cancel
          </Button>
          
          {!lrnLookupResult && (
            <Button 
              onClick={performLrnLookup}
              variant="contained"
              disabled={lrnLoading || !lrnLookupData.firstName || !lrnLookupData.lastName || !lrnLookupData.birthDate}
              startIcon={lrnLoading ? <CircularProgress size={20} /> : <Search />}
            >
              {lrnLoading ? 'Searching...' : 'Search LRN'}
            </Button>
          )}

          {lrnLookupResult && lrnLookupResult.found && setFormData && (
            <Button 
              onClick={applyLrnToForm}
              variant="contained"
              color="success"
            >
              Use This LRN
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FormAssistantChatCard;
