import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myProject.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Profile

users = User.objects.all()
print(f'Total users: {users.count()}')
print('-' * 60)

for u in users:
    try:
        profile = u.profile
        verified = profile.email_verified
    except:
        verified = 'N/A'
    print(f'{u.username:20} | {u.email:30} | Verified: {verified}')
