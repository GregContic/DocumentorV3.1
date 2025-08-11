import { generateStudentData } from './mockDataGenerator';

const simulateProcessing = async (onProgress) => {
  const steps = [
    'Initializing document scanner...',
    'Analyzing document structure...',
    'Extracting text content...',
    'Processing student information...',
    'Validating extracted data...',
    'Formatting results...'
  ];

  for (let i = 0; i < steps.length; i++) {
    console.log(steps[i]);
    onProgress(Math.floor((i / steps.length) * 100));
    // Add a realistic delay between steps
    await new Promise(resolve => setTimeout(resolve, 800));
  }
};

export const processDocument = async (file, onProgress = () => {}) => {
  try {
    console.log('Starting document processing...', file.type);
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSizeMB = 10;
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload a PDF or image file (PNG, JPEG).');
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File is too large. Maximum allowed size is ${maxSizeMB}MB.`);
    }

    // Simulate processing with progress updates
    await simulateProcessing(onProgress);

    // Generate mock student data
    const studentData = generateStudentData();

    // Return the mock data in a format that looks like it was extracted
    return {
      text: JSON.stringify(studentData, null, 2), // Formatted JSON string
      confidence: Math.random() * (98 - 85) + 85, // Random confidence between 85-98%
      extractedData: studentData,
      fileType: file.type,
      fileName: file.name,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
};

// Cleanup function (kept for compatibility)
export const cleanupWorker = async () => {
  // No actual cleanup needed for mock implementation
  return Promise.resolve();
};
