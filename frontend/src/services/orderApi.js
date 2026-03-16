import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const orderAPI = axios.create({
  baseURL: `${API_BASE_URL}/orders`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests with proper error handling
orderAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
orderAPI.interceptors.response.use(
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

// Get user's orders
export const getUserOrders = async (page = 1, limit = 10) => {
  try {
    const response = await orderAPI.get(`/my-orders`, { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get order details
export const getOrderDetails = async (orderId) => {
  try {
    const response = await orderAPI.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create order from checkout
export const createOrder = async (orderData, cartItems = []) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be logged in to place an order');
    }

    console.log('📦 Raw cartItems received in orderApi:', cartItems);
    
    // Include cart items in the order data with better property mapping
    const cartItemsForBackend = cartItems.map((item, idx) => {
      const mappedItem = {
        // Handle both old (id, name, price) and new (productId, productName, pricePerUnit) formats
        productId: item.productId !== undefined ? item.productId : item.id,
        productName: item.productName !== undefined ? item.productName : item.name,
        productImage: item.productImage !== undefined ? item.productImage : item.image,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit !== undefined ? item.pricePerUnit : item.price,
        variantLabel: item.variantLabel || item.variant,
        variant: item.variant,
        totalPrice: (item.pricePerUnit !== undefined ? item.pricePerUnit : item.price) * item.quantity
      };
      
      console.log(`📦 Item ${idx} mapped:`, mappedItem);
      return mappedItem;
    });

    const completeOrderData = {
      ...orderData,
      cartItems: cartItemsForBackend
    };

    console.log('📦 Sending complete order data:', completeOrderData);
    
    const response = await orderAPI.post('/place', completeOrderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error.response?.data || error;
  }
};
