#!/usr/bin/env python
"""Debug script to check if landlord bookings are correctly fetched"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Booking, Property, Profile
from rest_framework_simplejwt.tokens import RefreshToken
from django.test import Client

print("="*70)
print("DEBUG: LANDLORD BOOKINGS DATA")
print("="*70)

# Get or create a landlord
try:
    landlord = User.objects.filter(profile__user_type='owner').first()
    if not landlord:
        print("❌ No landlord found")
        exit(1)
    
    print(f"\n✅ Landlord found: {landlord.username}")
    print(f"   - ID: {landlord.id}")
    print(f"   - Email: {landlord.email}")
    print(f"   - User Type: {landlord.profile.user_type}")
    
    # Check landlord's properties
    properties = Property.objects.filter(owner=landlord)
    print(f"\n✅ Landlord Properties: {properties.count()}")
    for prop in properties:
        print(f"   - {prop.title} (ID: {prop.id})")
    
    # Check bookings for landlord's properties
    bookings = Booking.objects.filter(property__owner=landlord)
    print(f"\n✅ Landlord Bookings: {bookings.count()}")
    for booking in bookings:
        print(f"   - Booking {booking.id}: {booking.user.email} → {booking.property.title} ({booking.status})")
    
    # Now test the API endpoint
    print(f"\n" + "="*70)
    print("TESTING API ENDPOINT")
    print("="*70)
    
    # Generate token
    refresh = RefreshToken.for_user(landlord)
    token = str(refresh.access_token)
    
    client = Client()
    response = client.get(
        '/api/users/landlord/bookings/',
        HTTP_AUTHORIZATION=f'Bearer {token}',
        HTTP_HOST='localhost:8000'
    )
    
    print(f"\nAPI Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"API Response type: {type(data).__name__}")
            if isinstance(data, list):
                print(f"API Response count: {len(data)} bookings")
                if data:
                    print(f"First booking sample: {json.dumps(data[0], indent=2)[:300]}...")
            elif isinstance(data, dict):
                print(f"API Response keys: {list(data.keys())}")
                if 'results' in data:
                    print(f"Paginated results count: {len(data['results'])}")
                    if data['results']:
                        print(f"First booking sample: {json.dumps(data['results'][0], indent=2)[:300]}...")
        except Exception as e:
            print(f"Error parsing response: {e}")
            print(f"Raw response: {response.content.decode()[:300]}")
    else:
        print(f"API Error Response: {response.content.decode()[:300]}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
