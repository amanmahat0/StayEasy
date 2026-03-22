from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


# ============================================================
# PROFILE MODEL
# Stores extra user info (role, email verification, reset token)
# ============================================================
class Profile(models.Model):

    USER_TYPES = (
        ('tenant', 'Tenant/User'),
        ('owner', 'Owner/Landlord'),
    )

    ROLES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLES, default='user')
    email_verified = models.BooleanField(default=False)

    password_reset_token = models.CharField(max_length=255, blank=True, null=True)
    password_reset_expires = models.DateTimeField(blank=True, null=True)

    def set_reset_token(self, token, minutes=60):
        self.password_reset_token = token
        self.password_reset_expires = timezone.now() + timedelta(minutes=minutes)
        self.save()

    def clear_reset_token(self):
        self.password_reset_token = None
        self.password_reset_expires = None
        self.save()

    def __str__(self):
        return f"{self.user.username} ({self.role})"


# ============================================================
# KYC MODEL
# User identity verification
# ============================================================
class KYC(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    # linked user
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="kyc")

    # user submitted information
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    citizenship_number = models.CharField(max_length=100)

    # uploaded document
    document_image = models.ImageField(upload_to='kyc_documents/')

    # verification status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # submission time
    submitted_at = models.DateTimeField(auto_now_add=True)

    # admin verification info
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_kyc"
    )

    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.status}"


# ============================================================
# PROPERTY MODEL
# Property listed by landlords
# ============================================================
class Property(models.Model):

    PROPERTY_TYPES = (
        ('room', 'Room'),
        ('apartment', 'Apartment'),
        ('house', 'House'),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="properties")

    title = models.CharField(max_length=255)
    description = models.TextField()

    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)

    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ============================================================
# PROPERTY IMAGE MODEL
# Stores multiple images for properties
# ============================================================
class PropertyImage(models.Model):

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")

    image = models.ImageField(upload_to="property_images/")

    def __str__(self):
        return f"Image for {self.property.title}"