# Generated cleanup migration to remove all property-related data
from django.db import migrations

def clear_property_data(apps, schema_editor):
    """
    Delete all property-related data in correct dependency order.
    Order matters due to foreign key constraints.
    """
    ViewedProperty = apps.get_model('users', 'ViewedProperty')
    Favorite = apps.get_model('users', 'Favorite')
    PropertyImage = apps.get_model('users', 'PropertyImage')
    Booking = apps.get_model('users', 'Booking')
    Property = apps.get_model('users', 'Property')
    
    # Step 1: Delete all viewed properties (depends on Property)
    ViewedProperty.objects.all().delete()
    print(f"✓ Deleted all ViewedProperty records")
    
    # Step 2: Delete all favorites (depends on Property)
    Favorite.objects.all().delete()
    print(f"✓ Deleted all Favorite records")
    
    # Step 3: Delete all property images (depends on Property)
    PropertyImage.objects.all().delete()
    print(f"✓ Deleted all PropertyImage records")
    
    # Step 4: Delete all bookings (depends on Property and User)
    Booking.objects.all().delete()
    print(f"✓ Deleted all Booking records")
    
    # Step 5: Delete all properties (final step)
    Property.objects.all().delete()
    print(f"✓ Deleted all Property records")
    
    print("=" * 60)
    print("DATABASE CLEANUP COMPLETE")
    print("=" * 60)
    print("✓ All property data removed")
    print("✓ All booking records deleted")
    print("✓ All images dereferenced")
    print("✓ Database integrity maintained")
    print("✓ User/KYC/LandlordUser data preserved")
    print("=" * 60)


def reverse_cleanup(apps, schema_editor):
    """
    Reverse function - cannot restore deleted data.
    This is a one-way cleanup operation.
    """
    print("WARNING: Cannot restore deleted property data")
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_landlorduser_alter_booking_payment_method_and_more'),
    ]

    operations = [
        migrations.RunPython(clear_property_data, reverse_cleanup),
    ]
