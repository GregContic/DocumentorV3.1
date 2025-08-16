const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Create a section
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
  console.log('[SECTION CREATE] request by user:', req.user ? req.user.userId : 'no-user', 'body:', req.body);
    const section = new Section(req.body);
    await section.save();
  console.log('[SECTION CREATE] created section:', section._id, section.name, section.gradeLevel);
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
    const gradeParam = req.params.gradeLevel;
    console.log('[SECTIONS BY GRADE] received gradeParam:', gradeParam);
    
    // Extract number from grade level (e.g., "Grade 7" -> "7", "7" -> "7")
    const gradeNum = gradeParam.replace(/grade\s*/i, '').trim();
    
    // Create multiple variations to match
    // When someone searches for "7", we want to find sections stored as "Grade 7"
    // When someone searches for "Grade 7", we want to find sections stored as "Grade 7"
    const gradeVariants = [
      gradeParam, // Original search term (e.g., "7" or "Grade 7")
      `Grade ${gradeNum}`, // Always try the "Grade X" format since that's how sections are stored
    ];
    
    // Remove duplicates
    const uniqueVariants = [...new Set(gradeVariants)];
    
    console.log('[SECTIONS BY GRADE] searching for variants:', uniqueVariants);
    
    const sections = await Section.find({
      $or: uniqueVariants.map(variant => ({
        gradeLevel: { $regex: `^\\s*${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, $options: 'i' }
      }))
    });
    
    console.log('[SECTIONS BY GRADE] found sections:', sections.length);
    sections.forEach(s => console.log('[SECTIONS BY GRADE] section:', s.name, s.gradeLevel));
    
    res.json(sections);
  } catch (err) {
    console.error('[SECTIONS BY GRADE] error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
