# Generated manually — email verification code fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0024_property_amenities_property_area_property_area_size_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='email_verification_code',
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='email_verification_expires',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
