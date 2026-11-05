# CampusOS Installation & Local Run Guide

## Prerequisites
- **Node.js**: v18+ or v20+ (Verified on Node v24.13.1)
- **Python**: v3.10+ (Verified on Python 3.14.4)
- **npm**: v9+ (Verified on npm 11.8.0)

---

## 1. Quick Startup (3 Terminals)

### Terminal 1: Backend API (FastAPI)
```bash
cd campusos/backend
# Create virtual environment if not already present
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run database migrations
PYTHONPATH=../.. alembic upgrade head

# Start FastAPI server
uvicorn campusos.backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API docs available at: `http://localhost:8000/docs`  
Health check endpoint: `http://localhost:8000/health`

### Terminal 2: Background Worker (APScheduler)
```bash
cd campusos/backend
source .venv/bin/activate
PYTHONPATH=../.. python3 -m campusos.backend.app.workers.scheduler_worker
```

### Terminal 3: Frontend Web / PWA (React + Vite)
```bash
cd campusos/frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 2. Seed Demo Account
A default test account is pre-configured:
- **Email:** `student1@vitstudent.ac.in`
- **Password:** `Password123!`

Or click the **"Autofill Seed Demo Account"** button on the Login screen.

---

## 3. Running Automated Tests
To run the full backend pytest test suite:
```bash
cd campusos
PYTHONPATH=. backend/.venv/bin/pytest backend/tests/test_api.py -v
```

---

## 4. Production Build
```bash
# Frontend
cd campusos/frontend
npm run build
npm run preview
```
