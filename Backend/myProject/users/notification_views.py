from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer


# =====================================================
# NOTIFICATION ENDPOINTS
# =====================================================

class NotificationListView(generics.ListAPIView):
    """
    User: Get their notifications
    GET /api/notifications/
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Use pagination from DRF defaults

    def get_queryset(self):
        """Get notifications for the current user"""
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    User: Get, update, or delete a specific notification
    GET/PATCH/DELETE /api/notifications/<id>/
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Only allow users to access their own notifications"""
        return Notification.objects.filter(recipient=self.request.user)


class NotificationUnreadCountView(generics.GenericAPIView):
    """
    User: Get count of unread notifications
    GET /api/notifications/unread-count/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get unread notification count"""
        unread_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({
            'unread_count': unread_count
        }, status=status.HTTP_200_OK)


class MarkAllNotificationsReadView(generics.GenericAPIView):
    """
    User: Mark all notifications as read
    POST /api/notifications/mark-all-read/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Mark all user notifications as read"""
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': f'Marked {updated_count} notifications as read',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)
