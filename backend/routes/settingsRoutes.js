const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/public', settingsController.getPublicSettings);

// Admin-only routes
router.get('/', authenticate, authorizeAdmin, settingsController.getSettings);
router.put('/', authenticate, authorizeAdmin, settingsController.updateSettings);
router.post('/reset', authenticate, authorizeAdmin, settingsController.resetSettings);

module.exports = router;
