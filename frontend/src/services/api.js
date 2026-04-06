import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Entry API endpoints
export const getEntries = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.mood) {
    params.append('mood', filters.mood);
  }
  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/entries?${queryString}` : '/api/entries';

  return axiosInstance.get(url);
};

export const getEntry = (id) => {
  return axiosInstance.get(`/api/entries/${id}`);
};

export const createEntry = (data) => {
  return axiosInstance.post('/api/entries', data);
};

export const updateEntry = (id, data) => {
  return axiosInstance.put(`/api/entries/${id}`, data);
};

export const deleteEntry = (id) => {
  return axiosInstance.delete(`/api/entries/${id}`);
};

// Admin API endpoints
export const getAdminStats = () => {
  return axiosInstance.get('/api/admin/stats');
};

export const getAllUsers = () => {
  return axiosInstance.get('/api/admin/users');
};

export const deleteUser = (id) => {
  return axiosInstance.delete(`/api/admin/users/${id}`);
};

// Auth API endpoints
export const loginUser = (email, password) => {
  return axiosInstance.post('/api/auth/login', { email, password });
};

export const registerUser = (name, email, password) => {
  return axiosInstance.post('/api/auth/register', { name, email, password });
};

export default axiosInstance;
