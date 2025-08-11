import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Alert,
  TextField,
} from '@mui/material';
import {
  QrCodeScanner as QrIcon,
  Verified as VerifiedIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { parseQRData } from '../utils/qrCodeUtils';

const QRVerificationDialog = ({ open, onClose }) => {
  const [qrData, setQrData] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyQR = () => {
    setLoading(true);
    
    try {
      const parsedData = parseQRData(qrData);
      
      if (parsedData && parsedData.type === 'document_verification') {
        // Simulate verification process
        setTimeout(() => {
          setVerificationResult({
            success: true,
            data: parsedData
          });
          setLoading(false);
        }, 1000);
      } else {
        setVerificationResult({
          success: false,
          error: 'Invalid QR code format'
        });
        setLoading(false);
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        error: 'Failed to parse QR code data'
      });
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrData('');
    setVerificationResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <QrIcon sx={{ mr: 1 }} />
        Document Verification
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Paste or enter the QR code data from the document to verify its authenticity.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="QR Code Data"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder="Paste QR code data here..."
            sx={{ mt: 2 }}
          />
        </Box>

        {verificationResult && (
          <Paper sx={{ p: 2, mb: 2 }}>
            {verificationResult.success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VerifiedIcon sx={{ mr: 1 }} />
                    Document Verified Successfully
                  </Box>
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Document ID:</Typography>
                    <Typography variant="body2">{verificationResult.data.documentId}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Document Type:</Typography>
                    <Chip label={verificationResult.data.documentType} size="small" color="primary" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Student Name:</Typography>
                    <Typography variant="body2">{verificationResult.data.studentName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Student Number:</Typography>
                    <Typography variant="body2">{verificationResult.data.studentNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Issued Date:</Typography>
                    <Typography variant="body2">{new Date(verificationResult.data.issuedDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">School:</Typography>
                    <Typography variant="body2">{verificationResult.data.school}</Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Alert severity="error">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon sx={{ mr: 1 }} />
                  Verification Failed: {verificationResult.error}
                </Box>
              </Alert>
            )}
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
        <Button 
          onClick={handleVerifyQR} 
          variant="contained"
          disabled={!qrData.trim() || loading}
        >
          {loading ? 'Verifying...' : 'Verify Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRVerificationDialog;
