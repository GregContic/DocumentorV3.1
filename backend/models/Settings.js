const mongoose = require('mongoose');

// Settings model
const settingsSchema = new mongoose.Schema({
  // System Settings
  schoolName: {
    type: String,
    default: 'Eastern Luzon Technological National High School'
  },
  schoolAddress: {
    type: String,
    default: '123 School Street, City, Province'
  },
  schoolContactNumber: {
    type: String,
    default: '(123) 456-7890'
  },
  schoolEmail: {
    type: String,
    default: 'admin@eltnhs.edu.ph'
  },
  academicYear: {
    type: String,
    default: '2024-2025'
  },
  semester: {
    type: String,
    enum: ['First Semester', 'Second Semester', 'Summer'],
    default: 'First Semester'
  },
  documentProcessingDays: {
    type: Number,
    default: 3,
    min: 1,
    max: 30
  },
  maxRequestsPerUser: {
    type: Number,
    default: 5,
    min: 1,
    max: 20
  },

  // Security Settings
  requireEmailVerification: {
    type: Boolean,
    default: true
  },
  sessionTimeout: {
    type: Number,
    default: 30, // minutes
    min: 5,
    max: 480
  },
  passwordMinLength: {
    type: Number,
    default: 8,
    min: 6,
    max: 50
  },
  requireStrongPasswords: {
    type: Boolean,
    default: true
  },
  enableTwoFactorAuth: {
    type: Boolean,
    default: false
  },
  maxLoginAttempts: {
    type: Number,
    default: 5,
    min: 3,
    max: 10
  },

  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  newRequestNotifications: {
    type: Boolean,
    default: true
  },
  statusUpdateNotifications: {
    type: Boolean,
    default: true
  },
  dailyReportEmails: {
    type: Boolean,
    default: false
  },
  weeklyReportEmails: {
    type: Boolean,
    default: true
  },
  notificationEmail: {
    type: String,
    default: 'admin@eltnhs.edu.ph'
  },

  // Document Settings
  enableQRCodes: {
    type: Boolean,
    default: true
  },
  qrCodeExpirationDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },
  enableAIProcessing: {
    type: Boolean,
    default: true
  },
  enableChatbot: {
    type: Boolean,
    default: true
  },
  autoArchiveCompletedRequests: {
    type: Boolean,
    default: true
  },
  autoArchiveDays: {
    type: Number,
    default: 90,
    min: 1,
    max: 365
  },

  // Metadata
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Pre-save middleware to update the updatedAt field
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one settings document exists
settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
