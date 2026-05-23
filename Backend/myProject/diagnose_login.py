#!/usr/bin/env python
"""
StayEasy Login Troubleshooting Script
Tests authentication flow and provides diagnostics
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Profile
import requests
import json

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def test_user_exists(email_or_username):
    """Test if user exists"""
    user = User.objects.filter(email=email_or_username).first() or \
           User.objects.filter(username=email_or_username).first()
    return user

def check_profile(user):
    """Check user profile"""
    try:
        profile = user.profile
        return profile
    except:
        return None

def test_login_api(email, password):
    """Test login API endpoint"""
    url = "http://127.0.0.1:8000/api/users/login/"
    payload = {"email": email, "password": password}
    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code, response.json()
    except Exception as e:
        return None, str(e)

# ========================================
print_section("STAYEASY LOGIN DIAGNOSTICS")
print()

# List some test users
print("📋 Available Test Users:")
users = User.objects.filter(profile__email_verified=True)[:5]
if users.exists():
    for u in users:
        print(f"  ✅ {u.username:20} | {u.email}")
else:
    print("  ❌ No verified users found")

print("\n📋 Sample Unverified Users:")
users = User.objects.filter(profile__email_verified=False)[:5]
if users.exists():
    for u in users:
        print(f"  ⏳ {u.username:20} | {u.email}")

# Test with a verified user
print_section("TESTING LOGIN WITH VERIFIED USER")
test_email = "Kanninn@gmail.com"
print(f"Testing with email: {test_email}")

user = test_user_exists(test_email)
if user:
    print(f"✅ User exists: {user.username}")
    profile = check_profile(user)
    if profile:
        print(f"✅ Profile exists")
        print(f"   - Email verified: {profile.email_verified}")
        print(f"   - User type: {profile.user_type}")
        print(f"   - Role: {profile.role}")
    else:
        print(f"❌ Profile NOT found - will be created on login")
else:
    print(f"❌ User NOT found")

# Test API
print(f"\n🌐 Testing API endpoint...")
status, response = test_login_api(test_email, "test123")
if status:
    print(f"Status Code: {status}")
    print(f"Response: {json.dumps(response, indent=2)}")
else:
    print(f"❌ Connection Error: {response}")

print_section("TROUBLESHOOTING GUIDE")
print("""
If login fails, check:

1. ❌ "Email not verified" (403):
   -> Email verification is enforced
   -> Solution: Verify email OR disable verification for testing
   -> Status: FIXED (verification check commented out)

2. ❌ "Invalid email or password" (401):
   -> Wrong credentials
   -> Solution: Use correct password (default: 'test123' for test users)
   -> Solution: Create a new test user

3. ❌ "Connection refused":
   -> Backend server not running
   -> Solution: Start server: python manage.py runserver

4. ❌ CORS error:
   -> Frontend can't reach backend
   -> Solution: Check ALLOWED_HOSTS in settings.py
   -> Status: OK (CORS_ALLOW_ALL_ORIGINS = True)

5. ✅ Login succeeds but wrong redirect:
   -> Check user_type in profile
   -> Possible values: 'tenant', 'owner'
   -> Solution: Update profile in admin panel
""")

print_section("QUICK TEST")
print("To test login from frontend, use:")
print(f"  Email: {test_email}")
print(f"  Password: test123")
print("\nOr create a new account via signup")

print("\n" + "="*60)
