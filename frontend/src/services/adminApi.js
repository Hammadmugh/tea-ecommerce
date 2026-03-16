import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests with proper error handling
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Analytics API
export const getAnalytics = async () => {
  try {
    const response = await adminAPI.get('/analytics');
    return response.data.data; // Return the data payload, not the entire response
  } catch (error) {
    throw error.response?.data || error;
  }
};

// User Management APIs
export const getAllUsers = async (page = 1, limit = 20, role = null, isBlocked = null) => {
  try {
    const params = { page, limit };
    if (role) params.role = role;
    if (isBlocked !== null) params.isBlocked = isBlocked;
    
    const response = await adminAPI.get('/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const blockUser = async (userId) => {
  try {
    const response = await adminAPI.put(`/users/${userId}/block`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const unblockUser = async (userId) => {
  try {
    const response = await adminAPI.put(`/users/${userId}/unblock`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createAdmin = async (name, email, password) => {
  try {
    const response = await adminAPI.post('/users/create-admin', {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changeUserRole = async (userId, newRole) => {
  try {
    const response = await adminAPI.put(`/users/${userId}/role`, {
      role: newRole,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await adminAPI.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
