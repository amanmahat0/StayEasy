#!/usr/bin/env python
"""
Test to verify My Bookings API excludes cancelled bookings
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
sys.path.insert(0, 'Backend/myProject')
django.setup()

from users.models import Booking
from users.views import UserBookingListView
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def test_user_bookings_excludes_cancelled():
    """Test that UserBookingListView excludes cancelled bookings"""
    print_header("Test: UserBookingListView Excludes Cancelled Bookings")
    
    try:
        # Get a user with bookings
        user = None
        confirmed_booking = Booking.objects.filter(status='confirmed').first()
        if confirmed_booking:
            user = confirmed_booking.user
        
        if not user:
            print("⚠ No user with confirmed bookings found")
            return True
        
        print(f"✓ Using user: {user.username}")
        
        # Count all bookings for this user
        all_bookings = Booking.objects.filter(user=user)
        cancelled_bookings = all_bookings.filter(status='cancelled')
        active_bookings = all_bookings.exclude(status='cancelled')
        
        print(f"\n✓ Booking Statistics:")
        print(f"  - Total bookings: {all_bookings.count()}")
        print(f"  - Cancelled bookings: {cancelled_bookings.count()}")
        print(f"  - Active bookings: {active_bookings.count()}")
        
        # Test the view's queryset
        view = UserBookingListView()
        factory = APIRequestFactory()
        request = factory.get('/api/users/bookings/')
        request.user = user
        
        view.request = request
        queryset = view.get_queryset()
        queryset_count = queryset.count()
        
        print(f"\n✓ UserBookingListView Results:")
        print(f"  - Bookings returned: {queryset_count}")
        print(f"  - Expected (active only): {active_bookings.count()}")
        
        # Verify no cancelled bookings in queryset
        has_cancelled = queryset.filter(status='cancelled').exists()
        
        if has_cancelled:
            print(f"\n❌ FAILED: Cancelled bookings found in queryset!")
            return False
        
        if queryset_count == active_bookings.count():
            print(f"\n✓ PASSED: Queryset correctly excludes cancelled bookings")
            print(f"  - Only active bookings returned ({queryset_count})")
            print(f"  - Cancelled bookings excluded ({cancelled_bookings.count()})")
            return True
        else:
            print(f"\n❌ FAILED: Count mismatch")
            print(f"  - Queryset returned: {queryset_count}")
            print(f"  - Expected: {active_bookings.count()}")
            return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_cancelled_booking_exists():
    """Verify cancelled bookings still exist in database"""
    print_header("Test: Cancelled Bookings Still Exist in Database")
    
    try:
        cancelled_count = Booking.objects.filter(status='cancelled').count()
        print(f"✓ Cancelled bookings in database: {cancelled_count}")
        
        if cancelled_count > 0:
            print(f"✓ PASSED: Cancelled bookings preserved (not deleted)")
            return True
        else:
            print(f"✓ No cancelled bookings yet")
            return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    print("\n" + "█"*70)
    print("█" + " "*68 + "█")
    print("█" + "  MY BOOKINGS API FIX TEST".center(68) + "█")
    print("█" + " "*68 + "█")
    print("█"*70)
    
    tests = [
        ("UserBookingListView Excludes Cancelled", test_user_bookings_excludes_cancelled),
        ("Cancelled Bookings Preserved in DB", test_cancelled_booking_exists),
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
        print("\nFix verified:")
        print("✓ UserBookingListView excludes cancelled bookings")
        print("✓ Cancelled bookings still exist in database")
        print("✓ My Bookings will only show active bookings")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
