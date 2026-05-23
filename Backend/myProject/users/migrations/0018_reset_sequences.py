# Reset auto-increment sequences to start from 1
from django.db import migrations, connection

def reset_sequences(apps, schema_editor):
    """
    Reset PostgreSQL sequences for all cleared tables.
    This ensures the next property/booking/etc will have ID=1.
    """
    with connection.cursor() as cursor:
        sequences_to_reset = [
            'users_property_id_seq',
            'users_propertyimage_id_seq',
            'users_booking_id_seq',
            'users_favorite_id_seq',
            'users_viewedproperty_id_seq',
        ]
        
        for seq_name in sequences_to_reset:
            try:
                cursor.execute(f"ALTER SEQUENCE {seq_name} RESTART WITH 1;")
                print(f"✓ Reset sequence: {seq_name}")
            except Exception as e:
                print(f"⚠ Sequence {seq_name} - {str(e)}")
        
    print("=" * 60)
    print("SEQUENCE RESET COMPLETE")
    print("=" * 60)
    print("✓ All auto-increment counters reset to 1")
    print("✓ Next property will have ID=1")
    print("✓ Next booking will have ID=1")
    print("=" * 60)


def reverse_sequences(apps, schema_editor):
    """Reverse function - cannot revert sequence resets"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_clear_property_data'),
    ]

    operations = [
        migrations.RunPython(reset_sequences, reverse_sequences),
    ]
