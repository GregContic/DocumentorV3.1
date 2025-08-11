import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AccessTime as AccessTimeIcon,
  FormatListBulleted as ListIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
} from '@mui/icons-material';

const DOCUMENT_TYPES = [
  {
    id: 'sf10',
    name: 'School Form 10 (SF10) / Form 137',
    description: 'Learner\'s permanent academic record - comprehensive record of grades and academic performance.',
    requirements: ['Valid ID', 'Request Form', 'Authorization Letter (if not the student)'],
    processingTime: '5-7 working days',
    route: '/request-form137'
  },
  {
    id: 'sf9',
    name: 'School Form 9 (SF9) / Form 138',
    description: 'Current school year\'s report card showing grades for each grading period.',
    requirements: ['Valid ID', 'Request Form'],
    processingTime: '3-5 working days',
    route: '/request-form138'
  },
  {
    id: 'goodMoral',
    name: 'Certificate of Good Moral Character',
    description: 'A character reference from the school; often required for college applications.',
    requirements: ['Valid ID', 'Request Form'],
    processingTime: '2-3 working days',
    route: '/request-good-moral'
  }
];

const DocumentDashboard = () => {
  const navigate = useNavigate();

  const handleRequestDocument = (route) => {
    navigate(route);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Document Request Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Select the document you need to request. Make sure to prepare the required documents before proceeding.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Enrollment Card - full width above document cards */}
        <Grid item xs={12} key="enrollment">
          <Card 
            sx={{ 
              minHeight: 420,
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              boxShadow: 6,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.01)',
                boxShadow: 10,
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 4 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <ListIcon sx={{ mr: 2, fontSize: 40, color: 'white', opacity: 0.8 }} />
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  Enrollment
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.95 }}>
                Start your online enrollment application for Eastern La Trinidad National High School.
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Complete all required fields and upload necessary documents. Fast, secure, and convenient.
              </Typography>
              <Box sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.08)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'white', fontWeight: 500 }}>
                  <AccessTimeIcon sx={{ mr: 1, fontSize: 'medium', color: 'white', opacity: 0.8 }} />
                  Processing Time: <span style={{ fontWeight: 700, marginLeft: 4 }}>1-2 working days (initial review)</span>
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'white', fontWeight: 500 }}>
                  <ListIcon sx={{ mr: 1, fontSize: 'medium', verticalAlign: 'middle', color: 'white', opacity: 0.8 }} />
                  Requirements:
                </Typography>
                <List dense sx={{ pl: 4, mt: 0 }}>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText 
                      primary="Completed Enrollment Form"
                      primaryTypographyProps={{ variant: 'body2', color: 'white', opacity: 0.9 }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText 
                      primary="Required Documents (see enrollment page)"
                      primaryTypographyProps={{ variant: 'body2', color: 'white', opacity: 0.9 }}
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0, background: 'rgba(255,255,255,0.08)' }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  background: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 18,
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                    color: 'white',
                  }
                }}
                onClick={() => handleRequestDocument('/enrollment')}
                endIcon={<SendIcon />}
              >
                Start Enrollment
              </Button>
            </CardActions>
          </Card>
        </Grid>
        {/* Document Request Cards */}
        {DOCUMENT_TYPES.map((document) => (
          <Grid item xs={12} sm={6} md={4} key={document.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2">
                    {document.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {document.description}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                    Processing Time: {document.processingTime}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <ListIcon sx={{ mr: 1, fontSize: 'small', verticalAlign: 'middle' }} />
                    Requirements:
                  </Typography>
                  <List dense sx={{ pl: 4, mt: 0 }}>
                    {document.requirements.map((req, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText 
                          primary={req}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleRequestDocument(document.route)}
                  endIcon={<SendIcon />}
                >
                  Request Document
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DocumentDashboard;