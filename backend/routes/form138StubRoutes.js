const express = require('express');
const router = express.Router();
const form138StubController = require('../controllers/form138StubController');
const { authenticate } = require('../middleware/authMiddleware');

// User routes
router.post('/create', authenticate, form138StubController.createStub);
router.get('/my-stubs', authenticate, form138StubController.getUserStubs);
router.get('/:id', authenticate, form138StubController.getStubById);

// Admin routes
router.get('/', authenticate, form138StubController.getAllStubs);
router.put('/:id/status', authenticate, form138StubController.updateStubStatus);
router.get('/verify/:stubCode', authenticate, form138StubController.verifyStubByCode);

module.exports = router;
