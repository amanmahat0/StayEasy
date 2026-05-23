# Generated migration for eSewa 2.0 payment system - Fix migration chain and add new fields

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0013_alter_property_status'),
    ]

    state_operations = [
        # State-level operations to fix the migration graph
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('check_in', models.DateField()),
                ('check_out', models.DateField()),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(choices=[('confirmed', 'Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='confirmed', max_length=20)),
                ('payment_method', models.CharField(choices=[('esewa', 'eSewa')], default='esewa', max_length=20)),
                ('payment_status', models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('esewa_transaction_id', models.CharField(blank=True, max_length=255, null=True)),
                ('esewa_ref_id', models.CharField(blank=True, max_length=255, null=True)),
                ('esewa_signature', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='users.property')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

    operations = [
        # Don't actually create the model since it already exists in DB
        # Just add the eSewa fields that might be missing
        migrations.AddField(
            model_name='booking',
            name='esewa_transaction_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='esewa_ref_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='esewa_signature',
            field=models.TextField(blank=True, null=True),
        ),
    ]

