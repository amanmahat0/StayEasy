# Generated migration for Booking model improvements

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_booking_esewa_fields'),
    ]

    operations = [
        # Update status choices to include 'pending' and 'processing'
        migrations.AlterField(
            model_name='booking',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('processing', 'Processing'),
                    ('confirmed', 'Confirmed'),
                    ('completed', 'Completed'),
                    ('cancelled', 'Cancelled')
                ],
                default='pending',
                max_length=20
            ),
        ),
        # Update payment_status choices
        migrations.AlterField(
            model_name='booking',
            name='payment_status',
            field=models.CharField(
                choices=[
                    ('unpaid', 'Unpaid'),
                    ('paid', 'Paid'),
                    ('failed', 'Failed')
                ],
                default='unpaid',
                max_length=20
            ),
        ),
        # Add payment_type field
        migrations.AddField(
            model_name='booking',
            name='payment_type',
            field=models.CharField(
                choices=[
                    ('full', 'Full Payment'),
                    ('partial', 'Partial Payment')
                ],
                default='full',
                max_length=20
            ),
        ),
        # Add cancelled_at field to track cancellation time
        migrations.AddField(
            model_name='booking',
            name='cancelled_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
