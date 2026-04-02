import { API_BASE_URL } from "./api";

export const notificationApi = {
  // Fetch user's notifications
  async getNotifications(limit = 50, offset = 0) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/notifications?limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread notification count
  async getUnreadCount() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch unread count');
      return await response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/notifications/actions/read-all`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to mark all as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  // Delete all notifications
  async deleteAllNotifications() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete all notifications');
      return await response.json();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  },

  // Fetch global/broadcast notifications (available to all users)
  async getGlobalNotifications(limit = 50, offset = 0) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/notifications/global?limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) return { data: [], pagination: { page: 1, limit, total: 0, pages: 1 } }; // Fallback if endpoint doesn't exist
      return await response.json();
    } catch (error) {
      console.error('Error fetching global notifications:', error);
      return { data: [], pagination: { page: 1, limit, total: 0, pages: 1 } }; // Fallback
    }
  },
};
