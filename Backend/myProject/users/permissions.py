from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(request.user.is_superuser or request.user.profile.role == 'admin')


class CanChat(permissions.BasePermission):
    """Allow only tenants and owners (landlords) to access chat endpoints."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # LandlordUser via JWT
        if hasattr(request, 'auth') and request.auth:
            payload = getattr(request.auth, 'payload', {})
            if payload and payload.get('landlord_id'):
                return True

        # Regular user with valid chat role
        user_type = getattr(request.user.profile, 'user_type', None)
        if user_type in ('tenant', 'owner'):
            return True

        return False