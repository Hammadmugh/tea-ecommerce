import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertCircle, CheckCircle, Info, ChevronDown } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { onNewReview, onNewReply, initializeSocket } from '../services/socketService';
import { notificationApi } from '../services/notificationApi';

/**
 * NotificationBell Component
 * Displays real-time notifications from reviews, replies, and votes
 * Connects to Socket.IO via socketService for live updates
 */
export default function NotificationBell() {
  const { notifications, removeNotification, clearAllNotifications, addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const notificationPanelRef = useRef(null);
  const unreadCount = notifications.length;

  // Toggle expanded state for notifications
  const toggleExpanded = (notifId) => {
    setExpandedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notifId)) {
        newSet.delete(notifId);
      } else {
        newSet.add(notifId);
      }
      return newSet;
    });
  };

  // Initialize socket listeners for real-time notifications
  useEffect(() => {
    let unsubscribeReview;
    let unsubscribeReply;

    const initializeNotifications = async () => {
      try {
        console.log('🔧 NotificationBell: Initializing socket connection');
        setIsInitializing(true);

        // Fetch existing notifications from API (ensures all users see all notifications)
        try {
          const apiNotifications = await notificationApi.getGlobalNotifications(50, 0);
          console.log('📡 Fetched global notifications from API:', apiNotifications);
          // Notifications from API will be formatted as review/reply events
          if (apiNotifications.data && Array.isArray(apiNotifications.data)) {
            apiNotifications.data.slice(0, 10).forEach((notif) => {
              // Map API notifications to the same format as socket events
              if (notif.type === 'review_notification') {
                addNotification(
                  `📝 New review: "${notif.message.substring(0, 40)}..."`,
                  'info',
                  0,
                  {
                    type: 'review',
                    fullComment: notif.message,
                    productId: notif.relatedProductId,
                    authorName: notif.authorName || 'Anonymous'
                  }
                );
              } else if (notif.type === 'reply_notification') {
                addNotification(
                  `💬 ${notif.authorName || 'Someone'} replied to a review!`,
                  'info',
                  0,
                  {
                    type: 'reply',
                    authorName: notif.authorName || 'Someone',
                    replyText: notif.message
                  }
                );
              } else {
                addNotification(notif.message, notif.type || 'info', 0);
              }
            });
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch notifications from API:', error.message);
        }

        // Initialize socket connection
        const sock = initializeSocket();

        // Setup review listener
        console.log('👂 NotificationBell: Setting up review listener');
        unsubscribeReview = onNewReview((data) => {
          console.log('📢 NotificationBell: New review received', data);
          const reviewComment = data.data?.comment?.substring(0, 40) || 'New review';
          const message = `📝 New review: "${reviewComment}..." on ${data.productId || 'a product'}`;
          addNotification(message, 'info', 0, {
            type: 'review',
            fullComment: data.data?.comment || '',
            productId: data.productId,
            authorName: data.data?.authorName || 'Anonymous'
          });
        });

        // Setup reply and vote listener
        console.log('👂 NotificationBell: Setting up reply/vote listener');
        unsubscribeReply = onNewReply((data) => {
          console.log('📢 NotificationBell: Reply/vote received', data);

          // Extract nested data property if it exists
          const notificationData = data.data || data;
          const type = notificationData.type || 'reply';

          if (type === 'helpful-vote') {
            const count = notificationData.helpfulCount || 1;
            const plural = count > 1 ? 's' : '';
            addNotification(
              `👍 Your review received ${count} helpful vote${plural}!`,
              'success',
              0,
              { type: 'vote', voteType: 'helpful', count }
            );
          } else if (type === 'unhelpful-vote') {
            const count = notificationData.unhelpfulCount || 1;
            const plural = count > 1 ? 's' : '';
            addNotification(
              `👎 Your review has ${count} unhelpful vote${plural}`,
              'info',
              0,
              { type: 'vote', voteType: 'unhelpful', count }
            );
          } else if (type === 'reply') {
            const authorName = notificationData.authorName || 'Someone';
            addNotification(
              `💬 ${authorName} replied to your review!`,
              'info',
              0,
              {
                type: 'reply',
                authorName,
                replyText: notificationData.text || notificationData.comment || '',
                productId: data.productId,
                reviewId: data.reviewId
              }
            );
          } else {
            addNotification(
              `🔔 New update on your review!`,
              'info',
              0,
              { type: 'update' }
            );
          }
        });

        setIsInitializing(false);
      } catch (error) {
        console.error('❌ NotificationBell: Error initializing notifications', error);
        setIsInitializing(false);
        addNotification('⚠️ Failed to initialize notifications', 'error');
      }
    };

    // Call the async function immediately
    initializeNotifications();

    // Return cleanup function (not from async function)
    return () => {
      console.log('🧹 NotificationBell: Cleaning up listeners');
      unsubscribeReview?.();
      unsubscribeReply?.();
    };
  }, [addNotification]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={18} className="text-yellow-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  // Get background color for notification
  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      default:
        return 'bg-blue-50 border-l-4 border-blue-400';
    }
  };

  return (
    <div className="relative" ref={notificationPanelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-all duration-200 ${
          isOpen
            ? 'text-blue-600 bg-blue-50 rounded-lg'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg'
        }`}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        title="View notifications"
      >
        <Bell
          size={24}
          className={isOpen ? 'animate-pulse' : ''}
        />

        {/* Badge with unread count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full min-w-fit h-5 px-1 flex items-center justify-center transform -translate-y-1 translate-x-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Initializing indicator */}
        {isInitializing && (
          <span className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-125 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="sticky top-0 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">Notifications</h3>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {isInitializing ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="flex justify-center mb-2">
                    <div className="animate-spin">
                      <Bell size={20} className="text-blue-400" />
                    </div>
                  </div>
                  <p className="text-sm">Initializing notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Bell size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-1">You&apos;ll be notified when you receive reviews, replies, or votes on your reviews</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => {
                    const isExpanded = expandedNotifications.has(notif.id);
                    const hasDetails = notif.metadata && (notif.metadata.replyText || notif.metadata.fullComment || notif.metadata.type === 'vote');

                    return (
                      <div
                        key={notif.id}
                        className={`transition-colors ${getNotificationBgColor(
                          notif.type
                        )}`}
                      >
                        {/* Main notification content */}
                        <div className="p-4 hover:bg-opacity-75 transition-colors flex gap-3 items-start">
                          {/* Icon */}
                          <div className="shrink-0 mt-0.5">
                            {getNotificationIcon(notif.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 wrap-break-word">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full" />
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="shrink-0 flex gap-1">
                            {hasDetails && (
                              <button
                                onClick={() => toggleExpanded(notif.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                aria-label="Expand details"
                                title="View details"
                              >
                                <ChevronDown
                                  size={16}
                                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notif.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              aria-label="Dismiss notification"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && hasDetails && (
                          <div className="border-t border-gray-300 px-4 py-3 bg-opacity-50 bg-gray-100">
                            {notif.metadata?.type === 'review' && notif.metadata?.fullComment && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-700">
                                  Review from {notif.metadata.authorName}:
                                </p>
                                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-300 whitespace-pre-wrap">
                                  {notif.metadata.fullComment}
                                </p>
                                <button className="text-xs bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors font-medium">
                                  View Review
                                </button>
                              </div>
                            )}
                            {notif.metadata?.type === 'reply' && notif.metadata?.replyText && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-700">
                                  Reply from {notif.metadata.authorName}:
                                </p>
                                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-300 whitespace-pre-wrap">
                                  {notif.metadata.replyText}
                                </p>
                                <button className="text-xs bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors font-medium">
                                  View Full Review
                                </button>
                              </div>
                            )}
                            {notif.metadata?.type === 'vote' && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-700">
                                  Vote Details:
                                </p>
                                <p className="text-sm text-gray-700">
                                  {notif.metadata.voteType === 'helpful' ? '👍' : '👎'} 
                                  {' '}{notif.metadata.count} {notif.metadata.voteType} vote{notif.metadata.count > 1 ? 's' : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer (if needed) */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-xs text-gray-600 text-center">
                Showing {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
