from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile

# ============================================================
# SIGNAL TO CREATE PROFILE AUTOMATICALLY AFTER USER CREATION
# ============================================================
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        # Read the temporarily attached _user_type from serializer
        user_type = getattr(instance, "_user_type", "tenant")  # default fallback: 'tenant'
        Profile.objects.create(user=instance, user_type=user_type)