import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7284/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - add auth token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - handle errors globally
API.interceptors.response.use((res) => {
  return res;
}, (error) => {
  const { response, config } = error;
  
  // Handle 401 Unauthorized - redirect to login
  if (response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  
  // Handle 403 Forbidden
  if (response?.status === 403) {
    console.warn('Access denied:', config?.url);
  }
  
  // Handle network errors
  if (!response) {
    error.code = 'NETWORK_ERROR';
  }
  
  return Promise.reject(error);
});

export default API;