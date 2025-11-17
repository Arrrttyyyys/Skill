import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'http://localhost:3001/api'; // Change to your production URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // For web, use localStorage synchronously
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // For React Native, token will be added via AsyncStorage in AuthContext
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

