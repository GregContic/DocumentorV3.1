const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  adviser: { type: String },
  capacity: { type: Number, default: 40 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Section', SectionSchema);
