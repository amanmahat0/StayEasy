# users/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email_or_username = request.data.get("email")  # frontend sends 'email'
        password = request.data.get("password")

        try:
            # Try to get the user by email first
            user = User.objects.get(email=email_or_username)
        except User.DoesNotExist:
            try:
                # Fallback to username
                user = User.objects.get(username=email_or_username)
            except User.DoesNotExist:
                return Response({"error": "Invalid email or password"}, status=401)

        # Authenticate
        user_auth = authenticate(username=user.username, password=password)
        if user_auth is None:
            return Response({"error": "Invalid email or password"}, status=401)

        # If user is admin (superuser) or profile.role is 'admin', send redirect
        if user.is_superuser or getattr(user.profile, 'role', None) == "admin":
            return Response({
                "message": "Admin login successful",
                "role": "admin",
                "redirect": "/admin-dashboard/"
            })

        # Tenant/Owner: proceed with normal JWT login
        request.data["username"] = user.username
        return super().post(request, *args, **kwargs)