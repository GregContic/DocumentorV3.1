import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    textAlign: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 1,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    fontSize: 10,
    width: '70%',
  },
  qrSection: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  qrText: {
    fontSize: 8,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

const SF9PDF = ({ formData, qrCode }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logos and school info */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Republic of the Philippines</Text>
            <Text style={styles.subtitle}>Department of Education</Text>
            <Text style={styles.subtitle}>Region I</Text>
            <Text style={styles.subtitle}>Schools Division of Benguet</Text>
            <Text style={styles.subtitle}>EASTERN LA TRINIDAD NATIONAL HIGH SCHOOL</Text>
            <Text style={styles.subtitle}>La Trinidad, Benguet</Text>
          </View>
        </View>

        {/* Form Title */}
        <Text style={styles.formTitle}>SCHOOL FORM 9 (SF9) REQUEST</Text>

        {/* Student Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDENT INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Student Number:</Text>
            <Text style={styles.value}>{formData.studentNumber || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Purpose:</Text>
            <Text style={styles.value}>{formData.purpose || 'N/A'}</Text>
          </View>
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACADEMIC INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>School Year:</Text>
            <Text style={styles.value}>{formData.schoolYear || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Grade Level:</Text>
            <Text style={styles.value}>{formData.gradeLevel || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Semester:</Text>
            <Text style={styles.value}>{formData.semester || 'N/A'}</Text>
          </View>
        </View>

        {/* Pickup Information */}
        {(formData.preferredPickupDate || formData.preferredPickupTime) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PICKUP SCHEDULE</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Preferred Date:</Text>
              <Text style={styles.value}>{formatDate(formData.preferredPickupDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Preferred Time:</Text>
              <Text style={styles.value}>
                {formData.preferredPickupTime 
                  ? new Date(formData.preferredPickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A'}
              </Text>
            </View>
          </View>
        )}

        {/* Additional Notes */}
        {formData.additionalNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDITIONAL NOTES</Text>
            <Text style={styles.value}>{formData.additionalNotes}</Text>
          </View>
        )}

        {/* QR Code */}
        {qrCode && (
          <View style={styles.qrSection}>
            <Image style={styles.qrCode} src={qrCode} />
            <Text style={styles.qrText}>Scan to verify</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} - Eastern La Trinidad National High School
        </Text>
      </Page>
    </Document>
  );
};

export default SF9PDF;
