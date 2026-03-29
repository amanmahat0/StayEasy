from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Profile, KYC, Property, PropertyImage, Booking
from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    KYCSerializer,
    KYCStatusSerializer,
    PropertyCreateSerializer,
    KYCListSerializer,
    KYCUpdateStatusSerializer,
    PropertySerializer,
    BookingSerializer,
    BookingDetailSerializer,
    BookingCreateSerializer,
)
from .permissions import IsAdminUser
from rest_framework.views import APIView
from django.db import transaction

# ----------------------
# REGISTER USER
# ----------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()

        # ✅ Ensure profile exists
        profile, _ = Profile.objects.get_or_create(user=user)
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

        # ✅ Ensure profile exists
        profile, _ = Profile.objects.get_or_create(user=user)

        if default_token_generator.check_token(user, token):
            profile.email_verified = True
            profile.save()
            return Response({"message": "Email verified successfully"})
        return Response({"error": "Invalid or expired token"}, status=400)


# ----------------------
# LOGIN WITH JWT
# ----------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email_or_username = request.data.get("email")
        password = request.data.get("password")

        # Get user by email or username
        user = User.objects.filter(email=email_or_username).first() or \
               User.objects.filter(username=email_or_username).first()

        if not user:
            return Response({"error": "Invalid email or password"}, status=401)

        # ✅ Ensure profile exists
        profile, _ = Profile.objects.get_or_create(user=user)

        # Admin bypasses email verification
        if not user.is_superuser and not profile.email_verified:
            return Response({"error": "Email not verified"}, status=403)

        # Attach username for JWT authenticate
        request.data["username"] = user.username
        user_auth = authenticate(username=user.username, password=password)
        if user_auth is None:
            return Response({"error": "Invalid email or password"}, status=401)

        # Get token response
        response = super().post(request, *args, **kwargs)

        # Add role info
        response.data["role"] = "admin" if user.is_superuser or profile.role == "admin" else profile.user_type

        return response


# ----------------------
# PROFILE
# ----------------------
class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # ✅ Ensure profile exists
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "role": "admin" if request.user.is_superuser or profile.role == "admin" else profile.role,
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


# ----------------------
# ADMIN KYC MANAGEMENT
# ----------------------
class AdminKYCListView(generics.ListAPIView):
    """Admin: View all KYC requests with filtering by status"""
    queryset = KYC.objects.all().order_by('-submitted_at')
    serializer_class = KYCListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        """Filter by status if provided in query params"""
        queryset = KYC.objects.all().order_by('-submitted_at')
        status_filter = self.request.query_params.get('status')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class AdminKYCDetailView(generics.RetrieveAPIView):
    """Admin: Get details of a specific KYC request"""
    queryset = KYC.objects.all()
    serializer_class = KYCListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    lookup_field = 'id'


class AdminKYCUpdateStatusView(generics.UpdateAPIView):
    """Admin: Update KYC status (approve/reject)"""
    queryset = KYC.objects.all()
    serializer_class = KYCUpdateStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    lookup_field = 'id'
    http_method_names = ['patch', 'put']

    @transaction.atomic
    def perform_update(self, serializer):
        """Update KYC status and record which admin verified it"""
        kyc = self.get_object()
        
        # Update status
        serializer.save(
            verified_by=self.request.user,
            verified_at=timezone.now()
        )
        
        # Send notification email to user based on status
        new_status = serializer.validated_data.get('status')
        
        if new_status == 'approved':
            send_mail(
                "KYC Approved ✓",
                f"Congratulations {kyc.user.first_name}!\n\nYour KYC has been approved. You can now add properties.",
                "noreply@stayeasy.com",
                [kyc.user.email],
                fail_silently=True
            )
        elif new_status == 'rejected':
            send_mail(
                "KYC Rejected",
                f"Dear {kyc.user.first_name},\n\nYour KYC submission was rejected. Please verify your documents and resubmit.",
                "noreply@stayeasy.com",
                [kyc.user.email],
                fail_silently=True
            )
    
    def patch(self, request, *args, **kwargs):
        """Allow partial updates (status only)"""
        return super().patch(request, *args, **kwargs)


class AdminKYCStatsView(APIView):
    """Admin: Get KYC statistics (pending, approved, rejected counts)"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        total = KYC.objects.count()
        pending = KYC.objects.filter(status='pending').count()
        approved = KYC.objects.filter(status='approved').count()
        rejected = KYC.objects.filter(status='rejected').count()

        return Response({
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
        })


# ----------------------
# PROPERTY LIST - FOR ALL USERS
# ----------------------
class PropertyListView(generics.ListAPIView):
    """Get all available properties (public)"""
    queryset = Property.objects.filter(available=True).order_by('-created_at')
    serializer_class = PropertySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Filter by property_type if provided"""
        queryset = Property.objects.filter(available=True).order_by('-created_at')
        property_type = self.request.query_params.get('type')
        
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        
        return queryset


# ----------------------
# PROPERTY DETAIL
# ----------------------
class PropertyDetailView(generics.RetrieveAPIView):
    """Get single property details"""
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


# ----------------------
# ADMIN - VIEW ALL PROPERTIES
# ----------------------
class AdminPropertyListView(generics.ListAPIView):
    """Admin: View all properties for monitoring"""
    queryset = Property.objects.all().order_by('-created_at')
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        """Filter by owner, property_type, or available status"""
        queryset = Property.objects.all().order_by('-created_at')
        
        property_type = self.request.query_params.get('type')
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        
        available_only = self.request.query_params.get('available')
        if available_only == 'true':
            queryset = queryset.filter(available=True)
        
        return queryset


# ----------------------
# LANDLORD - GET THEIR PROPERTIES
# ----------------------
class LandlordPropertyListView(generics.ListAPIView):
    """Landlord: View their own properties"""
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get only properties owned by the current user"""
        return Property.objects.filter(owner=self.request.user).order_by('-created_at')


# ----------------------
# LANDLORD - DASHBOARD STATS
# ----------------------
class LandlordDashboardView(APIView):
    """Landlord: Get dashboard stats (properties, bookings, KYC status, revenue)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get KYC status
        kyc_status = "not_submitted"
        try:
            kyc = user.kyc
            kyc_status = kyc.status
        except KYC.DoesNotExist:
            pass

        # Get property stats
        properties = Property.objects.filter(owner=user)
        total_properties = properties.count()
        available_properties = properties.filter(available=True).count()

        return Response({
            "kyc_status": kyc_status,
            "total_properties": total_properties,
            "available_properties": available_properties,
            "can_add_property": kyc_status == "approved"
        })


# ----------------------
# BOOKING - USER CREATE
# ----------------------
class BookingCreateView(generics.CreateAPIView):
    """User: Create a new booking"""
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # User can only book if they have approved KYC
        user = self.request.user
        try:
            kyc = user.kyc
            if kyc.status != "approved":
                raise ValidationError({"error": "Your KYC must be approved to make bookings"})
        except KYC.DoesNotExist:
            raise ValidationError({"error": "Please submit and verify your KYC first"})

        serializer.save(user=user, status='pending')


# ----------------------
# BOOKING - USER LIST
# ----------------------
class UserBookingListView(generics.ListAPIView):
    """User: Get their own bookings"""
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get only bookings made by the current user"""
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')


# ----------------------
# BOOKING - LANDLORD LIST
# ----------------------
class LandlordBookingListView(generics.ListAPIView):
    """Landlord: Get bookings for their properties"""
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get bookings for all properties owned by the current user"""
        user = self.request.user
        properties = Property.objects.filter(owner=user)
        return Booking.objects.filter(property__in=properties).order_by('-created_at')


# ----------------------
# BOOKING - DETAIL
# ----------------------
class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get/update/delete a booking"""
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        """Only allow users to see their own bookings"""
        user = self.request.user
        # Check if user is the one who made the booking
        return Booking.objects.filter(user=user)

    def perform_update(self, serializer):
        """Only allow cancellation by user"""
        booking = self.get_object()
        request_user = self.request.user
        
        if booking.user != request_user:
            raise ValidationError({"error": "You can only modify your own bookings"})
        
        serializer.save()

    def perform_destroy(self, instance):
        """Allow users to cancel their bookings"""
        user = self.request.user
        if instance.user != user:
            raise ValidationError({"error": "You can only cancel your own bookings"})
        instance.status = 'cancelled'
        instance.save()