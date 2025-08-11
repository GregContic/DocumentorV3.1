import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Paper,
  Alert,
  styled,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// Helper function to filter props
const shouldForwardProp = (prop) => prop !== 'isDragActive' && prop !== 'hasFile';

// Styled components
const DropzoneContainer = styled(Box, { shouldForwardProp })(({ theme, isDragActive, hasFile }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : hasFile ? theme.palette.success.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isDragActive ? theme.palette.primary.light + '20' : hasFile ? theme.palette.success.light + '20' : theme.palette.grey[50],
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '20',
  },
}));

const AIDocumentUploader = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError(null);
        setUploadSuccess(false);
      } else {
        setError('Please upload a PDF or image file');
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  // Real file upload to backend
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    // Debug: log file type and object
    console.log('DEBUG: file:', file);
    console.log('DEBUG: file instanceof File:', file instanceof File);
    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('document', file);
      // Debug: log FormData content
      for (let pair of formData.entries()) {
        console.log('DEBUG: FormData entry:', pair[0], pair[1]);
      }
      setProgress(30);
      const response = await fetch('http://localhost:5001/api/extract-pdf', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type header manually
      });
      setProgress(80);
      if (!response.ok) {
        setError('AI extraction failed. Please check your document and try again.');
        setUploading(false);
        return;
      }
      const data = await response.json();
      setProgress(100);
      setUploadSuccess(true);
      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (err) {
      setError('Error processing document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom color="primary">
          Upload Documents for AI Processing
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Drag and drop your PDF or image files here, or click to select files
        </Typography>

        <DropzoneContainer
          {...getRootProps()}
          isDragActive={isDragActive}
          hasFile={!!file}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: isDragActive ? 'primary.main' : file ? 'success.main' : 'grey.500',
              mb: 2 
            }} 
          />
          {!file && (
            <Typography variant="body1" color="text.secondary">
              {isDragActive ? 'Drop your file here' : 'Click or drag file to upload'}
            </Typography>
          )}
          {file && !uploading && !uploadSuccess && (
            <Box>
              <Typography variant="body1" color="success.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CheckCircleIcon /> File ready: {file.name}
              </Typography>
            </Box>
          )}
        </DropzoneContainer>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {file && !uploading && !uploadSuccess && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ mt: 2, mb: 2 }}
            fullWidth
          >
            Process Document
          </Button>
        )}

        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
            <Typography variant="body2" sx={{ mt: 1 }} color="primary">
              Processing... {progress}%
            </Typography>
          </Box>
        )}

        {uploadSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Document processed successfully!
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default AIDocumentUploader;
