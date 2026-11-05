# CampusOS — Complete VIT Student Super App

> "Your entire academic life, in one place."

A unified, production-oriented academic management platform for students at Vellore Institute of Technology (VIT). CampusOS combines the student utility concept with an intelligent academic planner, automated platform ingestion, persistent relational database storage, and a responsive web/mobile PWA.

---

## Key Features

1. **Intelligent Dashboard & Today's Focus:**
   - Real-time statistics: Pending tasks, tasks due today, due this week, overdue tasks, completed tasks, and upcoming exams.
   - Algorithmic "Today's Focus" prioritized list with instant completion toggles.
   - Semester timeline progress bar and today's slot timetable.

2. **Full Academic Event Manager (Manual + Synchronized):**
   - Supports: Assignments, Midterms (CAT-1, CAT-2), Practical Assessment Tests (PAT), Final Assessment Tests (FAT), Lab Exams, Project Reviews, Quizzes, and Personal Targets.
   - Search, filter by category/priority/status, sorting, and inline editing.
   - Manual events are permanently preserved and never overwritten by platform sync.

3. **Academic Calendar (Month Grid & Agenda Views):**
   - Monthly and Agenda calendar with event category chips and detailed slide-overs.
   - Quick date navigation.

4. **Attendance Compliance & Bunk Calculator:**
   - Subject-wise attended/conducted classes and percentage.
   - Automated VIT 75% threshold monitoring.
   - Interactive "Safe to Miss" bunk calculator showing exact safe margin or classes needed to recover eligibility.

5. **Slot-Based Weekly Timetable:**
   - Weekly matrix mapped to FFCS slots (A1, B1, C1, D1, E1, Lab slots).
   - Real-time today's classes list and slot collision detection.

6. **Marks & CGPA Predictor:**
   - Subject-wise internal assessment marks (CAT-1, CAT-2, DA, Quizzes).
   - VIT 10-point relative grading prediction with semester GPA estimation.

7. **Smart Study Planner:**
   - Automatic preparation schedule generation for upcoming exams.
   - Distributes syllabus modules into structured daily study sessions.

8. **Central Synchronization Engine & Connectors:**
   - Connectors for Google Classroom, Microsoft Teams, and VIT Moodle.
   - Transparent institutional status: VTOP labeled as unavailable with manual entry assistance.
   - Idempotent deduplication via `(user_id, source_platform, external_id)`.
   - Detailed "SYNC ALL" execution report.

9. **Email Reminder System & Background Worker:**
   - Dedicated APScheduler worker for scheduled email reminders (3 days before, 1 day before, day of at 8:00 AM).
   - Automatic rescheduling on deadline changes.
   - Deduplication key prevention.

10. **Mobile PWA:**
    - Responsive layout with bottom navigation on mobile devices.
    - Web app manifest and service worker asset caching.

---

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router, TanStack Query.
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Bcrypt, Python-JOSE, APScheduler.
- **Database:** SQLite (local development zero-config) / PostgreSQL (production).

---

## Quick Start

### 1. Backend API
```bash
cd campusos/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=../.. alembic upgrade head
uvicorn campusos.backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Background Worker
```bash
cd campusos/backend
source .venv/bin/activate
PYTHONPATH=../.. python3 -m campusos.backend.app.workers.scheduler_worker
```

### 3. Frontend Application
```bash
cd campusos/frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

### 4. Run Automated Tests
```bash
cd campusos
PYTHONPATH=. backend/.venv/bin/pytest backend/tests/test_api.py -v
```

---

## Seed Demo Account
- **Email:** `student1@vitstudent.ac.in`
- **Password:** `Password123!`
