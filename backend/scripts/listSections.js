// scripts/listSections.js
const mongoose = require('mongoose');
const Section = require('../models/Section');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/YOUR_DB_NAME'; // update if needed

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const sections = await Section.find();
    console.log('Sections in DB:');
    sections.forEach(s => {
      console.log(`- Name: ${s.name}, Grade Level: "${s.gradeLevel}"`);
    });
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
  