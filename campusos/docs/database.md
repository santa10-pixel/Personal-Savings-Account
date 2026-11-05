# CampusOS Database Schema Specification

The application uses SQLAlchemy 2.0 ORM with Alembic migrations.

## 1. Relational Tables

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Primary user ID |
| `email` | VARCHAR(255) | UNIQUE, INDEX, NOT NULL | VIT university email |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(255) | NOT NULL | Student's full name |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active flag |
| `is_verified` | BOOLEAN | DEFAULT TRUE | Email verification flag |
| `created_at` | DATETIME | NOT NULL | Registration timestamp |
| `updated_at` | DATETIME | NOT NULL | Last update timestamp |

### `user_profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK | Profile ID |
| `user_id` | INTEGER | FK(users.id, CASCADE), UNIQUE | Linked user |
| `university` | VARCHAR(255) | DEFAULT 'VIT' | University name |
| `campus` | VARCHAR(100) | DEFAULT 'Vellore' | Vellore / Chennai / AP / Bhopal |
| `programme` | VARCHAR(100) | DEFAULT 'B.Tech' | Degree programme |
| `branch` | VARCHAR(100) | NOT NULL | Department / specialization |
| `year_of_study` | INTEGER | DEFAULT 3 | 1st - 4th year |
| `semester` | VARCHAR(50) | NOT NULL | E.g., Fall Semester 2026-27 |
| `registration_number` | VARCHAR(50) | NULLABLE | E.g., 21BCE1042 |
| `reminder_email` | VARCHAR(255) | NULLABLE | Preferred email for 8am alerts |
| `timezone` | VARCHAR(100) | DEFAULT 'Asia/Kolkata' | Timezone identifier |

### `academic_subjects`
- Course code (`CSE3002`), course name, faculty name, slot (`A1+TA1`), credits, venue, color code.
- Unique constraint: `(user_id, code)`.

### `academic_events`
- `id`, `user_id`, `subject_id` (FK, nullable)
- `title`, `description`, `event_type` (Assignment, Midterm, PAT, FAT, Lab Exam, Project Review, Quiz, Target)
- `source_platform` (`manual`, `google_classroom`, `microsoft_teams`, `moodle`, `vtop`)
- `external_id`, `original_url`
- `due_date`, `due_time`, `timezone`
- `priority` (`low`, `medium`, `high`)
- `completion_status` (`pending`, `completed`, `overdue`, `cancelled`)
- `is_manual` (boolean)
- `heard_from` (Faculty, WhatsApp, Self)
- `venue`
- Unique constraint: `(user_id, source_platform, external_id)`.

### `attendance_records`
- `user_id`, `subject_id`
- `attended_classes`, `total_classes`, `required_threshold` (default 75.0%)
- Unique constraint: `(user_id, subject_id)`.

### `timetable_entries`
- `user_id`, `subject_id`, `day_of_week` (0=Mon to 4=Fri), `start_time`, `end_time`, `slot_name`, `classroom`, `course_type`.

### `academic_marks`
- `user_id`, `subject_id`, `assessment_name` (CAT-1, CAT-2, DA-1, DA-2, Quiz), `score`, `max_score`, `weightage_pct`.

### `platform_connections`
- `user_id`, `platform_name`, `auth_status`, `external_account_email`, `access_token`, `refresh_token`, `last_synced_at`, `last_error_message`.
- Unique constraint: `(user_id, platform_name)`.

### `scheduled_notifications`
- `user_id`, `event_id`, `scheduled_for`, `reminder_type`, `status`, `deduplication_key` (UNIQUE).

### `study_sessions`
- `user_id`, `event_id`, `title`, `session_date`, `start_time`, `duration_minutes`, `topic`, `is_completed`.
