#!/usr/bin/env python
"""
Comprehensive test script for booking cancellation and refund policy system.
Tests the complete flow from creating a booking to cancelling it.
"""

import os
import sys
import django
import requests
import json
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django environment
sys.path.insert(0, r'e:\StayEasy\Backend\myProject')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import (
    Property, PropertyImage, Booking, CancellationPolicy, 
    Payment, Refund, Cancellation, Notification, Profile
)

# API Configuration
API_BASE = "http://127.0.0.1:8000/api"
USERS_API = f"{API_BASE}/users"

# Test user credentials
TENANT_USERNAME = "test_tenant_cancel"
TENANT_EMAIL = "tenant_cancel@test.com"
TENANT_PASSWORD = "TestPassword123!"

LANDLORD_USERNAME = "test_landlord_cancel"
LANDLORD_EMAIL = "landlord_cancel@test.com"
LANDLORD_PASSWORD = "LandlordPass123!"

PROPERTY_TITLE = "Test Property for Cancellation"
PROPERTY_PRICE = Decimal("5000.00")  # NPR 5000

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{BLUE}{'='*70}{END}")
    print(f"{BLUE}{title:^70}{END}")
    print(f"{BLUE}{'='*70}{END}\n")

def print_success(msg):
    """Print success message"""
    print(f"{GREEN}✓ {msg}{END}")

def print_error(msg):
    """Print error message"""
    print(f"{RED}✗ {msg}{END}")

def print_info(msg):
    """Print info message"""
    print(f"{BLUE}ℹ {msg}{END}")

def print_data(label, data):
    """Print formatted data"""
    print(f"{YELLOW}{label}:{END}")
    if isinstance(data, dict):
        for key, value in data.items():
            print(f"  {key}: {value}")
    else:
        print(f"  {data}")

# ========================================
# STEP 1: SETUP TEST USERS
# ========================================
def setup_test_users():
    """Create or get test users"""
    print_section("STEP 1: Setting up Test Users")
    
    # Create tenant user
    tenant_user, created = User.objects.get_or_create(
        username=TENANT_USERNAME,
        defaults={
            'email': TENANT_EMAIL,
            'first_name': 'Test',
            'last_name': 'Tenant',
            'is_active': True
        }
    )
    if created:
        tenant_user.set_password(TENANT_PASSWORD)
        tenant_user.save()
        print_success(f"Created tenant user: {TENANT_USERNAME}")
    else:
        print_info(f"Tenant user already exists: {TENANT_USERNAME}")
    
    # Create profile if needed
    Profile.objects.get_or_create(user=tenant_user)
    
    # Create landlord user
    landlord_user, created = User.objects.get_or_create(
        username=LANDLORD_USERNAME,
        defaults={
            'email': LANDLORD_EMAIL,
            'first_name': 'Test',
            'last_name': 'Landlord',
            'is_active': True
        }
    )
    if created:
        landlord_user.set_password(LANDLORD_PASSWORD)
        landlord_user.save()
        print_success(f"Created landlord user: {LANDLORD_USERNAME}")
    else:
        print_info(f"Landlord user already exists: {LANDLORD_USERNAME}")
    
    # Create profile if needed
    Profile.objects.get_or_create(user=landlord_user)
    
    return tenant_user, landlord_user

# ========================================
# STEP 2: GET AUTH TOKENS
# ========================================
def get_auth_token(username, password):
    """Get JWT token for user"""
    response = requests.post(
        f"{USERS_API}/login/",
        json={
            "username": username,
            "password": password
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print_success(f"Got auth token for {username}")
        return token
    else:
        print_error(f"Failed to get token for {username}: {response.text}")
        return None

# ========================================
# STEP 3: CREATE TEST PROPERTY
# ========================================
def create_test_property(landlord_user):
    """Create a test property"""
    print_section("STEP 3: Creating Test Property")
    
    # Delete old test property if exists
    Property.objects.filter(title=PROPERTY_TITLE).delete()
    
    property_obj = Property.objects.create(
        owner=landlord_user,
        title=PROPERTY_TITLE,
        description="Test property for cancellation testing",
        property_type="Apartment",
        address="123 Test Street",
        city="Kathmandu",
        state="Kathmandu",
        country="Nepal",
        postal_code="44600",
        price=PROPERTY_PRICE,
        available=True,
        bedrooms=2,
        bathrooms=1,
        max_guests=4,
        amenities="WiFi, Kitchen, Bathroom"
    )
    
    print_success(f"Created property: {property_obj.title} (ID: {property_obj.id})")
    print_data("Property Details", {
        'ID': property_obj.id,
        'Title': property_obj.title,
        'Price': f"NPR {property_obj.price}",
        'Available': property_obj.available
    })
    
    return property_obj

# ========================================
# STEP 4: CREATE CONFIRMED BOOKING
# ========================================
def create_confirmed_booking(tenant_user, property_obj):
    """Create a confirmed booking"""
    print_section("STEP 4: Creating Confirmed Booking")
    
    # Calculate dates
    today = datetime.now().date()
    check_in = today + timedelta(days=5)  # 5 days from now
    check_out = check_in + timedelta(days=3)  # 3 day stay
    
    # Calculate total price
    nights = (check_out - check_in).days
    total_price = property_obj.price * nights
    
    # Create booking
    booking = Booking.objects.create(
        user=tenant_user,
        property=property_obj,
        check_in=check_in,
        check_out=check_out,
        total_price=total_price,
        status='confirmed',
        payment_method='esewa',
        payment_status='completed',
        esewa_transaction_id='test_txn_12345',
        esewa_ref_id='test_ref_12345'
    )
    
    print_success(f"Created booking: {booking.id}")
    print_data("Booking Details", {
        'ID': booking.id,
        'Tenant': tenant_user.username,
        'Property': property_obj.title,
        'Check-in': check_in,
        'Check-out': check_out,
        'Total Price': f"NPR {booking.total_price}",
        'Status': booking.status,
        'Days until check-in': (check_in - today).days
    })
    
    # Create payment record
    payment = Payment.objects.create(
        booking=booking,
        tenant=tenant_user,
        amount=booking.total_price,
        status='completed',
        payment_method='esewa',
        transaction_id='test_txn_12345'
    )
    
    print_success(f"Created payment record: {payment.id}")
    
    return booking

# ========================================
# STEP 5: TEST CANCELLATION POLICY
# ========================================
def test_cancellation_policy(booking):
    """Test the refund calculation"""
    print_section("STEP 5: Testing Cancellation Policy")
    
    policy = CancellationPolicy.get_default_policy()
    print_info(f"Default policy: {policy}")
    
    refund_info = policy.calculate_refund_amount(booking)
    
    print_data("Refund Calculation", {
        'Booking ID': booking.id,
        'Check-in Date': booking.check_in,
        'Days Until Check-in': (booking.check_in - datetime.now().date()).days,
        'Original Amount': f"NPR {booking.total_price}",
        'Refund Amount': f"NPR {refund_info['refund_amount']}",
        'Refund Percentage': f"{refund_info['refund_percentage']}%",
        'Policy Applied': refund_info['policy_applied']
    })
    
    # Verify policy is correct
    days_until = (booking.check_in - datetime.now().date()).days
    
    if days_until >= 7:
        expected_percentage = 100
        policy_name = "Full Refund (7+ days)"
    elif days_until >= 3:
        expected_percentage = 50
        policy_name = "Partial Refund (3-6 days)"
    else:
        expected_percentage = 0
        policy_name = "No Refund (<3 days)"
    
    if refund_info['refund_percentage'] == expected_percentage:
        print_success(f"Refund policy correct: {policy_name} ({expected_percentage}%)")
    else:
        print_error(f"Refund policy mismatch! Expected {expected_percentage}%, got {refund_info['refund_percentage']}%")
    
    return refund_info

# ========================================
# STEP 6: TEST CANCELLATION API
# ========================================
def test_cancellation_api(booking, tenant_user):
    """Test the cancellation API endpoint"""
    print_section("STEP 6: Testing Cancellation API")
    
    # Get token
    token = get_auth_token(TENANT_USERNAME, TENANT_PASSWORD)
    if not token:
        print_error("Failed to get authentication token")
        return False
    
    # Call cancellation API
    print_info(f"Calling: POST /api/users/bookings/{booking.id}/cancel/")
    
    response = requests.post(
        f"{USERS_API}/bookings/{booking.id}/cancel/",
        json={"reason": "Test cancellation"},
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    print_info(f"Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print_success("Cancellation successful!")
        print_data("API Response", {
            'booking_id': data.get('booking_id'),
            'status': data.get('status'),
            'refund_amount': data.get('refund_amount'),
            'refund_percentage': data.get('refund_percentage'),
            'message': data.get('message')
        })
        return True
    else:
        print_error(f"Cancellation failed!")
        print_data("Error Response", response.json())
        return False

# ========================================
# STEP 7: VERIFY DATABASE CHANGES
# ========================================
def verify_database_changes(booking, property_obj, landlord_user):
    """Verify that all database changes were made correctly"""
    print_section("STEP 7: Verifying Database Changes")
    
    # Refresh booking from database
    booking.refresh_from_db()
    
    # Check 1: Booking status
    if booking.status == 'cancelled':
        print_success(f"✓ Booking status updated to: {booking.status}")
    else:
        print_error(f"✗ Booking status not updated! Current status: {booking.status}")
    
    # Check 2: Cancellation record
    cancellation = Cancellation.objects.filter(booking=booking).first()
    if cancellation:
        print_success(f"✓ Cancellation record created (ID: {cancellation.id})")
        print_data("Cancellation Details", {
            'ID': cancellation.id,
            'Cancelled By': cancellation.cancelled_by.username,
            'Reason': cancellation.reason,
            'Cancelled At': cancellation.cancelled_at
        })
    else:
        print_error("✗ Cancellation record not found!")
    
    # Check 3: Refund record
    refund = Refund.objects.filter(booking=booking).first()
    if refund:
        print_success(f"✓ Refund record created (ID: {refund.id})")
        print_data("Refund Details", {
            'ID': refund.id,
            'Amount': f"NPR {refund.refund_amount}",
            'Percentage': f"{refund.refund_percentage}%",
            'Status': refund.status,
            'Policy Applied': refund.policy_applied
        })
    else:
        print_error("✗ Refund record not found!")
    
    # Check 4: Property availability
    property_obj.refresh_from_db()
    if property_obj.available:
        print_success(f"✓ Property marked as available: {property_obj.available}")
    else:
        print_error(f"✗ Property not marked as available! Current value: {property_obj.available}")
    
    # Check 5: Notifications
    notifications = Notification.objects.filter(
        related_entity_type='booking',
        related_entity_id=booking.id
    )
    
    if notifications.count() >= 2:
        print_success(f"✓ Notifications created: {notifications.count()}")
        for notif in notifications:
            print_data(f"  Notification to {notif.recipient.username}", {
                'Type': notif.notification_type,
                'Title': notif.title,
                'Read': notif.is_read
            })
    else:
        print_error(f"✗ Expected 2+ notifications, found: {notifications.count()}")

# ========================================
# STEP 8: TEST PAYMENT STATUS UPDATE
# ========================================
def verify_payment_status(booking):
    """Verify payment status was updated correctly"""
    print_section("STEP 8: Verifying Payment Status")
    
    payment = Payment.objects.filter(booking=booking).first()
    
    if payment:
        print_data("Payment Status", {
            'ID': payment.id,
            'Amount': f"NPR {payment.amount}",
            'Status': payment.status,
            'Transaction ID': payment.transaction_id
        })
        
        # If full refund, payment should be marked as refunded
        refund = Refund.objects.filter(booking=booking).first()
        if refund and refund.refund_percentage == 100:
            if payment.status == 'refunded':
                print_success("✓ Payment marked as refunded for full refund")
            else:
                print_error(f"✗ Payment status not updated! Expected 'refunded', got '{payment.status}'")
    else:
        print_error("✗ Payment record not found!")

# ========================================
# MAIN TEST FLOW
# ========================================
def main():
    """Run all tests"""
    print_section("BOOKING CANCELLATION & REFUND SYSTEM TEST")
    
    try:
        # Step 1: Setup users
        tenant_user, landlord_user = setup_test_users()
        
        # Step 3: Create property
        property_obj = create_test_property(landlord_user)
        
        # Step 4: Create booking
        booking = create_confirmed_booking(tenant_user, property_obj)
        
        # Step 5: Test policy
        refund_info = test_cancellation_policy(booking)
        
        # Step 6: Test API
        success = test_cancellation_api(booking, tenant_user)
        
        if success:
            # Step 7: Verify DB changes
            verify_database_changes(booking, property_obj, landlord_user)
            
            # Step 8: Verify payment
            verify_payment_status(booking)
            
            print_section("TEST COMPLETE - ALL CHECKS PASSED ✓")
        else:
            print_section("TEST FAILED - API ERROR")
    
    except Exception as e:
        print_section("TEST FAILED - EXCEPTION")
        print_error(f"Exception: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
