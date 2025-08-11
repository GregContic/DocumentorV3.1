const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messages: [{
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    isBot: {
      type: Boolean,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    intent: {
      type: String,
      default: 'unknown'
    }
  }],
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ userId: 1, lastActive: -1 });

// Update lastActive on save
conversationSchema.pre('save', function() {
  this.lastActive = new Date();
});

// Auto-delete conversations older than 30 days
conversationSchema.index({ lastActive: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Conversation', conversationSchema);
