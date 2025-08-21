import React, { useState, useRef, useEffect } from 'react';
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
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  QrCodeScanner as QrIcon,
  Verified as VerifiedIcon,
  Error as ErrorIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  CameraAlt as CameraIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { parseQRData } from '../utils/qrCodeUtils';
import { documentService } from '../services/api';
import jsQR from 'jsqr';

const QRVerificationDialog = ({ open, onClose }) => {
  const [qrData, setQrData] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [error, setError] = useState('');
  
  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cleanup camera stream when dialog closes
  useEffect(() => {
    if (!open && stream) {
      stopCamera();
    }
  }, [open, stream]);

  // Initialize video when stream is available
  useEffect(() => {
    if (stream && videoRef.current && cameraActive) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          setError('Failed to start camera video. Please try again.');
        });
      };
    }
  }, [stream, cameraActive]);

  const startCamera = async () => {
    try {
      setError('');
      
      // First try with back camera
      let constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (backCameraError) {
        console.log('Back camera not available, trying front camera:', backCameraError);
        // Fallback to any available camera
        constraints = {
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      setStream(mediaStream);
      setCameraActive(true);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += 'Please check permissions or use file upload.';
      }
      
      setError(errorMessage);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert canvas to blob and process for QR detection
    canvas.toBlob(async (blob) => {
      setCapturedPhoto(canvas.toDataURL('image/jpeg'));
      setProcessingFile(true);
      
      try {
        // Process the captured image for QR detection
        await extractQRFromCanvas(canvas);
      } catch (error) {
        console.error('Error processing captured photo:', error);
        setError('Failed to process the captured photo. Please try again.');
        setProcessingFile(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const extractQRFromCanvas = async (canvas) => {
    try {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (qrCode) {
        console.log('QR Code detected from photo:', qrCode.data);
        setQrData(qrCode.data);
        setError('QR code detected from photo! Click "Verify Document" to proceed.');
        stopCamera(); // Stop camera after successful detection
        setProcessingFile(false);
      } else {
        setError('No QR code found in the captured photo. Please try again or adjust positioning.');
        setProcessingFile(false);
      }
    } catch (error) {
      throw error;
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setQrData('');
    setError('');
    setVerificationResult(null);
    // Camera should still be active for retaking
  };

  const clearCamera = () => {
    stopCamera();
    setCapturedPhoto(null);
    setQrData('');
    setError('');
    setVerificationResult(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setVerificationResult(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG) or PDF.');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    setError('');

    // Process the file for QR detection
    if (file.type.startsWith('image/')) {
      setProcessingFile(true);
      try {
        await extractQRFromImage(file);
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Failed to process the uploaded image. Please try again.');
        setProcessingFile(false);
      }
    } else {
      setError('PDF QR extraction is not yet supported. Please use image files or manual entry.');
    }
  };

  const extractQRFromImage = async (imageFile) => {
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (qrCode) {
              console.log('QR Code detected:', qrCode.data);
              setQrData(qrCode.data);
              setError('QR code detected! Click "Verify Document" to proceed.');
              setProcessingFile(false);
              resolve();
            } else {
              setError('No QR code found in the uploaded image. Please try a clearer image or use manual entry.');
              setProcessingFile(false);
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(imageFile);
      });
    } catch (error) {
      throw error;
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setError('');
    setQrData('');
    setVerificationResult(null);
  };

  const handleVerifyQR = async () => {
    if (!qrData.trim()) {
      setError('Please provide QR code data to verify.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // First try to parse the QR data locally
      const parsedData = parseQRData(qrData);
      
      if (!parsedData) {
        setError('Invalid QR code format. Please check the QR code data.');
        setLoading(false);
        return;
      }

      // Call the backend API to verify the QR code
      console.log('Calling backend API to verify QR code...');
      const response = await documentService.verifyPickupQR(qrData);
      
      if (response.data.success) {
        setVerificationResult({
          success: true,
          data: response.data.requestData || parsedData,
          message: response.data.message || 'QR code verified successfully!'
        });
      } else {
        setVerificationResult({
          success: false,
          error: response.data.message || 'QR code verification failed'
        });
      }
    } catch (error) {
      console.error('Error verifying QR code:', error);
      
      // Fallback to client-side verification if backend fails
      try {
        const parsedData = parseQRData(qrData);
        
        if (parsedData && (parsedData.type === 'document_verification' || parsedData.type === 'pickup_verification')) {
          setVerificationResult({
            success: true,
            data: parsedData,
            message: 'QR code verified (offline mode)',
            isOffline: true
          });
        } else {
          setVerificationResult({
            success: false,
            error: error.response?.data?.message || 'Failed to verify QR code. Please check the QR data format.'
          });
        }
      } catch (parseError) {
        setVerificationResult({
          success: false,
          error: 'Invalid QR code format and unable to connect to server.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrData('');
    setVerificationResult(null);
    setTabValue(0);
    setUploadedFile(null);
    setProcessingFile(false);
    setError('');
    stopCamera();
    setCapturedPhoto(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
        color: 'white',
        mb: 0
      }}>
        <QrIcon sx={{ mr: 1 }} />
        Document QR Code Verification
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="verification methods">
            <Tab 
              icon={<EditIcon />} 
              label="Manual Entry" 
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab 
              icon={<PhotoCameraIcon />} 
              label="Take Photo" 
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab 
              icon={<UploadIcon />} 
              label="Upload File" 
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert 
            severity={error.includes('detected') ? "success" : "error"} 
            sx={{ m: 3, mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
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
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Use your device's camera to capture a photo of the QR code for automatic detection.
              </Typography>

              {!cameraActive && !capturedPhoto && (
                <Paper
                  sx={{
                    border: '2px dashed #4caf50',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    mt: 2,
                    backgroundColor: '#f0f8f0',
                  }}
                >
                  <CameraIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Camera Photo Capture
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Point your camera at the QR code and capture a photo
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={startCamera}
                    startIcon={<PhotoCameraIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                      color: 'white',
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                      },
                    }}
                  >
                    Start Camera
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        const devices = await navigator.mediaDevices.enumerateDevices();
                        const videoDevices = devices.filter(device => device.kind === 'videoinput');
                        console.log('Available cameras:', videoDevices);
                        setError(`Found ${videoDevices.length} camera(s). Check console for details.`);
                      } catch (error) {
                        setError('Unable to enumerate devices: ' + error.message);
                      }
                    }}
                    sx={{ mt: 1 }}
                  >
                    Debug Camera
                  </Button>
                </Paper>
              )}

              {cameraActive && !capturedPhoto && (
                <Box sx={{ mt: 2 }}>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#4caf50', fontWeight: 600 }}>
                      📹 Camera Active - Position QR code within the frame
                    </Typography>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          height: '400px',
                          borderRadius: '8px',
                          backgroundColor: '#000',
                          objectFit: 'cover',
                          border: '2px solid #4caf50',
                        }}
                        onLoadedMetadata={() => {
                          console.log('Video metadata loaded');
                          if (videoRef.current) {
                            videoRef.current.play().catch(console.error);
                          }
                        }}
                        onError={(e) => {
                          console.error('Video error:', e);
                          setError('Video display error. Please try refreshing or use file upload.');
                        }}
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      
                      {/* QR Code targeting overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '200px',
                          height: '200px',
                          border: '3px solid #4caf50',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                          pointerEvents: 'none',
                          '&::before': {
                            content: '"Position QR code here"',
                            position: 'absolute',
                            bottom: '-30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#4caf50',
                            fontSize: '12px',
                            fontWeight: 600,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={capturePhoto}
                        startIcon={<PhotoCameraIcon />}
                        disabled={processingFile}
                        sx={{
                          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                          color: 'white',
                          px: 4,
                        }}
                      >
                        {processingFile ? 'Processing...' : 'Capture Photo'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={clearCamera}
                        startIcon={<DeleteIcon />}
                        color="error"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              )}

              {capturedPhoto && (
                <Paper sx={{ p: 3, mt: 2, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Captured Photo
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {processingFile && (
                        <CircularProgress size={24} />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <img
                      src={capturedPhoto}
                      alt="Captured QR Code"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={retakePhoto}
                      startIcon={<RefreshIcon />}
                      color="primary"
                    >
                      Retake Photo
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={clearCamera}
                      startIcon={<DeleteIcon />}
                      color="error"
                    >
                      Clear
                    </Button>
                  </Box>
                  {processingFile && (
                    <Typography variant="body2" sx={{ mt: 2, color: '#2196f3', textAlign: 'center' }}>
                      Processing photo for QR code detection...
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload an image containing a QR code to automatically extract and verify the document.
              </Typography>

              {!uploadedFile ? (
                <Paper
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    mt: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#2196f3',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  onClick={() => document.getElementById('file-upload-verification').click()}
                >
                  <input
                    id="file-upload-verification"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <UploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Click to upload or drag files here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: JPG, PNG, PDF (Max 10MB)
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ p: 3, mt: 2, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {uploadedFile.type.startsWith('image/') ? (
                        <ImageIcon sx={{ fontSize: 32, color: '#2196f3' }} />
                      ) : (
                        <PdfIcon sx={{ fontSize: 32, color: '#f44336' }} />
                      )}
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {uploadedFile.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {processingFile && (
                        <CircularProgress size={24} />
                      )}
                      <Button
                        size="small"
                        onClick={clearUploadedFile}
                        startIcon={<DeleteIcon />}
                        color="error"
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                  {processingFile && (
                    <Typography variant="body2" sx={{ mt: 2, color: '#2196f3' }}>
                      Processing image for QR code detection...
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          )}
        </Box>

        {verificationResult && (
          <Paper sx={{ p: 3, m: 3, mt: 0 }}>
            {verificationResult.success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VerifiedIcon sx={{ mr: 1 }} />
                      {verificationResult.message || 'Document Verified Successfully'}
                    </Box>
                    {verificationResult.isOffline && (
                      <Chip label="Offline Mode" size="small" color="warning" />
                    )}
                  </Box>
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Document ID:</Typography>
                    <Typography variant="body2">{verificationResult.data.documentId || verificationResult.data.requestId || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Document Type:</Typography>
                    <Chip 
                      label={verificationResult.data.documentType || verificationResult.data.type || 'Unknown'} 
                      size="small" 
                      color="primary" 
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Student Name:</Typography>
                    <Typography variant="body2">
                      {verificationResult.data.studentName || 
                       (verificationResult.data.student ? `${verificationResult.data.student.firstName} ${verificationResult.data.student.lastName}` : 'N/A')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Student Number:</Typography>
                    <Typography variant="body2">{verificationResult.data.studentNumber || verificationResult.data.studentId || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Issue/Request Date:</Typography>
                    <Typography variant="body2">
                      {verificationResult.data.issuedDate ? 
                        new Date(verificationResult.data.issuedDate).toLocaleDateString() :
                        (verificationResult.data.createdAt ? 
                          new Date(verificationResult.data.createdAt).toLocaleDateString() : 'N/A')
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">School:</Typography>
                    <Typography variant="body2">{verificationResult.data.school || 'Eastern La Trinidad National High School'}</Typography>
                  </Grid>
                  {verificationResult.data.status && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                      <Chip 
                        label={verificationResult.data.status} 
                        size="small" 
                        color={verificationResult.data.status === 'approved' ? 'success' : 'default'} 
                      />
                    </Grid>
                  )}
                  {verificationResult.data.pickupDateTime && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Pickup Schedule:</Typography>
                      <Typography variant="body2">
                        {new Date(verificationResult.data.pickupDateTime).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
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
      
      <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button 
          onClick={handleVerifyQR} 
          variant="contained"
          disabled={!qrData.trim() || loading}
          sx={{ 
            textTransform: 'none',
            background: 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)',
          }}
        >
          {loading ? 'Verifying...' : 'Verify Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRVerificationDialog;
