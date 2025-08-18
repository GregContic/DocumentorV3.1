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

// Update a section
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, adviser } = req.body;
    
    console.log('[SECTION UPDATE] request by user:', req.user ? req.user.userId : 'no-user', 'id:', id, 'body:', req.body);
    
    // Validate required fields
    if (!name || !adviser) {
      return res.status(400).json({ message: 'Section name and adviser are required' });
    }
    
    // Check if section exists
    const existingSection = await Section.findById(id);
    if (!existingSection) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Store the old section name for updating enrollments
    const oldSectionName = existingSection.name;
    const newSectionName = name.trim();
    
    // Check if another section with the same name and grade level already exists
    const duplicateSection = await Section.findOne({
      _id: { $ne: id },
      name: newSectionName,
      gradeLevel: existingSection.gradeLevel
    });
    
    if (duplicateSection) {
      return res.status(400).json({ message: 'A section with this name already exists for this grade level' });
    }
    
    // Update the section
    const updatedSection = await Section.findByIdAndUpdate(
      id,
      { 
        name: newSectionName,
        adviser: adviser.trim()
      },
      { new: true, runValidators: true }
    );
    
    // If the section name changed, update all enrollment records that reference the old section name
    if (oldSectionName !== newSectionName) {
      const Enrollment = require('../models/Enrollment');
      
      console.log('[SECTION UPDATE] Updating enrollment records from section:', oldSectionName, 'to:', newSectionName, 'for grade:', existingSection.gradeLevel);
      
      const updateResult = await Enrollment.updateMany(
        { 
          section: oldSectionName,
          gradeToEnroll: existingSection.gradeLevel
        },
        { 
          $set: { section: newSectionName }
        }
      );
      
      console.log('[SECTION UPDATE] Updated', updateResult.modifiedCount, 'enrollment records');
    }
    
    console.log('[SECTION UPDATE] updated section:', updatedSection._id, updatedSection.name, updatedSection.adviser);
    res.json(updatedSection);
  } catch (err) {
    console.error('[SECTION UPDATE] error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
