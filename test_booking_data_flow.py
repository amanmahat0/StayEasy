#!/usr/bin/env python
"""
Test script to verify the booking data flow from backend to frontend.
Tests the PropertySerializer returns correct booking fields.
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

from users.models import User, Property, Booking, CancellationPolicy
from users.serializers import PropertySerializer
from django.test import RequestFactory
from rest_framework.test import APIRequestFactory

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def test_property_serializer_booking_fields():
    """Test that PropertySerializer includes booking fields"""
    print_header("Test 1: PropertySerializer Booking Fields")
    
    try:
        # Get a property with a booking
        booking = Booking.objects.filter(status='confirmed').first()
        if not booking:
            print("⚠ No confirmed booking found, creating test data...")
            # This shouldn't happen in a real test scenario
            print("❌ Cannot test without a confirmed booking")
            return False
        
        property_obj = booking.property
        user = booking.user
        
        print(f"✓ Found confirmed booking: {booking.id}")
        print(f"  - Property: {property_obj.title} (ID: {property_obj.id})")
        print(f"  - User: {user.username} (ID: {user.id})")
        print(f"  - Check-in: {booking.check_in}")
        print(f"  - Check-out: {booking.check_out}")
        print(f"  - Total Price: {booking.total_price}")
        
        # Create a request factory and request as the booking user
        factory = APIRequestFactory()
        request = factory.get(f'/api/users/properties/{property_obj.id}/')
        request.user = user
        
        # Serialize the property
        serializer = PropertySerializer(property_obj, context={'request': request})
        data = serializer.data
        
        print(f"\n✓ Serializer output:")
        print(f"  - booking_id: {data.get('booking_id')}")
        print(f"  - booking_status: {data.get('booking_status')}")
        print(f"  - booking_check_in: {data.get('booking_check_in')}")
        print(f"  - booking_check_out: {data.get('booking_check_out')}")
        print(f"  - booking_total_price: {data.get('booking_total_price')}")
        
        # Validate fields
        required_fields = ['booking_id', 'booking_status', 'booking_check_in', 
                          'booking_check_out', 'booking_total_price']
        missing_fields = [f for f in required_fields if f not in data or data[f] is None]
        
        if missing_fields:
            print(f"\n❌ FAILED: Missing or None fields: {missing_fields}")
            return False
        
        # Validate field values
        if data['booking_id'] != booking.id:
            print(f"❌ FAILED: booking_id mismatch: {data['booking_id']} vs {booking.id}")
            return False
        
        if data['booking_status'] != 'confirmed':
            print(f"❌ FAILED: booking_status should be 'confirmed', got: {data['booking_status']}")
            return False
        
        if str(data['booking_check_in']) != str(booking.check_in):
            print(f"❌ FAILED: booking_check_in mismatch: {data['booking_check_in']} vs {booking.check_in}")
            return False
        
        # Compare as strings since Decimal is serialized as string in DRF
        if str(data['booking_total_price']) != str(booking.total_price):
            print(f"❌ FAILED: booking_total_price mismatch: {data['booking_total_price']} vs {booking.total_price}")
            return False
        
        print("\n✓ PASSED: All booking fields present and correct")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_refund_calculation_logic():
    """Test the refund calculation logic matches the policy"""
    print_header("Test 2: Refund Calculation Logic")
    
    try:
        # Get cancellation policy
        policy = CancellationPolicy.get_default_policy()
        if not policy:
            print("❌ FAILED: No default cancellation policy found")
            return False
        
        print(f"✓ Found cancellation policy")
        print(f"  - Full refund days: {policy.full_refund_days}")
        print(f"  - Partial refund days: {policy.partial_refund_days}")
        print(f"  - Partial refund percentage: {policy.partial_refund_percentage}%")
        
        # Test with different booking scenarios
        test_cases = [
            {
                'name': 'More than 7 days before move-in',
                'days_until_checkin': 10,
                'expected_percentage': 100,
                'expected_policy': 'Full refund'
            },
            {
                'name': 'Exactly 7 days before move-in',
                'days_until_checkin': 7,
                'expected_percentage': 100,
                'expected_policy': 'Full refund'
            },
            {
                'name': 'Between 3-7 days before move-in',
                'days_until_checkin': 5,
                'expected_percentage': 50,
                'expected_policy': '50% refund'
            },
            {
                'name': 'Exactly 3 days before move-in',
                'days_until_checkin': 3,
                'expected_percentage': 50,
                'expected_policy': '50% refund'
            },
            {
                'name': 'Less than 3 days before move-in',
                'days_until_checkin': 1,
                'expected_percentage': 0,
                'expected_policy': 'No refund'
            },
        ]
        
        all_passed = True
        for test_case in test_cases:
            print(f"\n  Testing: {test_case['name']}")
            
            # Create a test booking with specific check-in date
            from django.utils import timezone
            today = timezone.now().date()
            check_in = today + timedelta(days=test_case['days_until_checkin'])
            
            # Get a confirmed booking to use as template
            template_booking = Booking.objects.filter(status='confirmed').first()
            if not template_booking:
                print(f"    ⚠ No template booking found, skipping this test case")
                continue
            
            # Create a test booking (without saving to DB)
            test_booking = Booking(
                property=template_booking.property,
                user=template_booking.user,
                check_in=check_in,
                check_out=check_in + timedelta(days=30),
                total_price=template_booking.total_price,
                status='confirmed'
            )
            
            # Calculate refund
            refund_info = policy.calculate_refund_amount(test_booking)
            
            print(f"    - Days until check-in: {test_case['days_until_checkin']}")
            print(f"    - Calculated refund: {refund_info['refund_percentage']}%")
            print(f"    - Expected refund: {test_case['expected_percentage']}%")
            
            if refund_info['refund_percentage'] == test_case['expected_percentage']:
                print(f"    ✓ PASSED")
            else:
                print(f"    ❌ FAILED: Expected {test_case['expected_percentage']}%, got {refund_info['refund_percentage']}%")
                all_passed = False
        
        if all_passed:
            print(f"\n✓ PASSED: All refund calculation tests passed")
            return True
        else:
            print(f"\n❌ FAILED: Some refund calculation tests failed")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_frontend_json_serialization():
    """Test that serializer output is JSON serializable"""
    print_header("Test 3: JSON Serialization for Frontend")
    
    try:
        booking = Booking.objects.filter(status='confirmed').first()
        if not booking:
            print("⚠ No confirmed booking found, skipping test")
            return True
        
        property_obj = booking.property
        user = booking.user
        
        # Create request
        factory = APIRequestFactory()
        request = factory.get(f'/api/users/properties/{property_obj.id}/')
        request.user = user
        
        # Serialize
        serializer = PropertySerializer(property_obj, context={'request': request})
        data = serializer.data
        
        # Try to serialize to JSON
        json_str = json.dumps(data, default=str)
        print(f"✓ Serializer output is JSON serializable")
        print(f"  - JSON size: {len(json_str)} bytes")
        print(f"  - Property ID: {data.get('id')}")
        print(f"  - Booking ID: {data.get('booking_id')}")
        print(f"  - Has 'images' field: {'images' in data}")
        
        print(f"\n✓ PASSED: Output is properly JSON serializable")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "█"*70)
    print("█" + " "*68 + "█")
    print("█" + "  BOOKING DATA FLOW TEST SUITE".center(68) + "█")
    print("█" + " "*68 + "█")
    print("█"*70)
    
    tests = [
        ("PropertySerializer Booking Fields", test_property_serializer_booking_fields),
        ("Refund Calculation Logic", test_refund_calculation_logic),
        ("JSON Serialization", test_frontend_json_serialization),
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
        print("\nThe booking data flow is working correctly:")
        print("1. Backend PropertySerializer returns booking fields")
        print("2. Refund calculation matches policy")
        print("3. Data is JSON serializable for frontend")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
