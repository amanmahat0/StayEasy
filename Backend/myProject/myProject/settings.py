from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

# BASE DIRECTORY
BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET KEY and DEBUG
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)

# ALLOWED HOSTS
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='', cast=Csv())

# -----------------------------------------------------------
# DATABASE (PostgreSQL from .env)
# -----------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', cast=int),
    }
}

# -----------------------------------------------------------
# INSTALLED APPS
# -----------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'users',
]

# -----------------------------------------------------------
# MIDDLEWARE
# -----------------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myProject.urls'

# -----------------------------------------------------------
# TEMPLATES
# -----------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'myProject.wsgi.application'

# -----------------------------------------------------------
# PASSWORD VALIDATION
# -----------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -----------------------------------------------------------
# INTERNATIONALIZATION
# -----------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -----------------------------------------------------------
# STATIC FILES & MEDIA FILES
# -----------------------------------------------------------
STATIC_URL = 'static/'
MEDIA_URL = '/uploads/'
MEDIA_ROOT = BASE_DIR / 'uploads'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------------------------------------
# CORS SETTINGS
# -----------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True

# -----------------------------------------------------------
# REST FRAMEWORK SETTINGS
# -----------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# -----------------------------------------------------------
# JWT SETTINGS
# -----------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# ===============================
# EMAIL SETTINGS (DEVELOPMENT)
# ===============================
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ===============================
# ESEWA PAYMENT SETTINGS
# ===============================
ESEWA_MERCHANT_CODE = config('ESEWA_MERCHANT_CODE', default='EPAYTEST')
ESEWA_SECRET_KEY = config('ESEWA_SECRET_KEY', default='8gBm/:&EnhH.1/q')
ESEWA_SANDBOX_URL = 'https://rc-epay.esewa.com.np/api/epay/txn/v1/verify/'
ESEWA_FORM_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'

# Set to 'production' for live payments
ESEWA_ENVIRONMENT = config('ESEWA_ENVIRONMENT', default='sandbox')
