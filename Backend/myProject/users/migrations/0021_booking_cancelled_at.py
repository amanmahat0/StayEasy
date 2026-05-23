# Generated migration for adding cancelled_at field to Booking

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_booking_payment_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='cancelled_at',
            field=models.DateTimeField(
                blank=True,
                null=True
            ),
        ),
    ]
