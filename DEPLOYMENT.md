# StayEasy — Complete Project Documentation

**GitHub Repository:** https://github.com/amanmahat0/StayEasy
**Stack:** React + Vite (Frontend) · Django REST Framework (Backend) · Socket.IO (Chat) · PostgreSQL (Database)

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [What Was Done — Full History](#2-what-was-done--full-history)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Variables](#4-environment-variables)
5. [How to Run Locally](#5-how-to-run-locally)
6. [Deploying to Vercel + Railway](#6-deploying-to-vercel--railway)
7. [After Deployment Checklist](#7-after-deployment-checklist)
8. [Important Notes & Warnings](#8-important-notes--warnings)
9. [Complete Change Log](#9-complete-change-log)

---

## 1. Project Structure

```
StayEasy/
├── Frontend/                        # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── config.ts                # Central env var config (API_BASE, SOCKET_URL)
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance for all Django API calls
│   │   │   ├── chatService.ts       # Axios instance for chat API calls
│   │   │   └── socketService.ts     # Socket.IO connection manager
│   │   ├── pages/                   # Route-level page components
│   │   └── components/              # Reusable UI components
│   ├── .env                         # Local dev env vars (not committed to Git)
│   ├── .env.example                 # Template showing required env vars
│   └── vercel.json                  # SPA routing fix for Vercel
│
├── Backend/
│   └── myProject/                   # Django project root
│       ├── myProject/
│       │   ├── settings.py          # Django settings
│       │   ├── urls.py              # Root URL config
│       │   └── email_backend.py     # Custom SMTP backend (skips SSL verify)
│       ├── users/                   # Main Django app
│       │   ├── models.py            # User, Profile, Property, Booking, etc.
│       │   ├── views.py             # API views
│       │   ├── serializers.py       # DRF serializers
│       │   ├── urls.py              # API URL patterns
│       │   └── migrations/          # Database migration files (0001–0029)
│       ├── .env                     # Local dev secrets (not committed to Git)
│       ├── .env.example             # Template showing required env vars
│       ├── requirements.txt         # Python dependencies
│       ├── Procfile                 # Railway start command
│       └── manage.py                # Django management CLI
│
├── socket-server/                   # Node.js + Socket.IO real-time chat server
│   ├── server.js                    # Main server file
│   └── package.json
│
├── .gitignore                       # Excludes .env, __pycache__, node_modules, etc.
├── DEPLOYMENT.md                    # This file
└── package.json                     # Root package (concurrently for dev)
```

---

## 2. What Was Done — Full History

This section documents everything that was done from cloning the repo to getting it production-ready.

### 2.1 Cloned the Original Repo

The original code was cloned from:
```
https://github.com/kaninn9846/StayEasy
```
into `d:\Kanin\StayEasy\` on a Windows 11 machine.

---

### 2.2 Installed Dependencies

**Python packages** (installed globally):
```
djangorestframework
djangorestframework-simplejwt
django-cors-headers
python-decouple
psycopg2-binary
```

**Node packages** (installed via `npm install` in each directory):
- `Frontend/` — React, Vite, Tailwind, axios, socket.io-client, react-router-dom, etc.
- `socket-server/` — express, socket.io, sqlite3, cloudinary, etc.

---

### 2.3 Set Up PostgreSQL (No Admin Rights)

PostgreSQL was not installed on the machine. Chocolatey install failed due to missing admin privileges. Solution: downloaded and used **portable EDB binaries**.

**Steps taken:**
1. Downloaded PostgreSQL 16.6 portable zip (~360 MB) from EDB:
   ```
   https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip
   ```
2. Extracted to `d:\Kanin\pgsql_portable\`
3. Initialized a database cluster at `d:\Kanin\pgdata\`:
   ```
   d:\Kanin\pgsql_portable\pgsql\bin\initdb.exe -D d:\Kanin\pgdata -U postgres --encoding=UTF8 --no-locale
   ```
4. Started the PostgreSQL server:
   ```
   d:\Kanin\pgsql_portable\pgsql\bin\pg_ctl.exe -D d:\Kanin\pgdata -l d:\Kanin\pgdata\postgres.log start
   ```
5. Created the database and set password:
   ```
   d:\Kanin\pgsql_portable\pgsql\bin\psql.exe -U postgres -c "CREATE DATABASE stayeasy;"
   d:\Kanin\pgsql_portable\pgsql\bin\psql.exe -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
   ```

**Portable PostgreSQL location:** `d:\Kanin\pgsql_portable\`
**Data directory:** `d:\Kanin\pgdata\`
**Database name:** `stayeasy`
**Username / Password:** `postgres` / `postgres`
**Port:** `5432`

---

### 2.4 Created the Backend `.env` File

The project uses `python-decouple` to read settings from `.env`. No `.env` file existed in the repo.

Created `Backend/myProject/.env` with all required values for local development (see [Section 4](#4-environment-variables)).

---

### 2.5 Fixed Migration Issues

Running `python manage.py migrate` hit two types of errors:

**Problem 1 — Unicode encoding crash (Windows cp1252)**
Migrations `0017` and `0018` used the `✓` and `⚠` characters in `print()` statements. Windows terminal encoding (cp1252) cannot display these, causing a crash mid-migration.

**Fix:** Replaced `✓` with `OK` and `⚠` with `WARN` in both migration files.

**Problem 2 — Duplicate column error**
Migration `0016` had already added `payment_type` and `cancelled_at` columns to `users_booking`. Migrations `0020` and `0021` tried to add the same columns again, causing a `DuplicateColumn` PostgreSQL error.

**Fix:** Faked those two migrations (marks them as applied without running the SQL):
```
python manage.py migrate users 0020 --fake
python manage.py migrate users 0021 --fake
```

All **29 migrations** applied successfully after these fixes.

---

### 2.6 Fixed Signup Being Broken

**Problem:** Signing up always failed. The `RegisterView` creates the user then immediately sends a verification email. Since email credentials were empty, `send_mail()` threw `SMTPSenderRefused`. Because the view uses `@transaction.atomic`, the exception rolled back the entire transaction — so the user was never saved to the database.

**Fix 1 — Email backend:** Made `EMAIL_BACKEND` configurable via `.env`. Set it to `django.core.mail.backends.console.EmailBackend` in development. This makes Django print the email content (including the 6-digit code) to the terminal instead of trying to send it.

**Fix 2 — Try/except around send_mail:** Wrapped the `send_mail()` call in a try/except block so that even if email fails in production, the user account is still created and a warning is logged.

---

### 2.7 Removed All Hardcoded URLs from Frontend

The frontend had `http://127.0.0.1:8000` hardcoded in **20 files** and `http://localhost:3001` in 2 files. These would completely break in production.

**Fix:** Created `Frontend/src/config.ts`:
```ts
const API_BASE   = import.meta.env.VITE_API_BASE   || "http://127.0.0.1:8000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
export { API_BASE, SOCKET_URL };
```

Updated all 20 files to import from this config. The fallback values mean local development still works with no `.env` file.

Created `Frontend/.env` for local development:
```
VITE_API_BASE=http://127.0.0.1:8000
VITE_SOCKET_URL=http://localhost:3001
```

---

### 2.8 Added Production Infrastructure Files

| File | Purpose |
|---|---|
| `Backend/myProject/requirements.txt` | Railway needs this to install Python packages |
| `Backend/myProject/Procfile` | Tells Railway to use `gunicorn` instead of `runserver` |
| `Frontend/vercel.json` | Tells Vercel to serve all routes from `index.html` (React Router fix) |

---

### 2.9 Updated Django Settings for Production

Three changes to `Backend/myProject/myProject/settings.py`:

1. **WhiteNoise** — serves static files without needing nginx:
   ```python
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       'django.middleware.security.SecurityMiddleware',
       'whitenoise.middleware.WhiteNoiseMiddleware',  # added
       ...
   ]
   STATIC_ROOT = BASE_DIR / 'staticfiles'
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
   ```

2. **CORS** — allow all in dev, restrict to frontend domain in production:
   ```python
   if DEBUG:
       CORS_ALLOW_ALL_ORIGINS = True
   else:
       CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=Csv())
   ```

3. **EMAIL_BACKEND** — configurable so dev uses console and prod uses SMTP:
   ```python
   EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
   ```

---

### 2.10 Fixed .gitignore and Cleaned Up __pycache__

The original `.gitignore` had `pycache/` instead of `__pycache__/` — so compiled Python bytecode files had been committed to the repo. Fixed the `.gitignore` and removed all `__pycache__` files from git tracking:
```
git rm -r --cached **/__pycache__
```

---

### 2.11 Created GitHub Repository and Pushed

Created a new public GitHub repository at:
```
https://github.com/amanmahat0/StayEasy
```

Updated git remote and pushed all changes:
```
git remote set-url origin https://github.com/amanmahat0/StayEasy.git
git push origin main
```

---

## 3. Local Development Setup

This section is for anyone setting up the project on a new machine.

### 3.1 Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (or use portable binaries — see below)
- Git

### 3.2 Clone the Repo

```bash
git clone https://github.com/amanmahat0/StayEasy.git
cd StayEasy
```

### 3.3 Install Python Dependencies

```bash
cd Backend/myProject
pip install -r requirements.txt
```

### 3.4 Install Node Dependencies

```bash
# Frontend
cd Frontend
npm install

# Socket server
cd ../../socket-server
npm install
```

### 3.5 Set Up PostgreSQL

**Option A — Install PostgreSQL normally** (if you have admin rights):
- Download from https://www.postgresql.org/download/windows/
- Create a database named `stayeasy`

**Option B — Portable PostgreSQL** (no admin rights needed):
```bash
# Download portable binaries
curl -L -o pgsql.zip "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip"
unzip pgsql.zip -d pgsql_portable

# Initialize database cluster
pgsql_portable/pgsql/bin/initdb.exe -D pgdata -U postgres --encoding=UTF8 --no-locale

# Start server
pgsql_portable/pgsql/bin/pg_ctl.exe -D pgdata start

# Create database
pgsql_portable/pgsql/bin/psql.exe -U postgres -c "CREATE DATABASE stayeasy;"
pgsql_portable/pgsql/bin/psql.exe -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### 3.6 Create .env Files

Copy the examples and fill in your values:
```bash
# Backend
cp Backend/myProject/.env.example Backend/myProject/.env

# Frontend
cp Frontend/.env.example Frontend/.env  # or create manually
```

The default values in `.env.example` work for local development — you only need to change them for production.

### 3.7 Run Migrations

```bash
cd Backend/myProject
python manage.py migrate
```

### 3.8 Create a Superuser (optional, for Django Admin)

```bash
python manage.py createsuperuser
```

---

## 4. Environment Variables

### Frontend — `Frontend/.env`

> Used locally. On Vercel, set these in the Vercel dashboard instead.

```env
VITE_API_BASE=http://127.0.0.1:8000
VITE_SOCKET_URL=http://localhost:3001
```

| Variable | Description |
|---|---|
| `VITE_API_BASE` | Base URL of Django backend. No trailing slash. All API calls and media image URLs are built from this. |
| `VITE_SOCKET_URL` | Base URL of Socket.IO server. No trailing slash. Used for real-time chat. |

---

### Backend — `Backend/myProject/.env`

> Used locally. On Railway, set these in the Variables tab instead.

```env
SECRET_KEY=s3qyoc8wj@^f+u4(s*2*6fqyec%z2)ve&qapen65vw44g00nye
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=stayeasy
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=127.0.0.1
DB_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=StayEasy <noreply@stayeasy.com>

FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

ESEWA_ENVIRONMENT=sandbox
```

| Variable | Local value | Production value | Description |
|---|---|---|---|
| `SECRET_KEY` | auto-generated | Generate new strong key | Django cryptographic signing key |
| `DEBUG` | `True` | `False` | Enables debug error pages |
| `ALLOWED_HOSTS` | `127.0.0.1,localhost` | `your-app.railway.app` | Which hostnames Django accepts |
| `DB_NAME` | `stayeasy` | Railway `PGDATABASE` | PostgreSQL database name |
| `DB_USER` | `postgres` | Railway `PGUSER` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | Railway `PGPASSWORD` | PostgreSQL password |
| `DB_HOST` | `127.0.0.1` | Railway `PGHOST` | PostgreSQL host |
| `DB_PORT` | `5432` | `5432` | PostgreSQL port |
| `EMAIL_BACKEND` | `console.EmailBackend` | `NoVerifySMTPBackend` | Dev prints to terminal, prod sends email |
| `EMAIL_HOST_USER` | *(empty)* | your Gmail | Gmail address |
| `EMAIL_HOST_PASSWORD` | *(empty)* | Gmail App Password | 16-character app password |
| `FRONTEND_URL` | `http://localhost:5173` | `https://your-app.vercel.app` | Used in password reset email links |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | `https://your-app.vercel.app` | Allowed frontend origins |
| `ESEWA_ENVIRONMENT` | `sandbox` | `production` | eSewa payment mode |

---

## 5. How to Run Locally

Open **4 separate terminals** and run one command in each:

### Terminal 1 — PostgreSQL (must start first)
```bash
d:\Kanin\pgsql_portable\pgsql\bin\pg_ctl.exe -D d:\Kanin\pgdata start
```
> Only needed if using the portable PostgreSQL setup. Skip if PostgreSQL is installed as a Windows service.

### Terminal 2 — Django Backend (port 8000)
```bash
cd d:\Kanin\StayEasy\Backend\myProject
python manage.py runserver
```
> **Verification codes appear here.** When a user signs up, the 6-digit email verification code is printed in this terminal (because `EMAIL_BACKEND=console.EmailBackend` in `.env`). Copy it and enter it on the verify screen.

### Terminal 3 — React Frontend (port 5173)
```bash
cd d:\Kanin\StayEasy\Frontend
npm run dev
```

### Terminal 4 — Socket.IO Server (port 3001)
```bash
cd d:\Kanin\StayEasy\socket-server
node server.js
```

**Open browser at:** http://localhost:5173

---

## 6. Deploying to Vercel + Railway

### Prerequisites
- GitHub account with repo at https://github.com/amanmahat0/StayEasy ✅ (already done)
- Railway account: https://railway.app — sign up with GitHub
- Vercel account: https://vercel.com — sign up with GitHub
- Gmail account for sending emails in production

---

### Step 1 — Push Latest Code to GitHub

All changes have already been pushed. For future changes:
```bash
git add .
git commit -m "your message"
git push origin main
```

---

### Step 2 — Railway: Add PostgreSQL Database

1. Go to https://railway.app → **New Project**
2. Click **+ New** → **Database** → **Add PostgreSQL**
3. Click on the PostgreSQL service → **Variables** tab
4. Note down: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

---

### Step 3 — Railway: Deploy Django Backend

1. In your Railway project → **+ New** → **GitHub Repo** → select `StayEasy`
2. **Settings → Source → Root Directory:** `Backend/myProject`
3. **Settings → Deploy → Build Command:**
   ```
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   ```
4. **Settings → Deploy → Start Command:**
   ```
   gunicorn myProject.wsgi --bind 0.0.0.0:$PORT
   ```
5. **Variables tab** — add every variable below:

| Variable | Value |
|---|---|
| `SECRET_KEY` | Generate at https://djecrety.ir |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-django-service.railway.app` |
| `DB_NAME` | from Railway PostgreSQL (`PGDATABASE`) |
| `DB_USER` | from Railway PostgreSQL (`PGUSER`) |
| `DB_PASSWORD` | from Railway PostgreSQL (`PGPASSWORD`) |
| `DB_HOST` | from Railway PostgreSQL (`PGHOST`) |
| `DB_PORT` | `5432` |
| `EMAIL_BACKEND` | `myProject.email_backend.NoVerifySMTPBackend` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USE_TLS` | `True` |
| `EMAIL_HOST_USER` | your Gmail e.g. `you@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Gmail App Password (16 chars — see note below) |
| `DEFAULT_FROM_EMAIL` | `StayEasy <noreply@stayeasy.com>` |
| `FRONTEND_URL` | `https://your-app.vercel.app` *(fill after Vercel step)* |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` *(fill after Vercel step)* |
| `ESEWA_ENVIRONMENT` | `sandbox` |

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords → create one for "Mail". Use the 16-character code, not your regular password.

6. Click **Deploy** — Railway installs packages, runs migrations, starts gunicorn
7. **Copy the Railway URL** e.g. `stayeasy-backend.railway.app`

---

### Step 4 — Railway: Deploy Socket.IO Server

1. In the same Railway project → **+ New** → **GitHub Repo** → `StayEasy`
2. **Settings → Source → Root Directory:** `socket-server`
3. Railway auto-detects Node.js — no build/start command needed
4. No environment variables needed
5. Click **Deploy**
6. **Copy the Railway URL** e.g. `stayeasy-socket.railway.app`

---

### Step 5 — Vercel: Deploy Frontend

1. Go to https://vercel.com → **Add New Project** → Import `StayEasy`
2. **Framework Preset:** Vite
3. **Root Directory:** `Frontend`
4. **Environment Variables** — add both:

| Variable | Value |
|---|---|
| `VITE_API_BASE` | `https://stayeasy-backend.railway.app` *(no trailing slash)* |
| `VITE_SOCKET_URL` | `https://stayeasy-socket.railway.app` *(no trailing slash)* |

5. Click **Deploy**
6. **Copy the Vercel URL** e.g. `stayeasy.vercel.app`

---

### Step 6 — Update Railway with Vercel URL

Go back to Railway → Django service → **Variables** → update:

| Variable | Value |
|---|---|
| `FRONTEND_URL` | `https://stayeasy.vercel.app` |
| `CORS_ALLOWED_ORIGINS` | `https://stayeasy.vercel.app` |

Railway redeploys automatically.

---

### Step 7 — Create Admin Superuser

1. Railway → Django service → **Shell** tab
2. Run:
   ```bash
   python manage.py createsuperuser
   ```
3. Django Admin panel: `https://your-django.railway.app/admin/`

---

## 7. After Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Can sign up (verification code arrives by email)
- [ ] Can log in
- [ ] Property images load correctly
- [ ] Chat works (Socket.IO connection)
- [ ] Django Admin accessible at `/admin/`
- [ ] eSewa payment works in sandbox mode
- [ ] Password reset email arrives

---

## 8. Important Notes & Warnings

### Never commit .env files
The `.env` files contain passwords and secret keys. The `.gitignore` already excludes them. Never force-add them with `git add -f .env`.

### Media files are lost on Railway redeploy
Railway's filesystem is ephemeral — every redeploy wipes uploaded files (property photos, profile pictures, KYC documents). Before going live with real users, set up **Cloudinary**:
1. Create free account at https://cloudinary.com
2. `pip install cloudinary django-cloudinary-storage`
3. Configure in `settings.py` to replace `MEDIA_ROOT` storage

### Email in development
`EMAIL_BACKEND=console.EmailBackend` means Django prints emails to Terminal 2 instead of sending them. The 6-digit signup verification code will appear there — copy it manually into the verify screen.

### eSewa payments
The project runs in `sandbox` (test) mode. For real money:
1. Register at https://esewa.com.np for a merchant account
2. Set `ESEWA_ENVIRONMENT=production` in Railway
3. Set real `ESEWA_MERCHANT_CODE` and `ESEWA_SECRET_KEY`

### Generating a strong SECRET_KEY for production
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Or use https://djecrety.ir

---

## 9. Complete Change Log

Every file that was changed and why:

| File | Change | Reason |
|---|---|---|
| `Frontend/.env` | Created — local dev env vars | Vite needs `VITE_API_BASE` and `VITE_SOCKET_URL` to resolve correctly in dev |
| `Frontend/src/config.ts` | Created — reads env vars with localhost fallback | Single source of truth for all URLs across the app |
| `Frontend/src/services/api.ts` | `baseURL` uses `API_BASE` from config | Removed hardcoded `http://127.0.0.1:8000` |
| `Frontend/src/services/chatService.ts` | `baseURL` uses `API_BASE` from config | Removed hardcoded `http://127.0.0.1:8000` |
| `Frontend/src/services/socketService.ts` | Socket/upload URL uses `SOCKET_URL` from config | Removed hardcoded `http://localhost:3001` |
| `Frontend/src/components/AddProperty/Step5Images.tsx` | Image src uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/components/admin/UserDetailModal.tsx` | KYC image URLs use `API_BASE` | Removed hardcoded URL |
| `Frontend/src/components/Home/Booking/Details.tsx` | Property image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/components/Home/MyBooking/MyBooking.tsx` | Booking image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/components/Home/MyBooking/ViewedProperties.tsx` | Property image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/components/Home/MyBooking/Wishlist.tsx` | Property image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/components/Home/Property/PropertyDetail.tsx` | Images + cancel API call use `API_BASE` | Removed hardcoded URLs |
| `Frontend/src/components/KYC/KYCContainer.tsx` | KYC submit URL uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/components/Profile/PersonalInformation.tsx` | Profile picture + KYC doc use `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/AddProperty/AddProperty.tsx` | Property create/update fetch URLs use `API_BASE` | Removed hardcoded URLs |
| `Frontend/src/pages/Admin/BookingManagement.tsx` | Booking image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/Admin/BookingManagement2.tsx` | Booking image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/Admin/PropertyManagement.tsx` | Property image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/Dashboard/BookingDetail.tsx` | API base + images use `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/Dashboard/Dashboard.tsx` | Property image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/Dashboard/Home.tsx` | Property image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/Dashboard/MyBookings.tsx` | API base + images use `API_BASE` | Removed hardcoded URL |
| `Frontend/src/pages/Properties/Properties.tsx` | Property image uses `API_BASE` | Removed hardcoded URL |
| `Frontend/vercel.json` | Created — rewrites all routes to `index.html` | React Router 404 fix: refreshing `/login` or any deep route returns 404 without this |
| `Backend/myProject/.env` | Created/updated — all local dev variables | Django requires `SECRET_KEY`, `DB_*` etc. via python-decouple; no `.env` existed |
| `Backend/myProject/.env.example` | Created — safe template without real secrets | Reference for new developers |
| `Backend/myProject/requirements.txt` | Created — all Python dependencies | Railway needs this to know what to `pip install` |
| `Backend/myProject/Procfile` | Created — `gunicorn myProject.wsgi` | Railway uses this as the start command; `manage.py runserver` is not for production |
| `Backend/myProject/myProject/settings.py` | Added `WhiteNoiseMiddleware` + `STATIC_ROOT` | Static files (CSS/JS for Django Admin) need serving without nginx |
| `Backend/myProject/myProject/settings.py` | CORS: `ALLOW_ALL` in dev, `ALLOWED_ORIGINS` in prod | Security — production should only allow the known frontend domain |
| `Backend/myProject/myProject/settings.py` | `EMAIL_BACKEND` reads from env var | Dev uses console backend (prints to terminal); prod uses real SMTP |
| `Backend/myProject/users/views.py` | `send_mail` wrapped in try/except | Email failure (no credentials) was rolling back user creation via `@transaction.atomic` |
| `Backend/myProject/users/migrations/0017_clear_property_data.py` | `✓` replaced with `OK` | Windows cp1252 encoding crash — Python couldn't print the Unicode checkmark |
| `Backend/myProject/users/migrations/0018_reset_sequences.py` | `✓` → `OK`, `⚠` → `WARN` | Same Windows cp1252 encoding crash |
| `.gitignore` | `pycache/` fixed to `__pycache__/` | Original pattern was wrong — compiled Python files were being tracked by Git |
