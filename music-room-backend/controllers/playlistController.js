const Song = require('../models/Song');
const Lounge = require('../models/Lounge');
const User = require('../models/User');
const SpotifyAPI = require('../utils/spotifyAPI');
const { getIO } = require('../config/socket');

// Search Spotify tracks
exports.searchTracks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Check if token is expired and refresh if needed
    if (new Date() >= req.user.tokenExpiresAt) {
      console.log('🔄 Token expired, refreshing for user:', req.user._id);
      
      try {
        const axios = require('axios');
        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: req.user.spotifyRefreshToken,
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        req.user.spotifyAccessToken = response.data.access_token;
        req.user.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);
        await req.user.save();
        
        console.log('✅ Token refreshed successfully');
      } catch (error) {
        console.error('❌ Token refresh failed:', error.message);
        return res.status(401).json({ error: 'Failed to refresh Spotify token. Please login again.' });
      }
    }

    const spotifyAPI = new SpotifyAPI(
      req.user.spotifyAccessToken,
      req.user.spotifyRefreshToken,
      req.user._id
    );
    
    const tracks = await spotifyAPI.searchTracks(query);

    // Format tracks for frontend
    const formattedTracks = tracks.map(track => ({
      spotifyId: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || '',
      duration: track.duration_ms,
      previewUrl: track.preview_url || ''
    }));

    res.json({ tracks: formattedTracks });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
};

// Add song to lounge playlist
exports.addSong = async (req, res) => {
  try {
    const { loungeId, track } = req.body;

    if (!loungeId || !track) {
      return res.status(400).json({ error: 'Lounge ID and track are required' });
    }

    // Verify lounge exists and user is a member
    const lounge = await Lounge.findById(loungeId);
    if (!lounge) {
      return res.status(404).json({ error: 'Lounge not found' });
    }

    if (!lounge.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not a member of this lounge' });
    }

    // Check if song already exists in playlist
    const existingSong = await Song.findOne({
      loungeId,
      spotifyId: track.spotifyId,
      isPlayed: false
    });

    if (existingSong) {
      return res.status(400).json({ error: 'Song already in playlist' });
    }

    // Add song
    const song = await Song.create({
      loungeId,
      spotifyId: track.spotifyId,
      title: track.title,
      artist: track.artist,
      album: track.album,
      albumArt: track.albumArt,
      duration: track.duration,
      previewUrl: track.previewUrl,
      addedBy: req.user._id,
      votes: 0,
      voters: []
    });

    const populatedSong = await Song.findById(song._id)
      .populate('addedBy', 'displayName profileImage');

    // Emit socket event
    const io = getIO();
    io.to(loungeId).emit('songAdded', { song: populatedSong });

    res.status(201).json({ song: populatedSong });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add song' });
  }
};

// Vote on a song
exports.voteSong = async (req, res) => {
  try {
    const { songId, vote } = req.body; // vote: 1 (upvote) or -1 (downvote)

    if (!songId || (vote !== 1 && vote !== -1)) {
      return res.status(400).json({ error: 'Invalid vote data' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if user is member of lounge
    const lounge = await Lounge.findById(song.loungeId);
    if (!lounge.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not a member of this lounge' });
    }

    // Check if user already voted
    const existingVote = song.voters.find(
      v => v.userId.toString() === req.user._id.toString()
    );

    if (existingVote) {
      // Remove old vote
      song.votes -= existingVote.vote;
      
      if (existingVote.vote === vote) {
        // Remove vote if clicking same button
        song.voters = song.voters.filter(
          v => v.userId.toString() !== req.user._id.toString()
        );
      } else {
        // Change vote
        existingVote.vote = vote;
        song.votes += vote;
      }
    } else {
      // New vote
      song.voters.push({ userId: req.user._id, vote });
      song.votes += vote;
    }

    await song.save();

    const populatedSong = await Song.findById(song._id)
      .populate('addedBy', 'displayName profileImage');

    // Emit socket event
    const io = getIO();
    io.to(song.loungeId.toString()).emit('songVoted', { 
      song: populatedSong,
      userId: req.user._id,
      vote
    });

    res.json({ song: populatedSong });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote on song' });
  }
};

// Remove song from playlist
exports.removeSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Only the user who added the song or lounge creator can remove it
    const lounge = await Lounge.findById(song.loungeId);
    const isCreator = lounge.creator.toString() === req.user._id.toString();
    const isAdder = song.addedBy.toString() === req.user._id.toString();

    if (!isCreator && !isAdder) {
      return res.status(403).json({ error: 'You cannot remove this song' });
    }

    await Song.findByIdAndDelete(song._id);

    // Emit socket event
    const io = getIO();
    io.to(song.loungeId.toString()).emit('songRemoved', { 
      songId: song._id 
    });

    res.json({ message: 'Song removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove song' });
  }
};

// Mark song as played
exports.markAsPlayed = async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    song.isPlayed = true;
    await song.save();

    res.json({ message: 'Song marked as played' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark song as played' });
  }
};