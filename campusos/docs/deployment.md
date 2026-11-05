# Production Deployment Guide

## 1. Database (Managed PostgreSQL)
1. Provision a PostgreSQL 15+ database (e.g. on Supabase, Render, Railway, or AWS RDS).
2. Set the connection string:
   ```env
   DATABASE_URL=postgresql://user:password@hostname:5432/campusos
   ```
3. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```

---

## 2. Backend Deployment (Render / Railway / Fly.io)
- **Start Command:**
  ```bash
  uvicorn campusos.backend.app.main:app --host 0.0.0.0 --port $PORT --workers 4
  ```
- **Environment Variables:**
  - `DATABASE_URL`
  - `SECRET_KEY` (Generate with `openssl rand -hex 32`)
  - `JWT_SECRET_KEY`
  - `RESEND_API_KEY` (for email reminders)
  - `FRONTEND_URL` (e.g. `https://campusos.vercel.app`)

---

## 3. Background Worker Deployment
- Provision a dedicated background worker container:
  ```bash
  python -m campusos.backend.app.workers.scheduler_worker
  ```

---

## 4. Frontend Deployment (Vercel / Cloudflare Pages)
- **Root Directory:** `campusos/frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Rewrites (SPA):**
  Configure `vercel.json`:
  ```json
  {
    "rewrites": [
      { "source": "/api/(.*)", "destination": "https://your-backend.onrender.com/api/$1" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
