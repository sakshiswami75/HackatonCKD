import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    console.log('🔑 User from localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
          console.log('✅ Token added to request');
        } else {
          console.warn('⚠️ User exists but no token found');
        }
      } catch (err) {
        console.error('❌ Error parsing user data:', err);
      }
    } else {
      console.warn('⚠️ No user found in localStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export default api;