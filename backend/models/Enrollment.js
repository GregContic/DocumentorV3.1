const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['pending', 'under-review', 'approved', 'rejected', 'enrolled'], 
    default: 'pending' 
  },
  enrollmentNumber: { type: String, unique: true },
  enrollmentType: { 
    type: String, 
    enum: ['new', 'old', 'transferee'], 
    required: true 
  },
  learnerReferenceNumber: { type: String, required: true },
  surname: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: String,
  extension: String,
  dateOfBirth: Date,
  placeOfBirth: String,
  sex: String,
  age: String,
  religion: String,
  citizenship: String,
  houseNumber: String,
  street: String,
  barangay: String,
  city: String,
  province: String,
  zipCode: String,
  contactNumber: String,
  emailAddress: String,
  lastSchoolAttended: String,
  schoolAddress: String,
  gradeLevel: String,
  schoolYear: String,
  fatherName: String,
  fatherOccupation: String,
  fatherContactNumber: String,
  motherName: String,
  motherOccupation: String,
  motherContactNumber: String,
  guardianName: String,
  guardianRelationship: String,
  guardianOccupation: String,
  guardianContactNumber: String,
  emergencyContactName: String,
  emergencyContactRelationship: String,
  emergencyContactNumber: String,
  emergencyContactAddress: String,
  gradeToEnroll: String,
  track: String,
  section: String,
  // Document file paths
  form137File: String,
  form138File: String,
  goodMoralFile: String,
  medicalCertificateFile: String,
  parentIdFile: String,
  idPicturesFile: String,
  form137: Boolean,
  form138: Boolean,
  goodMoral: Boolean,
  medicalCertificate: Boolean,
  parentId: Boolean,
  idPictures: Boolean,
  specialNeeds: String,
  allergies: String,
  medications: String,
  agreementAccepted: Boolean,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  reviewNotes: String,
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate enrollment number
EnrollmentSchema.statics.generateEnrollmentNumber = function() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ENR-${year}-${randomNum}`;
};

// Update the updatedAt field before saving
EnrollmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isNew && !this.enrollmentNumber) {
    this.enrollmentNumber = this.constructor.generateEnrollmentNumber();
  }
  next();
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
