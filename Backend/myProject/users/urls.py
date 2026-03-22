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
]