const express = require('express');
const router = express.Router();
const loungeController = require('../controllers/loungeController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new lounge
router.post('/create', loungeController.createLounge);

// Get all active lounges
router.get('/all', loungeController.getAllLounges);

// Get user's lounges
router.get('/my-lounges', loungeController.getMyLounges);

// Join a lounge by code
router.post('/join', loungeController.joinLounge);

// Get lounge details
router.get('/:id', loungeController.getLoungeDetails);

// Leave a lounge
router.post('/:id/leave', loungeController.leaveLounge);

// Delete a lounge (creator only)
router.delete('/:id', loungeController.deleteLounge);

module.exports = router;