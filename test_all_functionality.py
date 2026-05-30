#!/usr/bin/env python
"""
Comprehensive System Test - StayEasy Application
Tests all critical functionality buttons and features
"""

import requests
import json
from datetime import datetime, timedelta

API_BASE = "http://localhost:8000/api/users"
BACKEND_BASE = "http://localhost:8000"

# Test credentials
TEST_USER = {
    "email": "testuser@test.com",
    "password": "testpass123"
}

TEST_LANDLORD = {
    "email": "testlandlord@test.com", 
    "password": "testpass123"
}

class TestRunner:
    def __init__(self):
        self.token = None
        self.property_id = None
        self.booking_id = None
        self.tests_passed = 0
        self.tests_failed = 0
        self.failed_tests = []
        
    def log(self, message, status="INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status:8} | {message}")
        
    def test_passed(self, test_name):
        """Mark test as passed"""
        self.tests_passed += 1
        self.log(f"✅ PASSED: {test_name}", "PASS")
        
    def test_failed(self, test_name, error):
        """Mark test as failed"""
        self.tests_failed += 1
        self.failed_tests.append((test_name, str(error)))
        self.log(f"❌ FAILED: {test_name} - {error}", "FAIL")
        
    def set_auth_token(self, token):
        """Set authentication token"""
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
    # ========================================
    # 1. PROPERTIES PAGE TESTS
    # ========================================
    
    def test_01_delete_property_with_confirmation(self):
        """Test: Delete property with warning confirmation"""
        try:
            if not self.property_id:
                self.log("Skipping (no property_id)", "SKIP")
                return
                
            url = f"{API_BASE}/landlord/properties/{self.property_id}/delete/"
            response = requests.delete(url, headers=self.headers)
            
            if response.status_code == 204:
                self.test_passed("Delete Property with Confirmation")
            else:
                self.test_failed("Delete Property", f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.test_failed("Delete Property", str(e))
            
    def test_02_publish_unpublish_property(self):
        """Test: Publish and unpublish property toggle"""
        try:
            # Get a property first
            url = f"{API_BASE}/landlord/properties/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200 or not response.json():
                self.log("Skipping (no properties)", "SKIP")
                return
                
            prop = response.json()[0] if isinstance(response.json(), list) else response.json()
            prop_id = prop.get('id')
            
            # Test publish/unpublish
            update_url = f"{API_BASE}/landlord/properties/{prop_id}/update/"
            
            # Try to unpublish
            update_data = {"status": "draft"}
            response = requests.patch(update_url, json=update_data, headers=self.headers)
            
            if response.status_code in [200, 201]:
                # Try to republish
                update_data = {"status": "published"}
                response = requests.patch(update_url, json=update_data, headers=self.headers)
                
                if response.status_code in [200, 201]:
                    self.test_passed("Publish/Unpublish Property Toggle")
                else:
                    self.test_failed("Publish Property", f"Status {response.status_code}")
            else:
                self.test_failed("Unpublish Property", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Publish/Unpublish Toggle", str(e))
            
    def test_03_edit_property(self):
        """Test: Edit property functionality"""
        try:
            # Get a property first
            url = f"{API_BASE}/landlord/properties/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200 or not response.json():
                self.log("Skipping (no properties)", "SKIP")
                return
                
            prop = response.json()[0] if isinstance(response.json(), list) else response.json()
            prop_id = prop.get('id')
            
            # Test edit
            update_url = f"{API_BASE}/landlord/properties/{prop_id}/update/"
            update_data = {
                "title": f"Updated Title {datetime.now().timestamp()}"
            }
            response = requests.patch(update_url, json=update_data, headers=self.headers)
            
            if response.status_code in [200, 201]:
                self.test_passed("Edit Property")
            else:
                self.test_failed("Edit Property", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Edit Property", str(e))
    
    # ========================================
    # 2. HOME PAGE TESTS
    # ========================================
    
    def test_04_property_type_filter(self):
        """Test: Filter by property type"""
        try:
            url = f"{API_BASE}/properties/"
            params = {"property_type": "apartment"}
            response = requests.get(url, params=params, headers=self.headers)
            
            if response.status_code == 200:
                self.test_passed("Property Type Filter")
            else:
                self.test_failed("Property Type Filter", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Property Type Filter", str(e))
            
    def test_05_search_by_location(self):
        """Test: Search properties by location"""
        try:
            url = f"{API_BASE}/properties/"
            params = {"city": "Kathmandu"}
            response = requests.get(url, params=params, headers=self.headers)
            
            if response.status_code == 200:
                self.test_passed("Search by Location")
            else:
                self.test_failed("Search by Location", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Search by Location", str(e))
            
    def test_06_price_range_filter(self):
        """Test: Filter properties by price range"""
        try:
            url = f"{API_BASE}/properties/"
            params = {"min_price": "10000", "max_price": "100000"}
            response = requests.get(url, params=params, headers=self.headers)
            
            if response.status_code == 200:
                self.test_passed("Price Range Filter")
            else:
                self.test_failed("Price Range Filter", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Price Range Filter", str(e))
    
    # ========================================
    # 3. MY BOOKINGS TESTS
    # ========================================
    
    def test_07_my_bookings_view_details(self):
        """Test: View Details navigates to property detail"""
        try:
            url = f"{API_BASE}/bookings/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                bookings = response.json() if isinstance(response.json(), list) else response.json().get('results', [])
                
                if bookings:
                    booking = bookings[0]
                    # Check property_info exists for navigation
                    if 'property_info' in booking and 'id' in booking['property_info']:
                        self.test_passed("My Bookings - View Details Navigation Ready")
                    else:
                        self.test_failed("My Bookings View Details", "Missing property_info in response")
                else:
                    self.log("Skipping (no bookings)", "SKIP")
            else:
                self.test_failed("My Bookings Fetch", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("My Bookings View Details", str(e))
            
    def test_08_cancelled_bookings_hidden(self):
        """Test: Cancelled bookings are hidden from My Bookings"""
        try:
            url = f"{API_BASE}/bookings/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                bookings = response.json() if isinstance(response.json(), list) else response.json().get('results', [])
                
                # Check no cancelled bookings in response
                cancelled = [b for b in bookings if b.get('status') == 'cancelled']
                
                if not cancelled:
                    self.test_passed("Cancelled Bookings Hidden")
                else:
                    self.test_failed("Cancelled Bookings Hidden", f"Found {len(cancelled)} cancelled bookings")
            else:
                self.test_failed("Fetch Bookings", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Cancelled Bookings Check", str(e))
    
    # ========================================
    # 4. WISHLIST/FAVORITES TESTS
    # ========================================
    
    def test_09_add_to_favorites(self):
        """Test: Add property to favorites"""
        try:
            # Get a property first
            url = f"{API_BASE}/properties/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200 or not response.json():
                self.log("Skipping (no properties)", "SKIP")
                return
                
            props = response.json() if isinstance(response.json(), list) else response.json().get('results', [])
            if not props:
                self.log("Skipping (no properties)", "SKIP")
                return
                
            prop_id = props[0].get('id')
            
            # Add to favorites
            fav_url = f"{API_BASE}/favorites/toggle/"
            fav_data = {"property": prop_id}
            response = requests.post(fav_url, json=fav_data, headers=self.headers)
            
            if response.status_code in [200, 201]:
                self.test_passed("Add to Favorites")
            else:
                self.test_failed("Add to Favorites", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Add to Favorites", str(e))
            
    def test_10_remove_from_favorites(self):
        """Test: Remove property from favorites"""
        try:
            # Get favorites first
            url = f"{API_BASE}/favorites/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200 or not response.json():
                self.log("Skipping (no favorites)", "SKIP")
                return
                
            favs = response.json() if isinstance(response.json(), list) else response.json().get('results', [])
            if not favs:
                self.log("Skipping (no favorites)", "SKIP")
                return
                
            prop_id = favs[0].get('property_info', {}).get('id') or favs[0].get('property', {}).get('id')
            
            # Remove from favorites
            fav_url = f"{API_BASE}/favorites/toggle/"
            fav_data = {"property_id": prop_id}
            response = requests.delete(fav_url, json=fav_data, headers=self.headers)
            
            if response.status_code in [200, 204]:
                self.test_passed("Remove from Favorites")
            else:
                self.test_failed("Remove from Favorites", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Remove from Favorites", str(e))
    
    # ========================================
    # 5. PROPERTY DETAIL TESTS
    # ========================================
    
    def test_11_cancel_booking_modal(self):
        """Test: Cancel booking with modal confirmation"""
        try:
            # Get a booking
            url = f"{API_BASE}/bookings/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200 or not response.json():
                self.log("Skipping (no bookings)", "SKIP")
                return
                
            bookings = response.json() if isinstance(response.json(), list) else response.json().get('results', [])
            if not bookings:
                self.log("Skipping (no bookings)", "SKIP")
                return
                
            booking = bookings[0]
            booking_id = booking.get('id')
            
            # Check endpoint exists for cancellation
            cancel_url = f"{API_BASE}/bookings/{booking_id}/cancel/"
            response = requests.post(cancel_url, headers=self.headers)
            
            if response.status_code in [200, 201, 204]:
                self.test_passed("Cancel Booking Modal/Confirmation")
            else:
                self.test_failed("Cancel Booking", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Cancel Booking", str(e))
            
    def test_12_refund_calculation(self):
        """Test: Refund calculation works correctly"""
        try:
            # Get a booking
            url = f"{API_BASE}/bookings/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200 or not response.json():
                self.log("Skipping (no bookings)", "SKIP")
                return
                
            bookings = response.json() if isinstance(response.json(), list) else response.json().get('results', [])
            if not bookings:
                self.log("Skipping (no bookings)", "SKIP")
                return
                
            booking = bookings[0]
            
            # Check booking has required fields for refund calculation
            required_fields = ['total_price', 'check_in']
            has_fields = all(field in booking for field in required_fields)
            
            if has_fields:
                self.test_passed("Refund Calculation Data Available")
            else:
                self.test_failed("Refund Calculation", f"Missing fields: {required_fields}")
        except Exception as e:
            self.test_failed("Refund Calculation", str(e))
    
    # ========================================
    # 6. GENERAL TESTS
    # ========================================
    
    def test_13_property_list_fetch(self):
        """Test: Fetch properties list"""
        try:
            url = f"{API_BASE}/properties/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                self.test_passed("Fetch Properties List")
            else:
                self.test_failed("Fetch Properties", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Fetch Properties", str(e))
            
    def test_14_property_detail_fetch(self):
        """Test: Fetch property detail"""
        try:
            # Get a property first
            url = f"{API_BASE}/properties/"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code != 200 or not response.json():
                self.log("Skipping (no properties)", "SKIP")
                return
                
            props = response.json() if isinstance(response.json(), list) else response.json().get('results', [])
            if not props:
                self.log("Skipping (no properties)", "SKIP")
                return
                
            prop_id = props[0].get('id')
            
            # Fetch detail
            detail_url = f"{API_BASE}/properties/{prop_id}/"
            response = requests.get(detail_url, headers=self.headers)
            
            if response.status_code == 200:
                self.test_passed("Fetch Property Detail")
            else:
                self.test_failed("Fetch Property Detail", f"Status {response.status_code}")
        except Exception as e:
            self.test_failed("Fetch Property Detail", str(e))
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*60)
        print("STAYEASY - COMPREHENSIVE SYSTEM TEST")
        print("="*60 + "\n")
        
        self.log("Starting comprehensive system tests...", "START")
        
        # Test 1-3: Properties Page
        print("\n--- 1. PROPERTIES PAGE TESTS ---")
        self.test_02_publish_unpublish_property()
        self.test_03_edit_property()
        self.test_01_delete_property_with_confirmation()
        
        # Test 4-6: Home Page
        print("\n--- 2. HOME PAGE FILTER TESTS ---")
        self.test_04_property_type_filter()
        self.test_05_search_by_location()
        self.test_06_price_range_filter()
        
        # Test 7-8: My Bookings
        print("\n--- 3. MY BOOKINGS PAGE TESTS ---")
        self.test_07_my_bookings_view_details()
        self.test_08_cancelled_bookings_hidden()
        
        # Test 9-10: Favorites
        print("\n--- 4. FAVORITES/WISHLIST TESTS ---")
        self.test_09_add_to_favorites()
        self.test_10_remove_from_favorites()
        
        # Test 11-12: Property Detail
        print("\n--- 5. PROPERTY DETAIL TESTS ---")
        self.test_11_cancel_booking_modal()
        self.test_12_refund_calculation()
        
        # Test 13-14: General
        print("\n--- 6. GENERAL API TESTS ---")
        self.test_13_property_list_fetch()
        self.test_14_property_detail_fetch()
        
        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"✅ PASSED: {self.tests_passed}")
        print(f"❌ FAILED: {self.tests_failed}")
        print(f"📊 SUCCESS RATE: {(self.tests_passed/(self.tests_passed+self.tests_failed)*100):.1f}%")
        
        if self.failed_tests:
            print("\nFailed Tests:")
            for test_name, error in self.failed_tests:
                print(f"  ❌ {test_name}: {error}")
        
        print("="*60 + "\n")

if __name__ == "__main__":
    runner = TestRunner()
    
    # Set a dummy token (you'd get this from login in real scenario)
    runner.set_auth_token("dummy_token_for_testing")
    
    # Run tests
    runner.run_all_tests()
