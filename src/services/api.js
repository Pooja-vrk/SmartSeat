// API service configuration
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
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

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (only if not already on login page)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  get: async (endpoint) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  put: async (endpoint, data) => {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  patch: async (endpoint, data) => {
    try {
      const response = await apiClient.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (endpoint) => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
