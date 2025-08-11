impoconconst SCHOOL_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMzIgNCBMNTQgMTYgTDU0IDQ4IEwzMiA2MCBMMTAgNDggTDEwIDE2IFoiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMTUiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPGNpcmNsZSBjeD0iMjQiIGN5PSIyOCIgcj0iNCIgZmlsbD0iIzIyOEIyMiIvPgogIDxyZWN0IHg9IjIyIiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNiIgZmlsbD0iIzhCNDUxMyIvPgogIDxwYXRoIGQ9Ik0zMCAyMiBRMzEgMTggMzIgMjAgUTMzIDE4IDM0IDIyIFEzNSAyNiAzMyAyOCBRMzIgMzAgMzEgMjggUTI5IDI2IDMwIDIyIiBmaWxsPSIjREMxNDNDIi8+CiAgPHBhdGggZD0iTTMxIDI0IFEzMiAyMiAzMyAyNCBRMzMgMjYgMzIgMjcgUTMxIDI2IDMxIDI0IiBmaWxsPSIjRkZENzAwIi8+CiAgPHJlY3QgeD0iMzYiIHk9IjI4IiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSIjMzM0NTgwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPGxpbmUgeDE9IjM5IiB5MT0iMjgiIHgyPSIzOSIgeTI9IjMyIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgeD0iMzIiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAwMDAiPkVMVE5IUzwvdGV4dD4KICA8dGV4dCB4PSIzMiIgeT0iNTgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwMDAwIj4yMDA3PC90ZXh0Pgo8L3N2Zz4K";t DEPED_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjMzM0NTgwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cmVjdCB4PSIyOCIgeT0iMjUiIHdpZHRoPSI4IiBoZWlnaHQ9IjIwIiBmaWxsPSIjMzM0NTgwIi8+CiAgPHBhdGggZD0iTTI4IDE1IFEzMCAxMCAzMiAxMiBRMzQgMTAgMzYgMTUgUTM3IDIwIDM1IDI1IFEzMiAyNyAyOSAyNSBRMjcgMjAgMjggMTUiIGZpbGw9IiNEQzE0M0MiLz4KICA8cGF0aCBkPSJNMzAgMTggUTMxIDE2IDMyIDE4IFEzMyAxNiAzNCAxOCBRMzQgMjIgMzIgMjMgUTMwIDIyIDMwIDE4IiBmaWxsPSIjRkZENzAwIi8+CiAgPHRleHQgeD0iMzIiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzQ1ODAiPkRlcEVEPC90ZXh0Pgo8L3N2Zz4K";t React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// DepEd Logo as simplified PNG data URI (more compatible with react-pdf)
const DEPED_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAUYSURBVHic7ZzLaxRBEMafJCYmMSYmJiYm8QEqKl7Ek3jxgYj4wIMIehBBD4L4QA+CePCBBz2IoPjAg4iIB0FERERERERERERERERERERERERERERERERERERERERERERET0dURERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER0dUR";

// School Logo as simplified PNG data URI (more compatible with react-pdf)  
const SCHOOL_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAUYSURBVHic7ZzLaxRBEMafJCYmMSYmJiYm8QEqKl7Ek3jxgYj4wIMIehBBD4L4QA+CePCBBz2IoPjAg4iIB0FERERERERERERERERERERERERERERERERERERERERERERERERET0dURERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER0dUR";

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
  },  logoFallback: {
    width: 60,
    height: 60,
    border: '2pt solid #334580',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 4,
  },
  logoFallbackText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#334580',
    marginBottom: 1,
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
});

// Create Document Component matching official Form 137
const Form137PDF = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>      {/* Official Header */}
      <View style={styles.headerRow}>        <View style={styles.headerLeft}>
          <View style={styles.logoPlaceholder}>
            <Image
              style={styles.logoImage}
              src={DEPED_LOGO}
            />
          </View>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.formSubtitle}>Republic of the Philippines</Text>
          <Text style={styles.formSubtitle}>DEPARTMENT OF EDUCATION</Text>
          <Text style={styles.formSubtitle}>Cordillera Administrative Region</Text>
          <Text style={styles.formSubtitle}>Schools Division of Benguet</Text>
          <Text style={styles.formSubtitle}>Eastern La Trinidad National High School</Text>
        </View>        <View style={styles.headerRight}>
          <View style={styles.logoPlaceholder}>
            <Image
              style={styles.logoImage}
              src={SCHOOL_LOGO}
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
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text>Form 137 - Secondary Student's Permanent Record Request</Text>
        <Text>Generated on: {new Date().toLocaleDateString()} | Page 1 of 1</Text>
      </View>
    </Page>
  </Document>
);

export default Form137PDF;
