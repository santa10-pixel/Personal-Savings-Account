# CampusOS Architecture & Design Specification

## 1. System Overview
**CampusOS** is a unified academic companion and deadline management platform engineered specifically for students at Vellore Institute of Technology (VIT). The system aggregates fragmented coursework, examinations, laboratory submissions, attendance metrics, and slot timetables across multiple university services:
- Google Classroom
- Microsoft Teams (VIT Tenant)
- VIT Moodle LMS (lms.vit.ac.in)
- VTOP Student Portal
- vitColab
- iPilot Lab Environment

CampusOS provides two synchronized pipelines:
1. **Automated Platform Ingestion:** Modular connector adapters running via an idempotent synchronization engine.
2. **Personal Academic Management:** Manual entry, editing, and planning for offline announcements, WhatsApp notices, and personal targets.

---

## 2. Architecture Layers

```
                     +---------------------------------------+
                     |         Web / Mobile PWA              |
                     |  (React 18 + TS + Tailwind + Vite)    |
                     +-------------------+-------------------+
                                         | REST API (JSON)
                                         v
                     +---------------------------------------+
                     |         FastAPI Gateway               |
                     |  - Bearer JWT Authentication (OAuth2) |
                     |  - CORS & Rate Limiting               |
                     |  - Pydantic v2 Request Validation     |
                     +-------------------+-------------------+
                                         |
     +-----------------------------------+-----------------------------------+
     |                                   |                                   |
     v                                   v                                   v
+-------------------+           +-------------------+               +-------------------+
| Core API Services |           |  Platform Sync    |               | Background Worker |
| - Auth & Profiles |           |  Engine           |               | - APScheduler     |
| - Events & CRUD   |           |  - BaseConnector  |               | - 30s Dispatch    |
| - Attendance Calc |           |  - Deduplication  |               | - Email Reminders |
| - CGPA Predictor  |           |  - Normalization  |               | - Sync Schedules  |
| - Study Planner   |           |  - Change Detect  |               +-------------------+
+---------+---------+           +---------+---------+                         |
          |                               |                                   |
          +-------------------------------+-----------------------------------+
                                          |
                                          v
                     +---------------------------------------+
                     |     Relational Database Engine        |
                     |   (SQLite / PostgreSQL + Alembic)     |
                     +---------------------------------------+
```

---

## 3. Modular Connector Architecture
Every integration implements the `BaseConnector` abstract class:
```python
class BaseConnector(ABC):
    def check_connection(self) -> Dict[str, Any]: ...
    def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]: ...
    def disconnect(self) -> bool: ...
    def fetch_courses(self) -> List[Dict[str, Any]]: ...
    def fetch_assignments(self) -> List[NormalizedAssignment]: ...
    def sync(self) -> Dict[str, Any]: ...
```

### Connector Status States
- `not_connected`: Platform is available but the student has not authorized it.
- `connected`: Active authentication token exists and is valid.
- `syncing`: Ingestion job currently in progress.
- `synced`: Recent successful synchronization.
- `sync_failed`: Error during API call; error recorded in `sync_errors`.
- `unavailable`: Direct API not exposed by institution (e.g. VTOP). Clearly marked with manual import options.

---

## 4. Deduplication & Idempotency
To prevent duplicate assignment records during synchronization runs, database-level unique constraints are enforced:
$$\text{UniqueKey} = (\text{user\_id}, \text{source\_platform}, \text{external\_id})$$

When an assignment's deadline changes upstream:
1. The existing event record is updated with the new date.
2. The deadline change is logged.
3. Associated pending notifications in `scheduled_notifications` are dynamically rescheduled.
4. **Manual academic events** are strictly preserved and never overwritten or removed by platform synchronization.
