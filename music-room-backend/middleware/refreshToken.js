const axios = require('axios');

const refreshTokenMiddleware = async (req, res, next) => {
  if (!req.user) return next();
  
  try {
    // Check if token expires in next 5 minutes
    const expiresIn = req.user.tokenExpiresAt - new Date();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresIn < fiveMinutes) {
      console.log('🔄 Proactively refreshing Spotify token for user:', req.user._id);
      
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
      
      console.log('✅ Token refreshed proactively');
    }
  } catch (error) {
    console.error('❌ Proactive token refresh failed:', error.message);
    // Don't block the request, just log the error
  }
  
  next();
};

module.exports = refreshTokenMiddleware;