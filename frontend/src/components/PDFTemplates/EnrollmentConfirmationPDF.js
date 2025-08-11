import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image, 
  PDFDownloadLink,
  BlobProvider 
} from '@react-pdf/renderer';
import QRCode from 'qrcode';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '2px solid #1976d2',
    paddingBottom: 10,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  schoolAddress: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    color: '#1976d2',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    borderBottom: '1px solid #ccc',
    paddingBottom: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    width: '60%',
    color: '#333',
  },
  qrSection: {
    marginTop: 20,
    alignItems: 'center',
    padding: 15,
    border: '1px solid #ddd',
    borderRadius: 5,
  },
  qrCode: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#888',
    borderTop: '1px solid #ddd',
    paddingTop: 10,
  },
  statusBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: 5,
    borderRadius: 3,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructions: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 15,
    borderRadius: 3,
  },
  instructionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  instructionText: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.3,
  }
});

// Generate QR Code data URL
const generateQRCode = async (text) => {
  try {
    const qrDataURL = await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1976d2',
        light: '#ffffff'
      }
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Enrollment Confirmation PDF Component
const EnrollmentConfirmationPDF = ({ enrollmentData, qrCodeDataURL }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.schoolName}>EASTERN LA TRINIDAD NATIONAL HIGH SCHOOL</Text>
        <Text style={styles.schoolAddress}>La Trinidad, Benguet</Text>
        <Text style={styles.schoolAddress}>Email: eltnhs@deped.gov.ph | Contact: (074) 422-xxxx</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>ENROLLMENT CONFIRMATION & CLAIM STUB</Text>

      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <Text>Status: {enrollmentData.status?.toUpperCase() || 'PENDING'}</Text>
      </View>

      {/* Enrollment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enrollment Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enrollment Number:</Text>
          <Text style={styles.value}>{enrollmentData.enrollmentNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Enrollment Type:</Text>
          <Text style={styles.value}>
            {enrollmentData.enrollmentType === 'new' ? 'New Student' : 
             enrollmentData.enrollmentType === 'old' ? 'Continuing Student' : 'Transferee'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Grade to Enroll:</Text>
          <Text style={styles.value}>{enrollmentData.gradeToEnroll}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>School Year:</Text>
          <Text style={styles.value}>{new Date().getFullYear()}-{new Date().getFullYear() + 1}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Submission Date:</Text>
          <Text style={styles.value}>{new Date(enrollmentData.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Student Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Learner Reference Number:</Text>
          <Text style={styles.value}>{enrollmentData.learnerReferenceNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>
            {`${enrollmentData.firstName} ${enrollmentData.middleName || ''} ${enrollmentData.surname} ${enrollmentData.extension || ''}`.trim()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>
            {enrollmentData.dateOfBirth ? new Date(enrollmentData.dateOfBirth).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sex:</Text>
          <Text style={styles.value}>{enrollmentData.sex}</Text>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>
            {`${enrollmentData.houseNumber || ''} ${enrollmentData.street || ''}, ${enrollmentData.barangay}, ${enrollmentData.city}, ${enrollmentData.province}`.trim()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contact Number:</Text>
          <Text style={styles.value}>{enrollmentData.contactNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{enrollmentData.emailAddress}</Text>
        </View>
      </View>

      {/* QR Code Section */}
      {qrCodeDataURL && (
        <View style={styles.qrSection}>
          <Image src={qrCodeDataURL} style={styles.qrCode} />
          <Text style={styles.qrText}>
            Scan this QR code for verification
          </Text>
          <Text style={styles.qrText}>
            Enrollment #{enrollmentData.enrollmentNumber}
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Next Steps:</Text>
        <Text style={styles.instructionText}>
          1. Keep this confirmation stub safe - you will need it for verification.{'\n'}
          2. Wait for approval notification via email or SMS.{'\n'}
          3. Once approved, bring this stub and valid ID to complete enrollment.{'\n'}
          4. Report to the Registrar's Office for section assignment.{'\n'}
          5. Present the QR code for quick verification at the school.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleString()}</Text>
        <Text>Eastern La Trinidad National High School - Document Request System</Text>
      </View>
    </Page>
  </Document>
);

// Component for downloading enrollment confirmation PDF
const EnrollmentConfirmationDownload = ({ enrollmentData, fileName = "enrollment-confirmation.pdf" }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = React.useState(null);

  React.useEffect(() => {
    const generateQR = async () => {
      const qrText = `ELTNHS-ENROLLMENT-${enrollmentData.enrollmentNumber}-${enrollmentData.learnerReferenceNumber}`;
      const qrData = await generateQRCode(qrText);
      setQrCodeDataURL(qrData);
    };
    
    if (enrollmentData?.enrollmentNumber) {
      generateQR();
    }
  }, [enrollmentData]);

  if (!enrollmentData) {
    return <span>No enrollment data available</span>;
  }

  return (
    <PDFDownloadLink
      document={<EnrollmentConfirmationPDF enrollmentData={enrollmentData} qrCodeDataURL={qrCodeDataURL} />}
      fileName={fileName}
      style={{
        textDecoration: 'none',
        padding: '10px 20px',
        backgroundColor: '#1976d2',
        color: 'white',
        borderRadius: '4px',
        display: 'inline-block',
        fontWeight: 'bold'
      }}
    >
      {({ blob, url, loading, error }) =>
        loading ? 'Generating PDF...' : 'Download Enrollment Confirmation'
      }
    </PDFDownloadLink>
  );
};

export default EnrollmentConfirmationDownload;
