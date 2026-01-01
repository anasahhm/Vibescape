const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Spotify OAuth routes
router.get('/spotify', authController.spotifyAuth);
router.get('/callback', authController.spotifyCallback);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

// Logout
router.post('/logout', auth, authController.logout);

module.exports = router;