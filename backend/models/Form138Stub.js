const mongoose = require('mongoose');

const form138StubSchema = new mongoose.Schema({
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
  placeOfBirth: String,
  lrn: String,
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
  // Academic Information
  gradeLevel: {
    type: String,
    required: true
  },
  schoolYear: {
    type: String,
    required: true
  },
  section: String,
  adviser: String,
  // Request Details
  purpose: {
    type: String,
    required: true
  },
  numberOfCopies: {
    type: String,
    default: '1'
  },
  // Parent/Guardian Information
  parentName: {
    type: String,
    required: true
  },
  parentAddress: {
    type: String,
    required: true
  },
  parentContact: String,
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
form138StubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique stub code
form138StubSchema.statics.generateStubCode = function() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `F138-${timestamp}-${random}`;
};

module.exports = mongoose.model('Form138Stub', form138StubSchema);
