import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  Alert,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  PhotoCamera as CameraIcon,
  TextFields as OCRIcon,
  Psychology as BrainIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

const AIFeaturesDemo = () => {
  const [activeDemo, setActiveDemo] = useState(null);

  const features = [
    {
      id: 'ocr',
      title: 'Advanced OCR Technology',
      description: 'Extract text from images with 95%+ accuracy using Tesseract.js',
      icon: <OCRIcon />,
      color: 'primary',
      details: [
        'Supports multiple image formats (JPG, PNG, GIF, BMP, WebP)',
        'Handles various document orientations and lighting conditions',
        'Real-time progress tracking during text extraction',
        'Confidence scoring for extracted text quality'
      ]
    },
    {
      id: 'ai-parsing',
      title: 'Intelligent Information Parsing',
      description: 'AI algorithms automatically identify and categorize information',
      icon: <BrainIcon />,
      color: 'secondary',
      details: [
        'Pattern recognition for names, dates, and ID numbers',
        'Smart field mapping to form components',
        'Document type identification (Form 137, ID, Transcript)',
        'Context-aware information extraction'
      ]
    },
    {
      id: 'security',
      title: 'Privacy-First Processing',
      description: 'All processing happens locally in your browser',
      icon: <SecurityIcon />,
      color: 'success',
      details: [
        'No data sent to external servers',
        'Client-side OCR and AI processing',
        'Images processed locally and discarded after use',
        'Zero data retention or storage'
      ]
    },
    {
      id: 'speed',
      title: 'Lightning Fast Performance',
      description: 'Extract information from documents in under 30 seconds',
      icon: <SpeedIcon />,
      color: 'warning',
      details: [
        'Optimized algorithms for quick processing',
        'Progressive loading with real-time updates',
        'Efficient memory usage for large images',
        'Background processing doesn\'t block UI'
      ]
    }
  ];

  const processSteps = [
    {
      title: 'Upload Document',
      description: 'Drag & drop or select an image of your document',
      icon: <UploadIcon />
    },
    {
      title: 'OCR Processing',
      description: 'Advanced OCR extracts all text from the image',
      icon: <OCRIcon />
    },
    {
      title: 'AI Analysis',
      description: 'AI algorithms parse and categorize the extracted text',
      icon: <BrainIcon />
    },
    {
      title: 'Smart Mapping',
      description: 'Information is automatically mapped to form fields',
      icon: <CheckIcon />
    }
  ];

  const supportedDocuments = [
    'Form 137 (Permanent Record)',
    'Student ID Cards',
    'Academic Transcripts',
    'Report Cards',
    'Diplomas and Certificates',
    'Official School Documents'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <AIIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            AI-Powered Document Processing
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Revolutionize your document workflow with cutting-edge AI technology that extracts 
            and processes information from images in seconds.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Chip 
              label="Powered by Tesseract.js" 
              color="primary" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label="Client-Side Processing" 
              color="success" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label="Privacy First" 
              color="secondary" 
            />
          </Box>
        </Box>

        {/* How It Works */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            How It Works
          </Typography>
          <Timeline position="alternate">
            {processSteps.map((step, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color="primary" sx={{ p: 1 }}>
                    {step.icon}
                  </TimelineDot>
                  {index < processSteps.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="h3">
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>

        {/* Features Grid */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            Key Features
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} md={6} key={feature.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: activeDemo === feature.id ? 2 : 1,
                    borderColor: activeDemo === feature.id ? `${feature.color}.main` : 'divider',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => setActiveDemo(activeDemo === feature.id ? null : feature.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        color: `${feature.color}.main`, 
                        mr: 2,
                        fontSize: 40
                      }}>
                        {feature.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {activeDemo === feature.id && (
                      <Box sx={{ mt: 2 }}>
                        <List dense>
                          {feature.details.map((detail, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={detail}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Supported Documents */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            Supported Documents
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {supportedDocuments.map((doc, index) => (
              <Grid item key={index}>
                <Chip 
                  label={doc} 
                  variant="outlined" 
                  color="primary"
                  sx={{ m: 0.5 }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Performance Stats */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Performance Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                95%+
              </Typography>
              <Typography variant="body2">
                OCR Accuracy Rate
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                &lt;30s
              </Typography>
              <Typography variant="body2">
                Average Processing Time
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                100%
              </Typography>
              <Typography variant="body2">
                Privacy Protected
              </Typography>
            </Grid>
          </Grid>
        </Alert>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Ready to Experience AI-Powered Document Processing?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Try it now in the Form 137 request page and see how AI can streamline your document workflow.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AIIcon />}
            href="/request/form-137"
            sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              px: 4,
              py: 1.5,
            }}
          >
            Try AI Processing Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AIFeaturesDemo;
