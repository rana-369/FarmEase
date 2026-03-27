import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7284/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  console.log('API Request:', req.method?.toUpperCase(), req.url);
  return req;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

API.interceptors.response.use((res) => {
  console.log('API Response:', res.config.url, res.status, JSON.stringify(res.data));
  return res;
}, (error) => {
  console.error('Response error:', error.config?.url, error.response?.status, error.message);
  return Promise.reject(error);
});

export default API;