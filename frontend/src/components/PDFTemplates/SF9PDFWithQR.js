import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import SF9PDF from './SF9PDF';
import { generateDocumentQR } from '../../utils/qrCodeUtils';

const SF9PDFWithQR = ({ formData, fileName, children, ...buttonProps }) => {
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrCodeDataURL = await generateDocumentQR(formData);
        setQrCode(qrCodeDataURL);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setQrLoading(false);
      }
    };

    generateQR();
  }, [formData]);

  if (qrLoading) {
    return (
      <Button disabled {...buttonProps}>
        <CircularProgress size={16} sx={{ mr: 1 }} />
        Generating...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<SF9PDF formData={formData} qrCode={qrCode} />}
      fileName={fileName || 'sf9_request.pdf'}
      style={{ textDecoration: 'none' }}
    >
      {({ blob, url, loading, error }) => (
        <Button
          {...buttonProps}
          disabled={loading || error}
          startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
        >
          {loading ? 'Generating PDF...' : children || 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default SF9PDFWithQR;
