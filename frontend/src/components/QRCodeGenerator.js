import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

const QRCodeGenerator = ({ data, size = 200 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true);
        const url = await QRCode.toDataURL(JSON.stringify(data), {
          width: size,
          margin: 2,
          color: {
            dark: '#1976d2',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
        setError('');
      } catch (err) {
        setError('Failed to generate QR code');
        console.error('QR Code generation error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      generateQRCode();
    }
  }, [data, size]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        textAlign: 'center',
        maxWidth: size + 40,
        margin: '0 auto'
      }}
    >
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        style={{ 
          maxWidth: '100%', 
          height: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '4px'
        }}
      />
      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Verification QR Code
      </Typography>
    </Paper>
  );
};

export default QRCodeGenerator;
