const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Create a section
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all sections
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const sections = await Section.find();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sections by grade level
router.get('/grade/:gradeLevel', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const sections = await Section.find({ gradeLevel: req.params.gradeLevel });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
