import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('architect_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const architectAPI = {
  recommend: (data) => api.post('/architect/recommend', data),
  chat: (data) => api.post('/architect/chat', data),
};

export const projectsAPI = {
  getHistory: () => api.get('/projects/history'),
  getById: (id) => api.get(`/projects/${id}`),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const pdfAPI = {
  exportReport: (evalData) => api.post('/pdf/export', evalData, { responseType: 'blob' }),
};

export default api;
