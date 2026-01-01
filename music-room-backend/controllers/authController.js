const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate Spotify OAuth URL
exports.spotifyAuth = (req, res) => {
  const scopes = [
    'user-read-email',
    'user-read-private',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${process.env.SPOTIFY_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scopes)}`;

  res.json({ authUrl });
};

// Handle Spotify callback
exports.spotifyCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile from Spotify
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const profile = profileResponse.data;

    // Find or create user
    let user = await User.findOne({ spotifyId: profile.id });

    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    if (user) {
      // Update existing user
      user.spotifyAccessToken = access_token;
      user.spotifyRefreshToken = refresh_token;
      user.tokenExpiresAt = tokenExpiresAt;
      user.displayName = profile.display_name;
      user.email = profile.email;
      user.profileImage = profile.images[0]?.url || '';
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        spotifyId: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        profileImage: profile.images[0]?.url || '',
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        tokenExpiresAt
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, spotifyId: user.spotifyId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    console.error('Auth error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-spotifyAccessToken -spotifyRefreshToken');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};