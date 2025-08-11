const mongoose = require('mongoose');

const form137StubSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Student Information
  surname: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  middleName: String,
  sex: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  barangay: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  learnerReferenceNumber: {
    type: String,
    required: true
  },
  // School Information
  lastGradeLevel: {
    type: String,
    required: true
  },
  lastAttendedYear: {
    type: String,
    required: true
  },
  receivingSchool: {
    type: String,
    required: true
  },
  receivingSchoolAddress: String,
  // Purpose/Declaration
  purpose: {
    type: String,
    required: true
  },
  // Parent/Guardian Information
  parentGuardianName: {
    type: String,
    required: true
  },
  parentGuardianAddress: {
    type: String,
    required: true
  },
  parentGuardianContact: String,
  // Stub Information
  stubCode: {
    type: String,
    required: true,
    unique: true
  },
  qrCode: String,
  // Status tracking
  status: {
    type: String,
    enum: ['stub-generated', 'submitted-to-registrar', 'verified-by-registrar', 'processing', 'ready-for-pickup', 'completed', 'cancelled'],
    default: 'stub-generated'
  },
  // Registrar actions
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  readyAt: Date,
  completedAt: Date,
  registrarNotes: String,
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
form137StubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique stub code
form137StubSchema.statics.generateStubCode = function() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `F137-${timestamp}-${random}`;
};

module.exports = mongoose.model('Form137Stub', form137StubSchema);
