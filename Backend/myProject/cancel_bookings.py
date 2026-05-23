#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
django.setup()

from users.models import Booking
from django.utils import timezone

# Cancel all bookings
bookings = Booking.objects.all()
count = bookings.count()
bookings.update(status='cancelled', cancelled_at=timezone.now())

print(f"✅ Successfully cancelled {count} bookings")
print(f"Total cancelled bookings: {Booking.objects.filter(status='cancelled').count()}")
