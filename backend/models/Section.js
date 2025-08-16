const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  adviser: { type: String },
  capacity: { type: Number, default: 40 },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index to ensure unique section name per grade level
SectionSchema.index({ name: 1, gradeLevel: 1 }, { unique: true });

module.exports = mongoose.model('Section', SectionSchema);
