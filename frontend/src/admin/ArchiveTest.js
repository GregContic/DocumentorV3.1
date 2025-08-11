import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box
} from '@mui/material';

const ArchiveTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const testAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Test API endpoints
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      console.log('Testing API endpoints...');
      console.log('Base URL:', baseURL);
      console.log('Token available:', !!token);
      
      // Test inquiry endpoint
      const inquiryResponse = await fetch(`${baseURL}/api/inquiries/admin/archived-inquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Inquiry endpoint status:', inquiryResponse.status);
      
      if (inquiryResponse.ok) {
        const inquiryData = await inquiryResponse.json();
        console.log('Inquiry data:', inquiryData);
      } else {
        const errorText = await inquiryResponse.text();
        console.log('Inquiry error:', errorText);
      }
      
      // Test document endpoint
      const docResponse = await fetch(`${baseURL}/api/documents/admin/documents/archived-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Document endpoint status:', docResponse.status);
      
      if (docResponse.ok) {
        const docData = await docResponse.json();
        console.log('Document data:', docData);
      } else {
        const errorText = await docResponse.text();
        console.log('Document error:', errorText);
      }
      
    } catch (error) {
      console.error('API test error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Archive Test Page
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testAPI}
          disabled={loading}
        >
          Test API Endpoints
        </Button>
      </Box>
      
      {loading && <CircularProgress />}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error: {error}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mt: 2 }}>
        Check the browser console for detailed API test results.
      </Alert>
    </Container>
  );
};

export default ArchiveTest;
