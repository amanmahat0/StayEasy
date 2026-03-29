from rest_framework import permissions

# Only allow admin users to access certain views
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Allow if superuser OR has admin role in profile
        return bool(request.user.is_superuser or request.user.profile.role == 'admin')