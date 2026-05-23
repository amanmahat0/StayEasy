from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


# ============================================================
# LANDLORD USER MODEL
# Separate authentication system for property owners
# ============================================================
class LandlordUser(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    
    # Business info
    business_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.email})"


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
        ('land', 'Land'),
    )

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('booked', 'Booked'),
        ('archived', 'Archived'),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="properties")
    landlord = models.ForeignKey(LandlordUser, on_delete=models.CASCADE, related_name="properties", null=True, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField()

    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)

    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    available = models.BooleanField(default=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')

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


# ============================================================
# BOOKING MODEL
# Stores property bookings/reservations
# ============================================================
class Booking(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('esewa', 'eSewa'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    PAYMENT_TYPE_CHOICES = (
        ('full', 'Full Payment'),
        ('partial', 'Partial Payment'),
    )

    # Linked user (tenant) and property
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="bookings")

    # Booking dates
    check_in = models.DateField()
    check_out = models.DateField()

    # Total price
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    # Booking Status (pending → processing → confirmed → completed)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Payment information
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='esewa')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='full')
    
    # eSewa 2.0 payment tracking
    esewa_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    esewa_ref_id = models.CharField(max_length=255, blank=True, null=True)
    esewa_signature = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)  # Track when booking was cancelled

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.property.title} ({self.status})"


# ============================================================
# FAVORITE MODEL
# Stores user's favorite/wishlist properties
# ============================================================
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'property')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.property.title} (Favorite)"


# ============================================================
# VIEWED PROPERTY MODEL
# Tracks properties viewed by users
# ============================================================
class ViewedProperty(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="viewed_properties")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="viewed_by")
    view_count = models.IntegerField(default=1)
    last_viewed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'property')
        ordering = ['-last_viewed']

    def __str__(self):
        return f"{self.user.username} - {self.property.title} (Viewed {self.view_count} times)"


# ============================================================
# CHAT MODEL
# Stores conversations between users and landlords
# ============================================================
class Chat(models.Model):
    # User (tenant) and Landlord communication
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats_as_user")
    landlord = models.ForeignKey(LandlordUser, on_delete=models.CASCADE, related_name="chats_as_landlord")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="chats", null=True, blank=True)
    
    # Chat metadata
    subject = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'landlord', 'property')
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Chat: {self.user.username} ↔ {self.landlord.email} ({self.property.title if self.property else 'General'})"


# ============================================================
# MESSAGE MODEL
# Stores individual messages in chats
# ============================================================
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages_sent_user", null=True, blank=True)
    sender_landlord = models.ForeignKey(LandlordUser, on_delete=models.CASCADE, related_name="messages_sent_landlord", null=True, blank=True)
    
    content = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    caption = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        sender = self.sender_user.username if self.sender_user else self.sender_landlord.email
        return f"Message in {self.chat.id}: {sender}"