const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['form137', 'form138', 'goodMoral', 'diploma', 'transcript']
  },
  purpose: {
    type: String,
    required: true
  },
  
  // Student Information
  surname: String,
  givenName: String,
  middleName: String,
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
  trackStrand: String,
  gradeLevel: String,
  schoolYear: String,
  
  // Pickup Information
  preferredPickupDate: String,
  preferredPickupTime: String,
  additionalNotes: String,
  
  // OCR Extracted Data
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // File uploads
  uploadedFiles: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Request processing
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  processingSteps: [{
    step: String,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed']
    },
    completedAt: Date,
    notes: String
  }],
  
  estimatedCompletionDate: Date,
  
  status: {
    type: String,
    enum: ['draft', 'submitted', 'pending', 'processing', 'approved', 'rejected', 'completed', 'ready-for-pickup'],
    default: 'draft'
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
  
  // Notifications
  notificationsSent: [{
    type: String,
    sentAt: Date,
    channel: String // email, sms, in-app
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
// Pre-save middleware to update the updatedAt field and calculate estimated completion
documentRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate estimated completion date based on document type and priority
  if (this.isNew && !this.estimatedCompletionDate) {
    const baseBusinessDays = {
      'form137': 3,
      'form138': 3,
      'goodMoral': 2,
      'diploma': 5,
      'transcript': 4
    };
    
    const priorityMultiplier = {
      'urgent': 0.5,
      'high': 0.7,
      'normal': 1,
      'low': 1.5
    };
    
    const baseDays = baseBusinessDays[this.documentType] || 3;
    const multiplier = priorityMultiplier[this.priority] || 1;
    const estimatedDays = Math.ceil(baseDays * multiplier);
    
    // Calculate business days from now
    const today = new Date();
    let businessDays = 0;
    let currentDate = new Date(today);
    
    while (businessDays < estimatedDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        businessDays++;
      }
    }
    
    this.estimatedCompletionDate = currentDate;
  }
  
  next();
});

// Initialize processing steps on creation
documentRequestSchema.pre('save', function(next) {
  if (this.isNew && this.processingSteps.length === 0) {
    const steps = {
      'form137': [
        { step: 'Document Verification', status: 'pending' },
        { step: 'Data Extraction', status: 'pending' },
        { step: 'Admin Review', status: 'pending' },
        { step: 'Document Generation', status: 'pending' },
        { step: 'Quality Check', status: 'pending' }
      ],
      'form138': [
        { step: 'Document Verification', status: 'pending' },
        { step: 'Grade Validation', status: 'pending' },
        { step: 'Admin Review', status: 'pending' },
        { step: 'Document Generation', status: 'pending' },
        { step: 'Quality Check', status: 'pending' }
      ],
      'goodMoral': [
        { step: 'Request Validation', status: 'pending' },
        { step: 'Background Check', status: 'pending' },
        { step: 'Admin Approval', status: 'pending' },
        { step: 'Document Generation', status: 'pending' }
      ]
    };
    
    this.processingSteps = steps[this.documentType] || steps['form137'];
  }
  
  next();
});

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
