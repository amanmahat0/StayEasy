# StayEasy — Deployment Guide (Vercel + Railway)

This guide covers everything needed to deploy the StayEasy project from a single GitHub repository.

**Architecture:**
| Service | Platform | Directory |
|---|---|---|
| React Frontend | Vercel | `Frontend/` |
| Django Backend | Railway | `Backend/myProject/` |
| Socket.IO Chat Server | Railway | `socket-server/` |
| PostgreSQL Database | Railway | (managed plugin) |

---

## Part 1 — Code Changes Already Made

The following changes have already been applied to the codebase so it works in production. You do not need to redo these.

### 1.1 Frontend — Removed All Hardcoded URLs

**Problem:** The frontend had `http://127.0.0.1:8000` and `http://localhost:3001` hardcoded in 20 files. These would fail in production.

**Fix:** Created `Frontend/src/config.ts` that reads from environment variables:
```ts
const API_BASE   = import.meta.env.VITE_API_BASE   || "http://127.0.0.1:8000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
```

All 20 files now import from this central config. In development it falls back to localhost automatically so nothing breaks locally.

**Files changed:**
- `src/config.ts` — new file, central config
- `src/services/api.ts` — axios baseURL now uses `API_BASE`
- `src/services/chatService.ts` — axios baseURL now uses `API_BASE`
- `src/services/socketService.ts` — socket URL now uses `SOCKET_URL`
- 17 component/page files — image and API URLs now use `API_BASE`

### 1.2 Frontend — Added .env File

**Fix:** Created `Frontend/.env` for local development:
```
VITE_API_BASE=http://127.0.0.1:8000
VITE_SOCKET_URL=http://localhost:3001
```
This file is for **local development only**. On Vercel, these variables are set in the dashboard instead.

> **Important:** Never commit `.env` files with real secrets to GitHub. Add `.env` to `.gitignore`.

### 1.3 Frontend — Added vercel.json

**Problem:** React Router uses client-side routing. Without this file, refreshing any page (e.g. `/login`) returns a 404 from Vercel.

**Fix:** Created `Frontend/vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

### 1.4 Backend — Added requirements.txt

**Problem:** Railway needs a `requirements.txt` to know which Python packages to install. The project had none.

**Fix:** Created `Backend/myProject/requirements.txt` with all dependencies including `gunicorn` (production server) and `whitenoise` (static file serving).

### 1.5 Backend — Added Procfile

**Problem:** Railway needs to know how to start the Django server in production. `manage.py runserver` must never be used in production.

**Fix:** Created `Backend/myProject/Procfile`:
```
web: gunicorn myProject.wsgi --bind 0.0.0.0:$PORT
```
Gunicorn is a production-grade WSGI server. `$PORT` is set automatically by Railway.

### 1.6 Backend — Updated .env File

**Fix:** Updated `Backend/myProject/.env` with all required variables for local development:
```
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

> **Important:** Never commit `.env` files with real secrets to GitHub. Add `.env` to `.gitignore`.

### 1.7 Backend — Added WhiteNoise for Static Files

**Problem:** In production, Django cannot serve static files itself (no nginx on Railway free tier).

**Fix:** Added WhiteNoise middleware to `settings.py`:
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',   # ← added
    ...
]
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 1.8 Backend — Fixed CORS for Production

**Problem:** `CORS_ALLOW_ALL_ORIGINS = True` allows any website to call the API — a security risk in production.

**Fix:** In production, only the Vercel frontend domain is allowed:
```python
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=Csv())
```

### 1.9 Backend — Fixed Email Sending Crashing Signup

**Problem:** Signup was broken because `send_mail()` crashed with no email credentials configured, and `@transaction.atomic` rolled back the user creation too.

**Fix:**
- `EMAIL_BACKEND` in `.env` is set to `console.EmailBackend` for development (prints the verification code to the terminal instead of actually sending an email).
- Wrapped `send_mail()` in try/except so a failed email never crashes signup.

---

## Part 2 — .env Files Explained

### Frontend — `Frontend/.env`

Used **only for local development**. Vite reads this automatically when you run `npm run dev`.

```
VITE_API_BASE=http://127.0.0.1:8000
VITE_SOCKET_URL=http://localhost:3001
```

| Variable | What it does |
|---|---|
| `VITE_API_BASE` | Base URL of the Django backend. All API calls and image URLs are built from this. |
| `VITE_SOCKET_URL` | Base URL of the Socket.IO server. Used for real-time chat. |

When deploying to **Vercel**, you set these same variables in the Vercel dashboard under **Environment Variables** — you do not upload the `.env` file.

---

### Backend — `Backend/myProject/.env`

Used **only for local development**. Django reads this via `python-decouple`.

| Variable | Local value | What it does |
|---|---|---|
| `SECRET_KEY` | auto-generated | Django's cryptographic signing key |
| `DEBUG` | `True` | Enables debug mode and detailed error pages |
| `ALLOWED_HOSTS` | `127.0.0.1,localhost` | Which hostnames Django accepts requests from |
| `DB_NAME` | `stayeasy` | PostgreSQL database name |
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_HOST` | `127.0.0.1` | PostgreSQL host (local machine) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `EMAIL_BACKEND` | `console.EmailBackend` | Prints emails to terminal instead of sending |
| `EMAIL_HOST_USER` | *(empty)* | Not needed in dev — fill in for production |
| `EMAIL_HOST_PASSWORD` | *(empty)* | Not needed in dev — fill in for production |
| `FRONTEND_URL` | `http://localhost:5173` | Used in password reset email links |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Allows the frontend to call the API |
| `ESEWA_ENVIRONMENT` | `sandbox` | Uses eSewa test mode, no real money |

When deploying to **Railway**, you set each of these in the Railway dashboard under **Variables** — with production values.

---

## Part 3 — Step-by-Step Deployment

### Prerequisites
- GitHub account (repo already at `https://github.com/kaninn9846/StayEasy`)
- Railway account: https://railway.app (sign up with GitHub)
- Vercel account: https://vercel.com (sign up with GitHub)
- Gmail account (for sending verification/reset emails in production)

---

### Step 1 — Add .env to .gitignore then push to GitHub

Before pushing, make sure `.env` files are not committed to GitHub (they contain passwords).

Check if `.gitignore` exists at the repo root:
```bash
# In d:\Kanin\StayEasy\
```
If there is no `.gitignore`, create one at the root (`StayEasy/.gitignore`):
```
# Environment files
.env
*.env

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
*.db
staticfiles/

# Node
node_modules/
dist/

# IDE
.vscode/
.idea/
```

Then push everything to GitHub:
```bash
git add .
git commit -m "Prepare for production deployment"
git push
```

---

### Step 2 — Set up Railway (Backend + Socket + Database)

#### 2.1 Create a new Railway project

1. Go to https://railway.app → click **New Project**
2. Select **Deploy from GitHub repo** → choose `StayEasy`
3. This creates your Railway workspace

#### 2.2 Add PostgreSQL database

1. Inside your Railway project, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Railway provisions the database and auto-generates connection details
4. Click on the PostgreSQL service → **Variables** tab to see:
   - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
5. **Note these down** — you will paste them into the Django service next

#### 2.3 Deploy Django Backend

1. In your Railway project, click **+ New** → **GitHub Repo** → select `StayEasy`
2. Click the new service → open **Settings**
3. **Settings → Source → Root Directory:**
   ```
   Backend/myProject
   ```
4. **Settings → Deploy → Build Command:**
   ```
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   ```
5. **Settings → Deploy → Start Command:**
   ```
   gunicorn myProject.wsgi --bind 0.0.0.0:$PORT
   ```
6. Go to the **Variables** tab and add every row below:

| Variable | Value to enter |
|---|---|
| `SECRET_KEY` | Generate at https://djecrety.ir — paste the result |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | your Railway domain e.g. `stayeasy-backend.railway.app` |
| `DB_NAME` | value of `PGDATABASE` (from step 2.2) |
| `DB_USER` | value of `PGUSER` (from step 2.2) |
| `DB_PASSWORD` | value of `PGPASSWORD` (from step 2.2) |
| `DB_HOST` | value of `PGHOST` (from step 2.2) |
| `DB_PORT` | `5432` |
| `EMAIL_BACKEND` | `myProject.email_backend.NoVerifySMTPBackend` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USE_TLS` | `True` |
| `EMAIL_HOST_USER` | your Gmail address e.g. `you@gmail.com` |
| `EMAIL_HOST_PASSWORD` | your Gmail App Password (16 characters, see note) |
| `DEFAULT_FROM_EMAIL` | `StayEasy <noreply@stayeasy.com>` |
| `FRONTEND_URL` | `https://your-app.vercel.app` *(update after Vercel deploy)* |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` *(update after Vercel deploy)* |
| `ESEWA_ENVIRONMENT` | `sandbox` |

> **How to get a Gmail App Password:**
> 1. Go to https://myaccount.google.com/security
> 2. Enable 2-Step Verification if not already on
> 3. Search for "App Passwords" → create one for "Mail"
> 4. Copy the 16-character password — use this as `EMAIL_HOST_PASSWORD`

7. Click **Deploy**. Railway installs packages, collects static files, runs migrations, and starts gunicorn.
8. Once deployed, Railway shows a public URL. **Copy it** — e.g. `stayeasy-backend-production.up.railway.app`

#### 2.4 Deploy Socket.IO Server

1. In the same Railway project, click **+ New** → **GitHub Repo** → select `StayEasy` again
2. Click the new service → **Settings → Source → Root Directory:**
   ```
   socket-server
   ```
3. Railway auto-detects Node.js and runs `npm start` — no extra config needed
4. **Variables** tab — no variables needed (Railway sets `PORT` automatically)
5. Click **Deploy**
6. Copy the deployed URL — e.g. `stayeasy-socket.railway.app`

---

### Step 3 — Deploy Frontend to Vercel

1. Go to https://vercel.com → **Add New Project** → Import `StayEasy` from GitHub
2. **Framework Preset** → select **Vite**
3. **Root Directory** → click Edit → set to:
   ```
   Frontend
   ```
4. **Environment Variables** → add these two (use the Railway URLs from steps 2.3 and 2.4):

| Variable | Value |
|---|---|
| `VITE_API_BASE` | `https://stayeasy-backend.railway.app` *(your actual Django Railway URL, no trailing slash)* |
| `VITE_SOCKET_URL` | `https://stayeasy-socket.railway.app` *(your actual Socket Railway URL, no trailing slash)* |

5. Click **Deploy**
6. Vercel gives you a URL like `stayeasy.vercel.app`. **Copy it.**

---

### Step 4 — Update Backend with the Vercel URL

Go back to Railway → Django service → **Variables** tab and update:

| Variable | Value |
|---|---|
| `FRONTEND_URL` | `https://stayeasy.vercel.app` |
| `CORS_ALLOWED_ORIGINS` | `https://stayeasy.vercel.app` |

Click **Deploy** (or Railway redeploys automatically on variable change).

---

### Step 5 — Create a Superuser (Admin access)

1. In Railway, go to your Django service
2. Click the **Shell** tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Enter a username, email, and password
5. Django Admin is now at: `https://your-django.railway.app/admin/`

---

## Part 4 — Environment Variables Quick Reference

### Frontend `.env` (local) / Vercel dashboard (production)
| Variable | Local value | Production value |
|---|---|---|
| `VITE_API_BASE` | `http://127.0.0.1:8000` | `https://your-django.railway.app` |
| `VITE_SOCKET_URL` | `http://localhost:3001` | `https://your-socket.railway.app` |

### Backend `.env` (local) / Railway Variables (production)
| Variable | Local value | Production value |
|---|---|---|
| `SECRET_KEY` | auto-generated | generate a new strong key |
| `DEBUG` | `True` | `False` |
| `ALLOWED_HOSTS` | `127.0.0.1,localhost` | `your-django.railway.app` |
| `DB_NAME` | `stayeasy` | Railway `PGDATABASE` value |
| `DB_USER` | `postgres` | Railway `PGUSER` value |
| `DB_PASSWORD` | `postgres` | Railway `PGPASSWORD` value |
| `DB_HOST` | `127.0.0.1` | Railway `PGHOST` value |
| `DB_PORT` | `5432` | `5432` |
| `EMAIL_BACKEND` | `django.core.mail.backends.console.EmailBackend` | `myProject.email_backend.NoVerifySMTPBackend` |
| `EMAIL_HOST_USER` | *(empty)* | your Gmail address |
| `EMAIL_HOST_PASSWORD` | *(empty)* | your Gmail App Password |
| `FRONTEND_URL` | `http://localhost:5173` | `https://your-app.vercel.app` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | `https://your-app.vercel.app` |
| `ESEWA_ENVIRONMENT` | `sandbox` | `production` (only when going live) |

---

## Part 5 — Running Locally

Every time you want to run the project locally, open **4 terminal windows**:

**Terminal 1 — Start PostgreSQL** (must run first)
```bash
d:\Kanin\pgsql_portable\pgsql\bin\pg_ctl.exe -D d:\Kanin\pgdata start
```

**Terminal 2 — Start Django Backend**
```bash
cd d:\Kanin\StayEasy\Backend\myProject
python manage.py runserver
```
> Verification codes print here when users sign up (because `EMAIL_BACKEND=console.EmailBackend` in `.env`)

**Terminal 3 — Start Frontend**
```bash
cd d:\Kanin\StayEasy\Frontend
npm run dev
```

**Terminal 4 — Start Socket Server**
```bash
cd d:\Kanin\StayEasy\socket-server
node server.js
```

Then open: **http://localhost:5173**

---

## Part 6 — Important Notes

### .env Files and .gitignore
The `.env` files hold passwords and secret keys. They must **never** be committed to GitHub. Add `.env` to your `.gitignore` so Git ignores them. The `.env.example` files in each directory show the structure without real values — these are safe to commit.

### Media Files (uploaded images)
Railway's filesystem is **ephemeral** — uploaded images (property photos, profile pictures, KYC documents) will be deleted on every redeploy. For persistent image storage in production:
1. Create a free account at https://cloudinary.com
2. Install: `pip install cloudinary django-cloudinary-storage`
3. Configure Cloudinary in `settings.py` to replace the local `MEDIA_ROOT` storage

This is not required to get the app running but must be done before going live with real users.

### Email in Development
`EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend` means Django prints emails to Terminal 2 instead of sending them. When a user signs up, look in Terminal 2 for the 6-digit verification code and enter it manually on the verify screen.

### eSewa Payments
The project runs in sandbox (test) mode. For real payments:
1. Register at https://esewa.com.np for a merchant account
2. Set `ESEWA_ENVIRONMENT=production` in Railway env vars
3. Set `ESEWA_MERCHANT_CODE` and `ESEWA_SECRET_KEY` with your real merchant credentials

---

## Part 7 — Full Change Log

| File | What changed | Why |
|---|---|---|
| `Frontend/.env` | Created — local dev environment variables | Vite needs this to resolve `VITE_API_BASE` and `VITE_SOCKET_URL` locally |
| `Frontend/src/config.ts` | Created — reads env vars, falls back to localhost | Single source of truth for all URLs |
| `Frontend/src/services/api.ts` | baseURL uses `API_BASE` from config | Removed hardcoded `127.0.0.1:8000` |
| `Frontend/src/services/chatService.ts` | baseURL uses `API_BASE` from config | Removed hardcoded `127.0.0.1:8000` |
| `Frontend/src/services/socketService.ts` | Socket URL uses `SOCKET_URL` from config | Removed hardcoded `localhost:3001` |
| 17 component/page files | All image and API URLs use `API_BASE` | Removed hardcoded `127.0.0.1:8000` |
| `Frontend/vercel.json` | Created — rewrites all routes to `/` | React Router 404 fix on page refresh |
| `Frontend/.env.example` | Created — shows required env vars without real values | Safe reference for other developers |
| `Backend/myProject/.env` | Updated — added `EMAIL_BACKEND` and `CORS_ALLOWED_ORIGINS` | Signup was crashing without these |
| `Backend/myProject/requirements.txt` | Created — all Python dependencies | Railway needs this to install packages |
| `Backend/myProject/Procfile` | Created — starts gunicorn | Production WSGI server (not `runserver`) |
| `Backend/myProject/.env.example` | Created — shows required env vars without real values | Safe reference for other developers |
| `Backend/myProject/myProject/settings.py` | Added WhiteNoise middleware + `STATIC_ROOT` | Serve static files without nginx |
| `Backend/myProject/myProject/settings.py` | CORS: allow all in dev, restrict in prod | Security — don't allow all origins in production |
| `Backend/myProject/myProject/settings.py` | `EMAIL_BACKEND` configurable via env var | Dev prints to console, prod sends real email |
| `Backend/myProject/users/views.py` | `send_mail` wrapped in try/except | Email failure no longer crashes and rolls back signup |
| `Backend/myProject/users/migrations/0017_clear_property_data.py` | Replaced `✓` with `OK` | Windows cp1252 encoding crash fix |
| `Backend/myProject/users/migrations/0018_reset_sequences.py` | Replaced `✓`/`⚠` with ASCII equivalents | Windows cp1252 encoding crash fix |
