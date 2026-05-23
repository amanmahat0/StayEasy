# Generated migration for adding payment_type field to Booking

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_chat_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='payment_type',
            field=models.CharField(
                choices=[('full', 'Full Payment'), ('partial', 'Partial Payment')],
                default='full',
                max_length=20
            ),
        ),
    ]
