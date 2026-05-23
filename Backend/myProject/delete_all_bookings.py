#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
django.setup()

from users.models import Booking

# Delete all bookings
count = Booking.objects.all().count()
Booking.objects.all().delete()
remaining = Booking.objects.all().count()

print(f"✅ Deleted {count} bookings")
print(f"✅ Total remaining bookings: {remaining}")
