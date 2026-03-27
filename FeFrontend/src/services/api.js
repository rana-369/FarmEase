// API Configuration - Updated for port 7284
import axios from 'axios';

// Create axios instance with base URL pointing to .NET backend
const api = axios.create({
  baseURL: 'https://localhost:7284/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for CORS with credentials
});

// Request interceptor - automatically attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (import.meta.env.DEV) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (import.meta.env.DEV) {
        console.log('Authorization header set');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - debug authentication issues
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (import.meta.env.DEV) {
        console.error('401 Unauthorized Error:');
        console.error('URL:', error.config?.url);
        console.error('Method:', error.config?.method?.toUpperCase());
        console.error('Headers:', error.config?.headers);
        console.error('Response:', error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
