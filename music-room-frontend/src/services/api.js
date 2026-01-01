import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      
      // Only redirect if not already on home page
      if (window.location.pathname !== '/') {
        alert('Your session has expired. Please login again.');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  getSpotifyAuthUrl: () => api.get('/auth/spotify'),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Lounge endpoints
export const lounge = {
  create: (data) => api.post('/lounge/create', data),
  getAll: () => api.get('/lounge/all'),
  getMyLounges: () => api.get('/lounge/my-lounges'),
  join: (code) => api.post('/lounge/join', { code }),
  getDetails: (id) => api.get(`/lounge/${id}`),
  leave: (id) => api.post(`/lounge/${id}/leave`),
  delete: (id) => api.delete(`/lounge/${id}`)
};

// Playlist endpoints
export const playlist = {
  searchTracks: (query) => api.get('/playlist/search', { params: { query } }),
  addSong: (data) => api.post('/playlist/add', data),
  vote: (songId, vote) => api.post('/playlist/vote', { songId, vote }),
  removeSong: (songId) => api.delete(`/playlist/${songId}`),
  markAsPlayed: (songId) => api.patch(`/playlist/${songId}/played`)
};

export default api;
