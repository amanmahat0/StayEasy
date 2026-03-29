from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    VerifyEmailView,
    CustomTokenObtainPairView,
    ProfileView,
    KYCSubmitView,
    KYCStatusView,
    PropertyCreateView,
    PropertyListView,
    PropertyDetailView,
    AdminKYCListView,
    AdminKYCDetailView,
    AdminKYCUpdateStatusView,
    AdminKYCStatsView,
    AdminPropertyListView,
    LandlordPropertyListView,
    LandlordDashboardView,
    BookingCreateView,
    UserBookingListView,
    LandlordBookingListView,
    BookingDetailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('verify-email/', VerifyEmailView.as_view()),
    path('login/', CustomTokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),

    path('profile/', ProfileView.as_view()),
    path('kyc/submit/', KYCSubmitView.as_view()),
    path('kyc/status/', KYCStatusView.as_view()),
    path('property/add/', PropertyCreateView.as_view()),
    
    # Property Endpoints
    path('properties/', PropertyListView.as_view(), name='property-list'),
    path('properties/<int:id>/', PropertyDetailView.as_view(), name='property-detail'),
    path('landlord/properties/', LandlordPropertyListView.as_view(), name='landlord-property-list'),
    path('landlord/dashboard/', LandlordDashboardView.as_view(), name='landlord-dashboard'),
    
    # Booking Endpoints
    path('bookings/create/', BookingCreateView.as_view(), name='booking-create'),
    path('bookings/', UserBookingListView.as_view(), name='user-booking-list'),
    path('landlord/bookings/', LandlordBookingListView.as_view(), name='landlord-booking-list'),
    path('bookings/<int:id>/', BookingDetailView.as_view(), name='booking-detail'),
    
    # Admin KYC Management Endpoints
    path('admin/kyc/', AdminKYCListView.as_view(), name='admin-kyc-list'),
    path('admin/kyc/<int:id>/', AdminKYCDetailView.as_view(), name='admin-kyc-detail'),
    path('admin/kyc/<int:id>/update-status/', AdminKYCUpdateStatusView.as_view(), name='admin-kyc-update-status'),
    path('admin/kyc/stats/', AdminKYCStatsView.as_view(), name='admin-kyc-stats'),
    
    # Admin Property Management
    path('admin/properties/', AdminPropertyListView.as_view(), name='admin-property-list'),
]