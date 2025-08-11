import React, { useState, useEffect, useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import Form137PDF from './Form137PDF';
import { generateDocumentQR } from '../../utils/qrCodeUtils';

const Form137PDFWithQR = ({ formData, fileName, children, ...buttonProps }) => {
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);

  // Use useMemo to prevent recreating transformedFormData on every render
  const transformedFormData = useMemo(() => ({
    ...formData,
    // Map form fields to PDF expected fields
    givenName: formData.firstName || formData.givenName || '',
    studentNumber: formData.learnerReferenceNumber || formData.studentNumber || '',
    town: formData.city || formData.town || '',
    barrio: formData.barangay || formData.barrio || '',
    placeOfBirth: [formData.barangay, formData.city, formData.province].filter(Boolean).join(', '),
    // Add default values for fields not in the form but expected by PDF
    currentSchool: 'Eastern La Trinidad National High School',
    schoolAddress: 'La Trinidad, Benguet',
    parentGuardianOccupation: formData.parentGuardianOccupation || '',
    yearGraduated: formData.yearGraduated || '',
    elementarySchool: formData.elementarySchool || '',
  }), [formData]);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setQrLoading(true);
        // Only generate QR if we have meaningful form data
        if (transformedFormData && (transformedFormData.surname || transformedFormData.firstName)) {
          const qrCodeDataURL = await generateDocumentQR(transformedFormData);
          setQrCode(qrCodeDataURL);
        } else {
          setQrCode(null);
        }
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        setQrCode(null);
      } finally {
        setQrLoading(false);
      }
    };

    generateQR();
  }, [transformedFormData]);

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
      document={<Form137PDF formData={transformedFormData} qrCode={qrCode} />}
      fileName={fileName}
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

export default Form137PDFWithQR;
