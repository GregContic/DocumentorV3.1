import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #1976d2',
    paddingBottom: 20,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 5,
  },
  schoolAddress: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateSection: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  date: {
    fontSize: 12,
    color: '#333',
  },
  addressee: {
    marginBottom: 20,
  },
  addresseeText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  salutation: {
    fontSize: 12,
    color: '#333',
    marginBottom: 20,
  },
  body: {
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 12,
    color: '#333',
    lineHeight: 1.5,
    marginBottom: 15,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: 'bold',
  },
  closing: {
    marginTop: 30,
    marginBottom: 20,
  },
  closingText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  signature: {
    marginTop: 40,
    borderTop: '1 solid #333',
    width: 200,
    paddingTop: 5,
  },
  signatureName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #1976d2',
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 10,
    color: '#666',
  },
  requestId: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: 'bold',
  },
});

const Form138RequestLetterPDF = ({ requestData }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <Text style={styles.schoolName}>EASTERN LA TRINIDAD NATIONAL HIGH SCHOOL</Text>
          <Text style={styles.schoolAddress}>La Trinidad, Benguet, Philippines</Text>
          <Text style={styles.title}>REQUEST FOR FORM 138 (REPORT CARD)</Text>
        </View>

        {/* Date */}
        <View style={styles.dateSection}>
          <Text style={styles.date}>Date: {currentDate}</Text>
        </View>

        {/* Addressee */}
        <View style={styles.addressee}>
          <Text style={styles.addresseeText}>To: The Registrar</Text>
          <Text style={styles.addresseeText}>Eastern La Trinidad National High School</Text>
          <Text style={styles.addresseeText}>La Trinidad, Benguet</Text>
        </View>

        {/* Salutation */}
        <Text style={styles.salutation}>Dear Sir/Madam,</Text>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.paragraph}>
            I am formally requesting my Form 138 (Report Card) for the specified school year. 
            This document is needed for academic and administrative purposes. The details of my request 
            are provided below for your reference and processing.
          </Text>

          {/* Student Information */}
          <Text style={styles.sectionTitle}>STUDENT INFORMATION:</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name:</Text>
            <Text style={styles.infoValue}>
              {requestData?.surname}, {requestData?.firstName} {requestData?.middleName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>{formatDate(requestData?.dateOfBirth)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Place of Birth:</Text>
            <Text style={styles.infoValue}>{requestData?.placeOfBirth || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sex:</Text>
            <Text style={styles.infoValue}>{requestData?.sex || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>LRN:</Text>
            <Text style={styles.infoValue}>{requestData?.lrn || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>
              {requestData?.barangay}, {requestData?.city}, {requestData?.province}
            </Text>
          </View>

          {/* Academic Information */}
          <Text style={styles.sectionTitle}>ACADEMIC INFORMATION:</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grade Level:</Text>
            <Text style={styles.infoValue}>{requestData?.gradeLevel || 'N/A'}</Text>
          </View>
          {(requestData?.gradeLevel === 'Grade 11' || requestData?.gradeLevel === 'Grade 12') && requestData?.strand && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Strand:</Text>
              <Text style={styles.infoValue}>{requestData?.strand}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>School Year:</Text>
            <Text style={styles.infoValue}>{requestData?.schoolYear || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Section:</Text>
            <Text style={styles.infoValue}>{requestData?.section || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Adviser:</Text>
            <Text style={styles.infoValue}>{requestData?.adviser || 'N/A'}</Text>
          </View>

          {/* Request Details */}
          <Text style={styles.sectionTitle}>REQUEST DETAILS:</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Purpose:</Text>
            <Text style={styles.infoValue}>{requestData?.purpose || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Number of Copies:</Text>
            <Text style={styles.infoValue}>{requestData?.numberOfCopies || '1'}</Text>
          </View>

          {/* Parent/Guardian Information */}
          <Text style={styles.sectionTitle}>PARENT/GUARDIAN INFORMATION:</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{requestData?.parentName || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{requestData?.parentAddress || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoValue}>{requestData?.parentContact || 'N/A'}</Text>
          </View>

          <Text style={styles.paragraph}>
            I understand that this request will be processed according to the school's policies and procedures. 
            I am prepared to provide any additional documentation that may be required for the verification 
            of my academic records.
          </Text>

          <Text style={styles.paragraph}>
            I would greatly appreciate your prompt attention to this matter. Please contact me or my 
            parent/guardian if you need any additional information or clarification regarding this request.
          </Text>
        </View>

        {/* Closing */}
        <View style={styles.closing}>
          <Text style={styles.closingText}>Respectfully yours,</Text>
          <View style={styles.signature}>
            <Text style={styles.signatureName}>
              {requestData?.firstName} {requestData?.surname}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Generated: {currentDate}</Text>
            <Text style={styles.requestId}>Request ID: {requestData?.requestId || 'FORM138-' + Date.now()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Form138RequestLetterPDF;
