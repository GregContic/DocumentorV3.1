import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import QRCode from 'react-qr-code';

const QRCodeDisplay = ({ 
  data, 
  size = 128, 
  title, 
  description, 
  bgColor = "#ffffff", 
  fgColor = "#000000",
  showRaw = false 
}) => {
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQRValue = () => {
      if (typeof data === 'string') {
        setQrValue(data);
      } else if (typeof data === 'object') {
        setQrValue(JSON.stringify(data));
      } else {
        setQrValue(String(data));
      }
      setLoading(false);
    };

    generateQRValue();
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={size}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        display: 'inline-block', 
        textAlign: 'center',
        maxWidth: size + 40 
      }}
    >
      {title && (
        <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="bold">
          {title}
        </Typography>
      )}
      
      <Box sx={{ mb: 1 }}>
        <QRCode
          value={qrValue}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="M"
        />
      </Box>
      
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {description}
        </Typography>
      )}
      
      {showRaw && (
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            display: 'block', 
            wordBreak: 'break-all',
            maxWidth: size,
            fontSize: '0.7rem',
            color: 'text.disabled'
          }}
        >
          {qrValue.length > 50 ? `${qrValue.substring(0, 50)}...` : qrValue}
        </Typography>
      )}
    </Paper>
  );
};

export default QRCodeDisplay;
