import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const productAPI = axios.create({
  baseURL: `${API_BASE_URL}/products`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
productAPI.interceptors.request.use(
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
productAPI.interceptors.response.use(
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

// Get all products
export const getAllProducts = async (page = 1, limit = 20) => {
  try {
    const response = await productAPI.get('/', { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get product by ID
export const getProductById = async (productId) => {
  try {
    const response = await productAPI.get(`/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create product
export const createProduct = async (productData) => {
  try {
    const response = await productAPI.post('/', productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await productAPI.put(`/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const response = await productAPI.delete(`/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create variant
export const createVariant = async (productId, variantData) => {
  try {
    const response = await productAPI.post(`/${productId}/variants`, variantData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update variant
export const updateVariant = async (variantId, variantData) => {
  try {
    const response = await productAPI.put(`/variants/${variantId}`, variantData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
