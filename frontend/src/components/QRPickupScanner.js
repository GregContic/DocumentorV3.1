import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Divider,
  TextField,
} from '@mui/material';
import {
  QrCodeScanner as QrScannerIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { documentService } from '../services/api';

const QRPickupScanner = ({ open, onClose, onPickupComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [pickedUpBy, setPickedUpBy] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize QR scanner when dialog opens
  useEffect(() => {
    if (open) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    try {
      setError('');
      setScanning(true);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Start QR detection
      scanForQR();
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanForQR = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simple QR detection placeholder - in a real implementation, you'd use a QR library
        // For now, we'll provide manual input option
      }    // Continue scanning
    if (scanning) {
      requestAnimationFrame(scanForQR);
    }
  };

  const handleManualVerification = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    await verifyQRCode(manualCode.trim());
  };

  const verifyQRCode = async (qrData) => {
    try {
      setVerifying(true);
      setError('');
      
      console.log('Verifying QR code:', qrData);
      
      // Call backend to verify QR code
      const response = await documentService.verifyPickupQR({ qrData });
      
      if (response.data.success) {
        setVerificationResult(response.data);
        stopScanner();
      } else {
        setError(response.data.message || 'Invalid QR code');
      }
    } catch (error) {
      console.error('QR verification error:', error);
      setError('Failed to verify QR code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!verificationResult?.requestData?.id || !pickedUpBy.trim()) {
      setError('Please enter who picked up the document');
      return;
    }

    try {
      setVerifying(true);
      
      const response = await documentService.markAsPickedUp(
        verificationResult.requestData.id,
        {
          pickedUpBy: pickedUpBy.trim(),
          verificationCode: verificationResult.qrData.verificationCode
        }
      );

      if (response.data.success) {
        // Notify parent component
        if (onPickupComplete) {
          onPickupComplete(response.data.request);
        }
        
        // Close dialog and reset state
        handleClose();
      } else {
        setError('Failed to mark document as picked up');
      }
    } catch (error) {
      console.error('Pickup confirmation error:', error);
      setError('Failed to confirm pickup. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    setVerificationResult(null);
    setError('');
    setManualCode('');
    setPickedUpBy('');
    onClose();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <QrScannerIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5">
            QR Code Pickup Verification
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {!verificationResult ? (
          // QR Scanner/Input Section
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Scan or Enter Verification Code
            </Typography>
            
            {/* Camera Scanner */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CameraIcon color="primary" />
                <Typography variant="subtitle1">Camera Scanner</Typography>
              </Box>
              
              <Box sx={{ position: 'relative', mb: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    backgroundColor: '#000',
                    borderRadius: '8px'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                
                {scanning && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <CircularProgress color="inherit" />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Scanning for QR code...
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={scanning ? stopScanner : startScanner}
                  startIcon={scanning ? <CancelIcon /> : <CameraIcon />}
                >
                  {scanning ? 'Stop Scanner' : 'Start Scanner'}
                </Button>
              </Box>
            </Paper>

            {/* Manual Input */}
            <Paper sx={{ p: 2, backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                Manual Verification Code Entry
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                If camera scanning isn't working, manually enter the verification code from the pickup stub
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter code from pickup stub"
                  disabled={verifying}
                />
                <Button
                  variant="contained"
                  onClick={handleManualVerification}
                  disabled={verifying || !manualCode.trim()}
                  startIcon={verifying ? <CircularProgress size={20} /> : <CheckIcon />}
                >
                  Verify
                </Button>
              </Box>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          // Verification Result Section
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                ✅ Valid Pickup Stub Verified
              </Typography>
            </Alert>

            <Paper sx={{ p: 3, backgroundColor: '#f8f9ff', border: '1px solid #0ea5e9' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Document Pickup Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Student Name:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {verificationResult.requestData.studentName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Document Type:
                  </Typography>
                  <Chip 
                    label={verificationResult.requestData.documentType}
                    color="primary"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Request ID:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    #{verificationResult.requestData.id.slice(-6)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Scheduled Pickup:
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(verificationResult.requestData.pickupSchedule?.scheduledDateTime)}
                  </Typography>
                </Grid>
                
                {verificationResult.requestData.pickupSchedule?.timeSlot && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Time Slot:
                    </Typography>
                    <Typography variant="body1">
                      {verificationResult.requestData.pickupSchedule.timeSlot}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Confirm Document Pickup
              </Typography>
              <TextField
                fullWidth
                label="Picked up by (Name of person collecting document)"
                value={pickedUpBy}
                onChange={(e) => setPickedUpBy(e.target.value)}
                placeholder="Enter full name of person picking up"
                sx={{ mb: 2 }}
                required
              />
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Before confirming pickup, verify:</strong>
                  <br />• Valid ID matches the name above
                  <br />• Authorization letter (if picked up by someone else)
                  <br />• Physical pickup stub matches this verification
                </Typography>
              </Alert>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        <Button onClick={handleClose} disabled={verifying}>
          Cancel
        </Button>
        
        {verificationResult && (
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmPickup}
            disabled={verifying || !pickedUpBy.trim()}
            startIcon={verifying ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {verifying ? 'Processing...' : 'Confirm Pickup'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRPickupScanner;
