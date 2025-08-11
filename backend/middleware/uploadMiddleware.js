const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for enrollment documents
const enrollmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const enrollmentUploadsDir = path.join(uploadsDir, 'enrollments');
    if (!fs.existsSync(enrollmentUploadsDir)) {
      fs.mkdirSync(enrollmentUploadsDir, { recursive: true });
    }
    cb(null, enrollmentUploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${baseName}${extension}`);
  }
});

// File filter for document uploads
const documentFileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'), false);
  }
};

// Multer upload configuration for enrollment documents
const uploadEnrollmentDocs = multer({
  storage: enrollmentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: documentFileFilter
}).fields([
  { name: 'form137File', maxCount: 1 },
  { name: 'form138File', maxCount: 1 },
  { name: 'goodMoralFile', maxCount: 1 },
  { name: 'medicalCertificateFile', maxCount: 1 },
  { name: 'parentIdFile', maxCount: 1 },
  { name: 'idPicturesFile', maxCount: 1 }
]);

module.exports = {
  uploadEnrollmentDocs
};
