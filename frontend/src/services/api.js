import axios from 'axios';

// API base URL - will be proxied through nginx
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export const urlService = {
  // Shorten a URL
  shorten: async (url, customAlias = '') => {
    try {
      const response = await api.post('/shorten', {
        url,
        custom_alias: customAlias,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to shorten URL' };
    }
  },

  // Get URL statistics
  getStats: async (shortCode) => {
    try {
      const response = await api.get(`/stats/${shortCode}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get statistics' };
    }
  },

  testRedirect: async (shortCode) => {
    try {
      const response = await api.get(`/${shortCode}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status === 302;
        }
      });
      
      return {
        status: 302,
        location: response.headers.location,
        success: true,
      };
      
    } catch (error) {
      if (error.response?.status === 302) {
        return {
          status: 302,
          location: error.response.headers.location,
          success: true,
        };
      }
      throw { 
        error: error.response?.data?.error || 'URL not found',
        status: error.response?.status 
      };
    }
  },
  // Health check
  health: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw { error: 'Service unavailable' };
    }
  },
};

export default api;