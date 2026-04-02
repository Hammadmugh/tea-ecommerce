import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const idCounterRef = useRef(0);

  const addNotification = useCallback((message, type = 'info', duration = 0, metadata = {}) => {
    const id = ++idCounterRef.current; // Use a counter for unique IDs
    const notification = {
      id,
      message,
      type, // 'info', 'success', 'warning', 'error'
      timestamp: new Date(),
      metadata, // Additional data for expanded views
    };

    console.log(`📌 Adding notification #${id}: ${message}`);
    setNotifications((prev) => [notification, ...prev]);

    // Auto-remove after duration (only if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    console.log(`❌ Removing notification #${id}`);
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
