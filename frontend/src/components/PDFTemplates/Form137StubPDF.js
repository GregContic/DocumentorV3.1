import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 30,
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2c3e50',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  stubCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 10,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#bdc3c7',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '40%',
    fontSize: 10,
    color: '#34495e',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#2c3e50',
  },
  instructions: {
    backgroundColor: '#fff3cd',
    border: 1,
    borderColor: '#ffc107',
    borderRadius: 5,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 10,
    color: '#856404',
    lineHeight: 1.4,
    marginBottom: 5,
  },
  qrSection: {
    textAlign: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
  },
  qrImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 9,
    color: '#495057',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6c757d',
    borderTop: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 10,
  },
  warning: {
    backgroundColor: '#f8d7da',
    border: 1,
    borderColor: '#f5c6cb',
    borderRadius: 5,
    padding: 10,
    marginTop: 15,
  },
  warningText: {
    fontSize: 9,
    color: '#721c24',
    textAlign: 'center',
  }
});

const Form137StubPDF = ({ stubData }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FORM 137 REQUEST STUB</Text>
          <Text style={styles.subtitle}>Eastern Luzon Technological National High School</Text>
          <Text style={styles.subtitle}>Student Declaration for School-to-School Request</Text>
          <Text style={styles.stubCode}>Stub Code: {stubData.stubCode}</Text>
        </View>

        {/* Student Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDENT INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>
              {stubData.surname}, {stubData.firstName} {stubData.middleName || ''}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>LRN:</Text>
            <Text style={styles.value}>{stubData.learnerReferenceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{formatDate(stubData.dateOfBirth)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sex:</Text>
            <Text style={styles.value}>{stubData.sex}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {stubData.barangay}, {stubData.city}, {stubData.province}
            </Text>
          </View>
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACADEMIC INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Last Grade Level:</Text>
            <Text style={styles.value}>{stubData.lastGradeLevel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Last Attended Year:</Text>
            <Text style={styles.value}>{stubData.lastAttendedYear}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Receiving School:</Text>
            <Text style={styles.value}>{stubData.receivingSchool}</Text>
          </View>
          {stubData.receivingSchoolAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>School Address:</Text>
              <Text style={styles.value}>{stubData.receivingSchoolAddress}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Purpose:</Text>
            <Text style={styles.value}>{stubData.purpose}</Text>
          </View>
        </View>

        {/* Parent/Guardian Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARENT/GUARDIAN INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{stubData.parentGuardianName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{stubData.parentGuardianAddress}</Text>
          </View>
          {stubData.parentGuardianContact && (
            <View style={styles.row}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{stubData.parentGuardianContact}</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>INSTRUCTIONS:</Text>
          <Text style={styles.instructionText}>
            1. Present this stub to the School Registrar along with the required documents.
          </Text>
          <Text style={styles.instructionText}>
            2. This is NOT an official request but a declaration of intent to request Form 137.
          </Text>
          <Text style={styles.instructionText}>
            3. The registrar will verify your information and initiate the official school-to-school transfer process.
          </Text>
          <Text style={styles.instructionText}>
            4. You will be notified when your Form 137 is ready for pickup or has been sent directly to the receiving school.
          </Text>
          <Text style={styles.instructionText}>
            5. Keep this stub for reference and tracking purposes.
          </Text>
        </View>

        {/* QR Code Section */}
        {stubData.qrCode && (
          <View style={styles.qrSection}>
            <Text style={styles.instructionTitle}>VERIFICATION QR CODE</Text>
            <Image style={styles.qrImage} src={stubData.qrCode} />
            <Text style={styles.qrText}>
              Scan this QR code for quick verification by school staff
            </Text>
          </View>
        )}

        {/* Warning */}
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            This stub is valid for verification purposes only. It does not guarantee approval of your Form 137 request.
            Official processing will be handled by the school registrar according to school policies.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on: {formatDate(new Date())}</Text>
          <Text>Status: {stubData.status?.replace('-', ' ').toUpperCase() || 'STUB GENERATED'}</Text>
          <Text>This is a computer-generated document. No signature required.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Form137StubPDF;
