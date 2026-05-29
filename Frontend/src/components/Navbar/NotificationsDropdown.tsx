import { useEffect, useState, useCallback } from 'react';
import { Bell, X, Check } from 'lucide-react';
import type { Notification } from '../../services/notificationService';
import notificationService from '../../services/notificationService';

interface NotificationsDropdownProps {
  onNotificationCountChange?: (count: number) => void;
}

export default function NotificationsDropdown({ onNotificationCountChange }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(20, 0);
      setNotifications(data);
      
      // Count unread notifications
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      if (onNotificationCountChange) {
        onNotificationCountChange(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [onNotificationCountChange]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark notification as read
  const handleMarkAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    fetchNotifications();
  };

  // Delete notification
  const handleDelete = async (id: number) => {
    await notificationService.deleteNotification(id);
    fetchNotifications();
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'booking_cancelled':
        return { icon: '❌', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'booking_completed':
        return { icon: '🏁', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'refund_processed':
        return { icon: '💰', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'kyc_approved':
        return { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'kyc_rejected':
        return { icon: '❌', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'payment_received':
        return { icon: '💳', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'payment_failed':
        return { icon: '⚠️', color: 'text-red-600', bgColor: 'bg-red-50' };
      default:
        return { icon: '📬', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition relative group"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700 group-hover:text-[#A989C8]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded-lg transition"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin">⏳</div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const style = getNotificationStyle(notification.notification_type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`text-2xl flex-shrink-0 mt-1`}>
                          {style.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </p>
                              <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>

                            {/* Mark as Read Button */}
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 hover:bg-white rounded transition flex-shrink-0"
                                title="Mark as read"
                              >
                                <Check size={16} className="text-green-600" />
                              </button>
                            )}
                          </div>

                          {/* Time */}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 hover:bg-white rounded transition flex-shrink-0"
                          title="Delete"
                        >
                          <X size={14} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full text-center text-sm font-medium text-[#A989C8] hover:text-[#9677b4] transition py-2"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
