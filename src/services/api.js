// API service configuration
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5003/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const publicPaths = [
        '/login',
        '/admin/login',
        '/register'
      ];

      const isPublicPath = publicPaths.includes(
        window.location.pathname
      );

      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// API WRAPPER
// IMPORTANT:
// Every method accepts Axios config.
// This allows:
// api.get('/buses', { params: {...} })
// ============================================================

const api = {
  get: async (endpoint, config = {}) => {
    const response = await apiClient.get(
      endpoint,
      config
    );

    return response.data;
  },

  post: async (
    endpoint,
    data = {},
    config = {}
  ) => {
    const response = await apiClient.post(
      endpoint,
      data,
      config
    );

    return response.data;
  },

  put: async (
    endpoint,
    data = {},
    config = {}
  ) => {
    const response = await apiClient.put(
      endpoint,
      data,
      config
    );

    return response.data;
  },

  patch: async (
    endpoint,
    data = {},
    config = {}
  ) => {
    const response = await apiClient.patch(
      endpoint,
      data,
      config
    );

    return response.data;
  },

  delete: async (
    endpoint,
    config = {}
  ) => {
    const response = await apiClient.delete(
      endpoint,
      config
    );

    return response.data;
  }
};

export default api;