import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
});

// Login
export const login = async (email, password) => {
  try {
    const response = await authAPI.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Signup
export const signup = async (name, email, password, confirmPassword) => {
  try {
    const response = await authAPI.post('/signup', { name, email, password, confirmPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get Profile
export const getProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await authAPI.get('/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await authAPI.post(
      '/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add token to request headers
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
