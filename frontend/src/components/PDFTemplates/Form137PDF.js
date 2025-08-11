import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Import logo images directly from assets
import DepEdLogo from '../../assets/deped-logo.jpg';
import SchoolLogo from '../../assets/eltnhslogo.png';

// Generate QR code for document verification
const generateVerificationQR = async (formData) => {
  const qrData = {
    type: 'document_verification',
    documentId: `FORM137_${formData.studentNumber}_${Date.now()}`,
    documentType: 'Form 137',
    studentName: `${formData.givenName} ${formData.surname}`,
    studentNumber: formData.studentNumber,
    issuedDate: new Date().toISOString().split('T')[0],
    school: 'Eastern La Trinidad National High School',
    verificationCode: Math.random().toString(36).substring(2, 15).toUpperCase()
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 100,
      margin: 1,
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

// Create styles to match official Form 137
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  // Header section
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'center',
  },  logoPlaceholder: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },  logoImage: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    border: '1pt solid #ccc',
    borderRadius: 4,
  },
  officialText: {
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  formTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  formSubtitle: {
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 2,
  },
  
  // Form sections
  formSection: {
    marginBottom: 8,
    border: '1pt solid black',
    padding: 4,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 2,
  },
  
  // Field layouts
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 80,
  },
  fieldValue: {
    fontSize: 8,
    flex: 1,
    borderBottom: '0.5pt solid black',
    paddingBottom: 1,
    paddingLeft: 2,
    minHeight: 12,
  },
  
  // Multi-column layouts
  threeColumnRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  columnThird: {
    flex: 1,
    marginRight: 5,
  },
  columnHalf: {
    flex: 1,
    marginRight: 5,
  },
  
  // Table styles
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid black',
    paddingBottom: 2,
    marginBottom: 3,
    fontWeight: 'bold',
    fontSize: 7,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    paddingBottom: 2,
    marginBottom: 2,
    minHeight: 15,
  },
  tableCell: {
    flex: 1,
    fontSize: 7,
    paddingRight: 2,
  },
  
  // Signature area
  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 150,
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1pt solid black',
    marginTop: 30,
    paddingTop: 2,
    fontSize: 8,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 7,
    textAlign: 'center',
    borderTop: '0.5pt solid #ccc',
    paddingTop: 5,
  },
  
  // QR Code styles
  qrCodeSection: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  qrCodeContainer: {
    border: '1pt solid #ccc',
    padding: 5,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  qrCodeImage: {
    width: 80,
    height: 80,
  },
  qrCodeLabel: {
    fontSize: 7,
    textAlign: 'center',
    marginTop: 2,
    color: '#666',
  },
  verificationText: {
    fontSize: 6,
    textAlign: 'center',
    marginTop: 1,
    color: '#888',
  },
});

// Create Document Component matching official Form 137
const Form137PDF = ({ formData = {}, qrCode }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Official Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.logoPlaceholder}>
            <Image
              style={styles.logoImage}
              src={DepEdLogo}
            />
          </View>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.formSubtitle}>Republic of the Philippines</Text>
          <Text style={styles.formSubtitle}>DEPARTMENT OF EDUCATION</Text>
          <Text style={styles.formSubtitle}>Cordillera Administrative Region</Text>
          <Text style={styles.formSubtitle}>Schools Division of Benguet</Text>
          <Text style={styles.formSubtitle}>Eastern La Trinidad National High School</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.logoPlaceholder}>
            <Image
              style={styles.logoImage}
              src={SchoolLogo}
            />
          </View>
        </View>
      </View>
      
      <Text style={styles.formTitle}>SECONDARY STUDENT'S PERMANENT RECORD</Text>
      <Text style={styles.formSubtitle}>(Pursuant to DepEd Order No. 10, s. 2015)</Text>
      
      {/* Student Information Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>STUDENT INFORMATION</Text>
        
        <View style={styles.threeColumnRow}>
          <View style={styles.columnThird}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Surname:</Text>
              <Text style={styles.fieldValue}>{formData.surname || ''}</Text>
            </View>
          </View>
          <View style={styles.columnThird}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Given Name:</Text>
              <Text style={styles.fieldValue}>{formData.givenName || ''}</Text>
            </View>
          </View>
          <View style={styles.columnThird}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Sex:</Text>
              <Text style={styles.fieldValue}>{formData.sex || ''}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.threeColumnRow}>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Date of Birth:</Text>
              <Text style={styles.fieldValue}>
                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : ''}
              </Text>
            </View>
          </View>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Student Number:</Text>
              <Text style={styles.fieldValue}>{formData.studentNumber || ''}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Place of Birth:</Text>
          <Text style={styles.fieldValue}>{formData.placeOfBirth || ''}</Text>
        </View>
        
        <View style={styles.threeColumnRow}>
          <View style={styles.columnThird}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Province:</Text>
              <Text style={styles.fieldValue}>{formData.province || ''}</Text>
            </View>
          </View>
          <View style={styles.columnThird}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Town:</Text>
              <Text style={styles.fieldValue}>{formData.town || ''}</Text>
            </View>
          </View>
          <View style={styles.columnThird}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Barrio:</Text>
              <Text style={styles.fieldValue}>{formData.barrio || ''}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Parent/Guardian Information */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>PARENT/GUARDIAN INFORMATION</Text>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Name:</Text>
          <Text style={styles.fieldValue}>{formData.parentGuardianName || ''}</Text>
        </View>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Address:</Text>
          <Text style={styles.fieldValue}>{formData.parentGuardianAddress || ''}</Text>
        </View>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Occupation:</Text>
          <Text style={styles.fieldValue}>{formData.parentGuardianOccupation || ''}</Text>
        </View>
      </View>
      
      {/* Educational Background */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>RECORD OF STANDARD INTELLIGENCE AND ACHIEVEMENT TEST</Text>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Name of Test</Text>
          <Text style={styles.tableCell}>Score Received</Text>
          <Text style={styles.tableCell}>Percentile Rank</Text>
          <Text style={styles.tableCell}>Name & Form of Test Taken</Text>
          <Text style={styles.tableCell}>Percentile Rank</Text>
        </View>
        
        {/* Empty rows for test scores */}
        {[1, 2, 3].map((row) => (
          <View key={row} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
          </View>
        ))}
      </View>
      
      {/* School Information */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>SCHOOL INFORMATION</Text>
        
        <View style={styles.threeColumnRow}>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>School:</Text>
              <Text style={styles.fieldValue}>{formData.currentSchool || ''}</Text>
            </View>
          </View>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>School Year:</Text>
              <Text style={styles.fieldValue}>{formData.yearGraduated || ''}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>School Address:</Text>
          <Text style={styles.fieldValue}>{formData.schoolAddress || ''}</Text>
        </View>
        
        <View style={styles.threeColumnRow}>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Elementary School:</Text>
              <Text style={styles.fieldValue}>{formData.elementarySchool || ''}</Text>
            </View>
          </View>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Year Graduated:</Text>
              <Text style={styles.fieldValue}>{formData.elementaryYear || ''}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Course/Program:</Text>
          <Text style={styles.fieldValue}>{formData.elementaryCourseCompleted || ''}</Text>
        </View>
      </View>
      
      {/* Request Information */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>REQUEST INFORMATION</Text>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Purpose:</Text>
          <Text style={styles.fieldValue}>{formData.purpose || ''}</Text>
        </View>
        
        <View style={styles.threeColumnRow}>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Pickup Date:</Text>
              <Text style={styles.fieldValue}>
                {formData.preferredPickupDate ? new Date(formData.preferredPickupDate).toLocaleDateString() : ''}
              </Text>
            </View>
          </View>
          <View style={styles.columnHalf}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Pickup Time:</Text>
              <Text style={styles.fieldValue}>
                {formData.preferredPickupTime ? new Date(formData.preferredPickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </Text>
            </View>
          </View>
        </View>
        
        {formData.additionalNotes && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Notes:</Text>
            <Text style={styles.fieldValue}>{formData.additionalNotes}</Text>
          </View>
        )}
      </View>
      
      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            <Text>Student Signature</Text>
          </View>
        </View>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            <Text>Date</Text>
          </View>
        </View>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            <Text>Registrar Signature</Text>
          </View>
        </View>
      </View>
        {/* QR Code Section */}
      {qrCode && (
        <View style={styles.qrCodeSection}>
          <View style={styles.qrCodeContainer}>
            <Image
              style={styles.qrCodeImage}
              src={qrCode}
            />
            <Text style={styles.qrCodeLabel}>Scan to Verify</Text>
            <Text style={styles.verificationText}>Document Verification</Text>
          </View>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text>Form 137 - Secondary Student's Permanent Record Request</Text>
        <Text>Generated on: {new Date().toLocaleDateString()} | Page 1 of 1</Text>
      </View>
    </Page>
  </Document>
);

export default Form137PDF;
