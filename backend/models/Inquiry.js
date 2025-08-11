const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'resolved', 'rejected', 'closed', 'archived'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String
  },
  archivedAt: {
    type: Date
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
  replies: [
    {
      message: String,
      repliedBy: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

// Pre-save hook to prevent admin inquiries at database level
inquirySchema.pre('save', function(next) {
  if (this.userRole === 'admin') {
    const error = new Error('Admins are not allowed to submit inquiries');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Inquiry', inquirySchema);
