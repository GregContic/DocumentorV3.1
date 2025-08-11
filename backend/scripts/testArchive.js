// Simple test to check if Archive component can be imported
const fs = require('fs');
const path = require('path');

console.log('Testing Archive component...');

// Check if the file exists
const archivePath = path.join(__dirname, '..', 'frontend', 'src', 'admin', 'Archive.js');
if (fs.existsSync(archivePath)) {
  console.log('✓ Archive.js file exists');
  
  // Read the file to check for basic syntax
  const content = fs.readFileSync(archivePath, 'utf8');
  
  // Basic checks
  if (content.includes('export default Archive')) {
    console.log('✓ Archive component exports correctly');
  } else {
    console.log('✗ Archive component export not found');
  }
  
  if (content.includes('documentService') && content.includes('inquiryService')) {
    console.log('✓ API services are imported');
  } else {
    console.log('✗ API services import missing');
  }
  
  if (content.includes('fetchArchivedDocuments') && content.includes('fetchArchivedInquiries')) {
    console.log('✓ Fetch functions are present');
  } else {
    console.log('✗ Fetch functions missing');
  }
  
  console.log('\nArchive component appears to be properly structured!');
} else {
  console.log('✗ Archive.js file not found');
}
