import axios from 'axios';

/**
 * Reviews API Service
 * Client for interacting with NestJS Reviews API (Port 5001)
 * Handles all review-related HTTP requests with JWT auth
 */

const NESTJS_API_URL = 'http://localhost:5001/api/reviews';

// Create axios instance with automatic JWT injection
const createReviewAPI = () => {
  const api = axios.create({
    baseURL: NESTJS_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: Add JWT token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: Handle errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Redirect to login on 401 Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error);
    }
  );

  return api;
};

const reviewAPI = createReviewAPI();

/**
 * Create a new review for a product
 * @param {object} data - Review data { productId, rating, comment }
 * @returns {Promise} Created review
 */
export const createReview = async (data) => {
  try {
    const response = await reviewAPI.post('/', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all reviews for a product with pagination
 * @param {string} productId - Product ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise} Reviews list with pagination metadata
 */
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  try {
    const response = await reviewAPI.get(`/product/${productId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get rating statistics for a product (average, distribution)
 * @param {string} productId - Product ID
 * @returns {Promise} Rating stats with distribution
 */
export const getProductRatingStats = async (productId) => {
  try {
    const response = await reviewAPI.get(`/product/${productId}/rating-stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get average rating for a product
 * @param {string} productId - Product ID
 * @returns {Promise} Average rating
 */
export const getProductAverageRating = async (productId) => {
  try {
    const response = await reviewAPI.get(`/product/${productId}/rating-stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single review with all replies
 * @param {string} reviewId - Review ID
 * @returns {Promise} Review data with replies
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await reviewAPI.get(`/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update a review (owner only)
 * @param {string} reviewId - Review ID
 * @param {object} data - Fields to update { rating?, comment? }
 * @returns {Promise} Updated review
 */
export const updateReview = async (reviewId, data) => {
  try {
    const response = await reviewAPI.put(`/${reviewId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a review (owner or admin)
 * @param {string} reviewId - Review ID
 * @returns {Promise} Success message
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await reviewAPI.delete(`/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add a reply to a review
 * @param {string} reviewId - Review ID
 * @param {object} data - Reply data { content, isAdminReply? }
 * @returns {Promise} Updated review with new reply
 */
export const addReplyToReview = async (reviewId, data) => {
  try {
    const response = await reviewAPI.post(`/${reviewId}/replies`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update a reply (owner or admin)
 * @param {string} reviewId - Review ID
 * @param {string} replyId - Reply ID
 * @param {object} data - Updated data { content }
 * @returns {Promise} Updated review
 */
export const updateReply = async (reviewId, replyId, data) => {
  try {
    const response = await reviewAPI.put(`/${reviewId}/replies/${replyId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a reply (owner or admin)
 * @param {string} reviewId - Review ID
 * @param {string} replyId - Reply ID
 * @returns {Promise} Success message
 */
export const deleteReply = async (reviewId, replyId) => {
  try {
    const response = await reviewAPI.delete(`/${reviewId}/replies/${replyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark a review as helpful
 * @param {string} reviewId - Review ID
 * @returns {Promise} Updated review with incremented helpful count
 */
export const markHelpful = async (reviewId) => {
  try {
    const response = await reviewAPI.post(`/${reviewId}/mark-helpful`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark a review as unhelpful
 * @param {string} reviewId - Review ID
 * @returns {Promise} Updated review with incremented unhelpful count
 */
export const markUnhelpful = async (reviewId) => {
  try {
    const response = await reviewAPI.post(`/${reviewId}/mark-unhelpful`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Flag a review for moderation
 * @param {string} reviewId - Review ID
 * @returns {Promise} Updated review with flagged status
 */
export const flagReview = async (reviewId) => {
  try {
    const response = await reviewAPI.post(`/${reviewId}/flag`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default reviewAPI;
