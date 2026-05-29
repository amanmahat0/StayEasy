import API from './api';

export interface Notification {
  id: number;
  recipient: number;
  notification_type: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: number;
  is_read: boolean;
  created_at: string;
}

class NotificationService {
  /**
   * Fetch all notifications for the current user
   */
  async getNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    try {
      const res = await API.get('/notifications/', {
        params: { limit, offset }
      });
      return res.data.results || res.data || [];
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      return [];
    }
  }

  /**
   * Fetch unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await API.get('/notifications/unread-count/');
      return res.data.unread_count || 0;
    } catch (err) {
      console.error('Failed to fetch unread count', err);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      await API.patch(`/notifications/${notificationId}/`, { is_read: true });
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      await API.post('/notifications/mark-all-read/');
      return true;
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      await API.delete(`/notifications/${notificationId}/`);
      return true;
    } catch (err) {
      console.error('Failed to delete notification', err);
      return false;
    }
  }

  /**
   * Get notification type display name and color
   */
  getNotificationStyle(type: string): { icon: string; color: string; bgColor: string } {
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
  }
}

export default new NotificationService();
