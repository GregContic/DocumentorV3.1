import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Collapse,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  // ...existing code...
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';

const AIAssistantCard = ({ onStartAIProcessing, show = true }) => {
  const [expanded, setExpanded] = useState(false);

  if (!show) return null;

  const features = [
    {
      icon: <SpeedIcon color="primary" />,
      title: 'Fast Processing',
      description: 'Extract information in under 30 seconds'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure & Private',
      description: 'Processing happens locally in your browser'
    },
    {
      icon: <BrainIcon color="primary" />,
      title: 'Smart Recognition',
      description: 'AI recognizes various document formats and layouts'
    },
    {
      icon: <CheckIcon color="success" />,
      title: 'High Accuracy',
      description: 'Advanced OCR with intelligent field mapping'
    }
  ];

  return (
    <Card
      sx={{
        mb: 3,
        background: '#f7fafc',
        color: '#222',
        borderRadius: 4,
        boxShadow: '0 4px 24px 0 rgba(60, 120, 180, 0.10)',
        border: '1px solid #e3e8ee',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #b2f7ef 0%, #f7d6e0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            boxShadow: '0 2px 8px 0 rgba(60, 120, 180, 0.10)',
          }}>
            <BrainIcon sx={{ fontSize: 32, color: '#3a7bd5' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#3a7bd5' }}>
              Document AI Assistant
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', opacity: 0.9 }}>
              Upload your school documents and let our AI help you fill out your enrollment form quickly and accurately.
            </Typography>
          </Box>
          <Chip
            label="AI"
            size="small"
            sx={{
              backgroundColor: '#e3e8ee',
              color: '#3a7bd5',
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={onStartAIProcessing}
            sx={{
              backgroundColor: '#3a7bd5',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 8px 0 rgba(60, 120, 180, 0.10)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#2457a6',
              },
            }}
            startIcon={<BrainIcon />}
          >
            Use Document AI
          </Button>
          <Button
            variant="outlined"
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: '#3a7bd5',
              borderColor: '#3a7bd5',
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#e3e8ee',
                borderColor: '#2457a6',
                color: '#2457a6',
              },
            }}
            endIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
          >
            {expanded ? 'Hide Details' : 'How it works'}
          </Button>
        </Box>

        <Collapse in={expanded}>
          <Alert
            severity="info"
            sx={{
              mb: 2,
              backgroundColor: '#e3e8ee',
              color: '#2457a6',
              borderRadius: 2,
              boxShadow: 'none',
              fontWeight: 500,
              '& .MuiAlert-icon': {
                color: '#3a7bd5',
              },
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#2457a6', fontWeight: 700 }}>
              How Document AI Works:
            </Typography>
            <Typography variant="body2" sx={{ color: '#444' }}>
              1. Upload a clear photo or PDF of your school document<br />
              2. AI extracts and analyzes the text<br />
              3. Information is mapped to your enrollment form<br />
              4. You review and confirm before submitting
            </Typography>
          </Alert>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, color: '#2457a6', fontWeight: 700 }}>
            Features:
          </Typography>
          <List dense>
            {features.map((feature, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {feature.icon}
                </ListItemIcon>
                <ListItemText
                  primary={feature.title}
                  secondary={feature.description}
                  primaryTypographyProps={{
                    color: '#2457a6',
                    fontWeight: 600,
                  }}
                  secondaryTypographyProps={{
                    color: '#444',
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Alert
            severity="success"
            sx={{
              mt: 2,
              backgroundColor: '#b2f7ef',
              color: '#2457a6',
              borderRadius: 2,
              boxShadow: 'none',
              fontWeight: 500,
              '& .MuiAlert-icon': {
                color: '#3a7bd5',
              },
            }}
          >
            <Typography variant="body2" sx={{ color: '#2457a6', fontWeight: 600 }}>
              <strong>Supported Documents:</strong> Student IDs, Transcripts, Form 137, Report Cards, Diplomas, and other official school documents
            </Typography>
          </Alert>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AIAssistantCard;
