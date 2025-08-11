import QRCode from 'qrcode';

/**
 * Generate QR code data URL for documents
 * @param {Object} documentData - Document information
 * @returns {Promise<string>} QR code data URL
 */
export const generateDocumentQR = async (documentData) => {
  const qrData = {
    type: 'document_verification',
    documentId: documentData.id || `DOC_${Date.now()}`,
    documentType: documentData.documentType,
    studentName: `${documentData.givenName} ${documentData.surname}`,
    studentNumber: documentData.studentNumber,
    issuedDate: new Date().toISOString(),
    school: 'Eastern La Trinidad National High School',
    verificationUrl: `${window.location.origin}/verify/${documentData.id || `DOC_${Date.now()}`}`,
    hash: generateDocumentHash(documentData)
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

/**
 * Generate QR code for request tracking
 * @param {string} requestId - Request ID
 * @returns {Promise<string>} QR code data URL
 */
export const generateTrackingQR = async (requestId) => {
  const qrData = {
    type: 'request_tracking',
    requestId,
    trackingUrl: `${window.location.origin}/track/${requestId}`,
    generatedAt: new Date().toISOString()
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 150,
      margin: 1,
      color: {
        dark: '#1976d2',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating tracking QR code:', error);
    return null;
  }
};

/**
 * Generate QR code for quick form access
 * @param {string} formType - Type of form
 * @returns {Promise<string>} QR code data URL
 */
export const generateFormAccessQR = async (formType) => {
  const qrData = {
    type: 'form_access',
    formType,
    accessUrl: `${window.location.origin}/request/${formType.toLowerCase().replace(/\s+/g, '-')}`,
    generatedAt: new Date().toISOString()
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 120,
      margin: 1,
      color: {
        dark: '#2e7d32',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating form access QR code:', error);
    return null;
  }
};

/**
 * Generate a simple hash for document integrity
 * @param {Object} documentData - Document data
 * @returns {string} Simple hash
 */
const generateDocumentHash = (documentData) => {
  const dataString = JSON.stringify(documentData);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Parse QR code data
 * @param {string} qrData - QR code data string
 * @returns {Object|null} Parsed QR data
 */
export const parseQRData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
};
