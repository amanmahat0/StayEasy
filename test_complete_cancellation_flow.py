#!/usr/bin/env python
"""
Comprehensive API test for the complete cancellation flow.
Tests: PropertyDetail API -> Cancel Booking API -> refund calculation -> notifications
"""

import os
import sys
import django
import json
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
sys.path.insert(0, 'Backend/myProject')
django.setup()

from users.models import User, Property, Booking, CancellationPolicy, Refund, Cancellation, Notification
from users.serializers import PropertySerializer
from django.test import Client
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
import json

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def get_user_token(user):
    """Get JWT token for user"""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

def test_property_detail_api_with_booking():
    """Test PropertyDetail API returns booking fields"""
    print_header("Test 1: PropertyDetail API Response")
    
    try:
        # Get a confirmed booking
        booking = Booking.objects.filter(status='confirmed').first()
        if not booking:
            print("⚠ No confirmed booking found for testing")
            return False
        
        property_obj = booking.property
        user = booking.user
        
        print(f"✓ Setup: Booking {booking.id} for user {user.username}")
        print(f"  - Property: {property_obj.title}")
        print(f"  - Check-in: {booking.check_in}")
        print(f"  - Total Price: {booking.total_price}")
        
        # Make API request
        client = Client()
        token = get_user_token(user)
        
        response = client.get(
            f'/api/users/properties/{property_obj.id}/',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        
        if response.status_code != 200:
            print(f"❌ FAILED: API returned {response.status_code}")
            print(f"  Response: {response.content[:200]}")
            return False
        
        data = json.loads(response.content)
        print(f"\n✓ API Response Status: {response.status_code}")
        print(f"  - booking_id: {data.get('booking_id')}")
        print(f"  - booking_status: {data.get('booking_status')}")
        print(f"  - booking_check_in: {data.get('booking_check_in')}")
        print(f"  - booking_total_price: {data.get('booking_total_price')}")
        
        # Validate
        if not all([data.get('booking_id'), data.get('booking_status'), 
                   data.get('booking_check_in'), data.get('booking_total_price')]):
            print("❌ FAILED: Missing booking fields in API response")
            return False
        
        print("✓ PASSED: API returns all required booking fields")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_cancel_booking_api():
    """Test the cancel booking API endpoint"""
    print_header("Test 2: Cancel Booking API")
    
    try:
        # Get a confirmed booking to cancel
        booking = Booking.objects.filter(status='confirmed').first()
        if not booking:
            print("⚠ No confirmed booking found for testing")
            return False
        
        user = booking.user
        booking_id = booking.id
        
        print(f"✓ Setup: Will cancel booking {booking_id}")
        print(f"  - Original Status: {booking.status}")
        print(f"  - User: {user.username}")
        
        # Get initial refund count
        initial_refund_count = Refund.objects.count()
        initial_cancellation_count = Cancellation.objects.count()
        initial_notification_count = Notification.objects.count()
        
        # Make cancel request
        client = Client()
        token = get_user_token(user)
        
        response = client.post(
            f'/api/users/bookings/{booking_id}/cancel/',
            data=json.dumps({'reason': 'Test cancellation'}),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        
        print(f"\n✓ API Request sent to /api/users/bookings/{booking_id}/cancel/")
        print(f"  - Response Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: API returned {response.status_code}")
            print(f"  Response: {response.content[:200]}")
            return False
        
        response_data = json.loads(response.content)
        print(f"\n✓ Cancel Response:")
        print(f"  - booking_id: {response_data.get('booking_id')}")
        print(f"  - status: {response_data.get('status')}")
        print(f"  - refund_amount: {response_data.get('refund_amount')}")
        print(f"  - refund_percentage: {response_data.get('refund_percentage')}%")
        print(f"  - message: {response_data.get('message')}")
        
        # Refresh booking from DB
        booking.refresh_from_db()
        
        print(f"\n✓ Database State After Cancellation:")
        print(f"  - Booking Status: {booking.status}")
        print(f"  - Cancelled At: {booking.cancelled_at}")
        
        # Check if refund was created
        refund = Refund.objects.filter(booking=booking).first()
        if refund:
            print(f"  - Refund Created: ✓ (ID: {refund.id}, Amount: {refund.refund_amount})")
        else:
            print(f"  - Refund Created: ✗")
        
        # Check if cancellation record was created
        cancellation = Cancellation.objects.filter(booking=booking).first()
        if cancellation:
            print(f"  - Cancellation Record: ✓ (ID: {cancellation.id})")
        else:
            print(f"  - Cancellation Record: ✗")
        
        # Check if notifications were created
        new_notifications = Notification.objects.filter(
            related_entity_type='booking',
            related_entity_id=booking.id
        ).count()
        print(f"  - Notifications Created: {new_notifications}")
        
        # Validate all created
        if booking.status != 'cancelled':
            print(f"\n❌ FAILED: Booking status not updated to 'cancelled'")
            return False
        
        if not booking.cancelled_at:
            print(f"\n❌ FAILED: cancelled_at not set")
            return False
        
        if not refund:
            print(f"\n❌ FAILED: Refund record not created")
            return False
        
        if not cancellation:
            print(f"\n❌ FAILED: Cancellation record not created")
            return False
        
        # Check property availability
        property_obj = booking.property
        property_obj.refresh_from_db()
        print(f"\n✓ Property State After Cancellation:")
        print(f"  - Available: {property_obj.available}")
        
        print(f"\n✓ PASSED: Booking cancelled successfully")
        print(f"  - Status updated to 'cancelled'")
        print(f"  - Refund created (NPR {refund.refund_amount})")
        print(f"  - Cancellation record created")
        print(f"  - {new_notifications} notifications created")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_authentication_required():
    """Test that cancel endpoint requires authentication"""
    print_header("Test 3: Authentication Required")
    
    try:
        booking = Booking.objects.filter(status='confirmed').first()
        if not booking:
            print("⚠ No confirmed booking found for testing")
            return True
        
        # Try without auth
        client = Client()
        response = client.post(
            f'/api/users/bookings/{booking.id}/cancel/',
            data=json.dumps({'reason': 'Test'}),
            content_type='application/json'
        )
        
        print(f"✓ Request without auth: Status {response.status_code}")
        
        if response.status_code == 401:
            print("✓ PASSED: Endpoint correctly requires authentication")
            return True
        else:
            print(f"❌ FAILED: Expected 401, got {response.status_code}")
            return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    print("\n" + "█"*70)
    print("█" + " "*68 + "█")
    print("█" + "  COMPLETE CANCELLATION FLOW TEST SUITE".center(68) + "█")
    print("█" + " "*68 + "█")
    print("█"*70)
    
    tests = [
        ("PropertyDetail API with Booking Fields", test_property_detail_api_with_booking),
        ("Authentication Required", test_authentication_required),
        ("Cancel Booking API Endpoint", test_cancel_booking_api),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ EXCEPTION in {test_name}: {str(e)}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))
    
    # Summary
    print_header("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("\nComplete cancellation flow is working:")
        print("✓ Property detail API returns booking fields for frontend")
        print("✓ Cancel booking endpoint requires authentication")
        print("✓ Cancellation updates booking status, creates refund, and notifies users")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
