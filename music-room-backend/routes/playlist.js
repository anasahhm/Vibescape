const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const auth = require('../middleware/auth');
const refreshToken = require('../middleware/refreshToken');

// All routes require authentication and auto-refresh token
router.use(auth);
router.use(refreshToken);

// Search Spotify tracks
router.get('/search', playlistController.searchTracks);

// Add song to lounge playlist
router.post('/add', playlistController.addSong);

// Vote on a song
router.post('/vote', playlistController.voteSong);

// Remove song from playlist
router.delete('/:songId', playlistController.removeSong);

// Mark song as played
router.patch('/:songId/played', playlistController.markAsPlayed);

module.exports = router;