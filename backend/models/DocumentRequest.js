const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  
  // Student Information
  surname: String,
  givenName: String,
  dateOfBirth: Date,
  placeOfBirth: String,
  province: String,
  town: String,
  barrio: String,
  sex: String,
  studentNumber: String,
  
  // Parent/Guardian Information
  parentGuardianName: String,
  parentGuardianAddress: String,
  parentGuardianOccupation: String,
  
  // Educational Information
  elementaryCourseCompleted: String,
  elementarySchool: String,
  elementaryYear: String,
  elementaryGenAve: String,
  yearGraduated: String,
  currentSchool: String,
  schoolAddress: String,
  
  // Pickup Information
  preferredPickupDate: String,
  preferredPickupTime: String,
  additionalNotes: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'processing', 'submitted'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  reviewNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: String
  },
  completedAt: {
    type: Date
  },
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
documentRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
