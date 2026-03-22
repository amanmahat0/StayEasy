from rest_framework import generics, permissions, views
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Profile, KYC, Property
from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    KYCSerializer,
    KYCStatusSerializer,
    PropertyCreateSerializer
)
from rest_framework.views import APIView
# ----------------------
# REGISTER USER
# ----------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        profile = user.profile
        profile.email_verified = False
        profile.save()

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_link = f"http://localhost:5173/verify-email-confirm/{uid}/{token}"

        send_mail(
            "Verify your email",
            f"Click here to verify your account: {verify_link}",
            "noreply@stayeasy.com",
            [user.email],
            fail_silently=False
        )
        self._verification_link = verify_link

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if hasattr(self, "_verification_link"):
            response.data["verification_link"] = self._verification_link
        return response


# ----------------------
# VERIFY EMAIL
# ----------------------
class VerifyEmailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({"error": "Invalid verification link"}, status=400)

        if default_token_generator.check_token(user, token):
            user.profile.email_verified = True
            user.profile.save()
            return Response({"message": "Email verified successfully"})
        return Response({"error": "Invalid or expired token"}, status=400)


# ----------------------
# LOGIN WITH JWT
# ----------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=401)

        if not user.profile.email_verified:
            return Response({"error": "Please verify your email first"}, status=403)

        user_auth = authenticate(username=user.username, password=password)
        if user_auth is None:
            return Response({"error": "Invalid credentials"}, status=401)

        request.data["username"] = user.username
        return super().post(request, *args, **kwargs)


# ----------------------
# PROFILE
# ----------------------
class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "role": profile.role,
            "user_type": profile.user_type,
            "email_verified": profile.email_verified,
        })


# ----------------------
# KYC SUBMIT
# ----------------------
class KYCSubmitView(generics.CreateAPIView):

    serializer_class = KYCSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):

        if KYC.objects.filter(user=self.request.user).exists():
            raise ValidationError({"error": "KYC already submitted"})

        serializer.save(user=self.request.user)

# ----------------------
# KYC STATUS
# ----------------------
class KYCStatusView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        try:
            kyc = request.user.kyc
            serializer = KYCStatusSerializer(kyc)
            return Response(serializer.data)

        except KYC.DoesNotExist:
            return Response({"status": "not_submitted"})
# ----------------------
# PROPERTY CREATE
# ----------------------
class PropertyCreateView(generics.CreateAPIView):
    serializer_class = PropertyCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.profile.user_type != "owner":
            raise ValidationError({"error": "Only landlords can add property"})

        try:
            if user.kyc.status != "approved":
                raise ValidationError({"error": "KYC must be approved to add property"})
        except KYC.DoesNotExist:
            raise ValidationError({"error": "KYC not submitted"})

        serializer.save(owner=user)