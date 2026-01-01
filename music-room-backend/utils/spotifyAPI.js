const axios = require('axios');
const User = require('../models/User');

class SpotifyAPI {
  constructor(accessToken, refreshToken = null, userId = null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
    this.baseURL = 'https://api.spotify.com/v1';
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: process.env.SPOTIFY_CLIENT_ID,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      this.accessToken = response.data.access_token;
      
      // Update token in database
      if (this.userId) {
        const user = await User.findById(this.userId);
        if (user) {
          user.spotifyAccessToken = this.accessToken;
          user.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);
          await user.save();
        }
      }

      return this.accessToken;
    } catch (error) {
      console.error('Failed to refresh Spotify token:', error.message);
      throw new Error('Failed to refresh token');
    }
  }

  async searchTracks(query, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { q: query, type: 'track', limit },
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      return response.data.tracks.items;
    } catch (error) {
      // If 401 or 403, try refreshing token
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🔄 Token expired, refreshing...');
        await this.refreshAccessToken();
        
        // Retry the request with new token
        const response = await axios.get(`${this.baseURL}/search`, {
          params: { q: query, type: 'track', limit },
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        return response.data.tracks.items;
      }
      throw error;
    }
  }

  async getTrack(trackId) {
    try {
      const response = await axios.get(`${this.baseURL}/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      return response.data;
    } catch (error) {
      // If 401 or 403, try refreshing token
      if (error.response?.status === 401 || error.response?.status === 403) {
        await this.refreshAccessToken();
        
        const response = await axios.get(`${this.baseURL}/tracks/${trackId}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        return response.data;
      }
      throw error;
    }
  }
}

module.exports = SpotifyAPI;