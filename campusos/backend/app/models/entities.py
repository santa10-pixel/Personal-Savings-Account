import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, UniqueConstraint, Enum
)
from sqlalchemy.orm import relationship
from campusos.backend.app.database.session import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    subjects = relationship("AcademicSubject", back_populates="user", cascade="all, delete-orphan")
    events = relationship("AcademicEvent", back_populates="user", cascade="all, delete-orphan")
    platform_connections = relationship("PlatformConnection", back_populates="user", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="user", cascade="all, delete-orphan")
    timetable_entries = relationship("TimetableEntry", back_populates="user", cascade="all, delete-orphan")
    marks = relationship("AcademicMark", back_populates="user", cascade="all, delete-orphan")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    scheduled_notifications = relationship("ScheduledNotification", back_populates="user", cascade="all, delete-orphan")
    notification_history = relationship("NotificationHistory", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    refresh_sessions = relationship("RefreshSession", back_populates="user", cascade="all, delete-orphan")
    sync_histories = relationship("SyncHistory", back_populates="user", cascade="all, delete-orphan")
    sync_errors = relationship("SyncError", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    university = Column(String(255), default="Vellore Institute of Technology")
    campus = Column(String(100), default="Vellore Campus")
    programme = Column(String(100), default="B.Tech")
    branch = Column(String(100), default="Computer Science & Engineering")
    year_of_study = Column(Integer, default=3)
    semester = Column(String(50), default="Fall Semester 2026-27")
    registration_number = Column(String(50), nullable=True)
    reminder_email = Column(String(255), nullable=True)
    timezone = Column(String(100), default="Asia/Kolkata")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="profile")


class AcademicSubject(Base):
    __tablename__ = "academic_subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    faculty_name = Column(String(255), nullable=True)
    slot = Column(String(50), nullable=True)
    credits = Column(Float, default=3.0)
    default_venue = Column(String(100), nullable=True)
    color = Column(String(50), default="#176d50")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="subjects")
    events = relationship("AcademicEvent", back_populates="subject", cascade="all, delete-orphan")
    attendance = relationship("AttendanceRecord", back_populates="subject", uselist=False, cascade="all, delete-orphan")
    timetable_entries = relationship("TimetableEntry", back_populates="subject", cascade="all, delete-orphan")
    marks = relationship("AcademicMark", back_populates="subject", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("user_id", "code", name="uq_user_subject_code"),
    )


class AcademicEvent(Base):
    __tablename__ = "academic_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("academic_subjects.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(50), default="Assignment")  # Assignment, Midterm, PAT, FAT, CAT, Lab Exam, Project Review, Viva, Target, Quiz, Other
    source_platform = Column(String(50), default="manual")  # manual, google_classroom, microsoft_teams, moodle, vtop, vit_colab, ipilot
    external_id = Column(String(255), nullable=True, index=True)
    original_url = Column(String(500), nullable=True)

    due_date = Column(DateTime(timezone=True), nullable=False, index=True)
    due_time = Column(String(20), nullable=True)
    timezone = Column(String(50), default="Asia/Kolkata")
    priority = Column(String(20), default="medium")  # low, medium, high
    completion_status = Column(String(30), default="pending")  # pending, completed, overdue, cancelled
    is_manual = Column(Boolean, default=True)
    heard_from = Column(String(100), nullable=True)  # Faculty, WhatsApp, Classroom, Self
    venue = Column(String(150), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="events")
    subject = relationship("AcademicSubject", back_populates="events")
    scheduled_notifications = relationship("ScheduledNotification", back_populates="event", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="event", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("user_id", "source_platform", "external_id", name="uq_user_platform_external_id"),
    )


class PlatformConnection(Base):
    __tablename__ = "platform_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform_name = Column(String(50), nullable=False)  # google_classroom, microsoft_teams, moodle, vtop, vit_colab, ipilot
    auth_status = Column(String(50), default="not_connected")  # not_connected, connected, syncing, synced, sync_failed, permission_required, unavailable
    external_account_email = Column(String(255), nullable=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    last_attempted_at = Column(DateTime(timezone=True), nullable=True)
    last_error_message = Column(Text, nullable=True)
    config_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="platform_connections")

    __table_args__ = (
        UniqueConstraint("user_id", "platform_name", name="uq_user_platform_connection"),
    )


class SyncHistory(Base):
    __tablename__ = "sync_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform_name = Column(String(50), nullable=False)
    sync_status = Column(String(30), nullable=False)  # success, failed, partial
    items_added = Column(Integer, default=0)
    items_updated = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="sync_histories")


class SyncError(Base):
    __tablename__ = "sync_errors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform_name = Column(String(50), nullable=False)
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="sync_errors")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("academic_subjects.id", ondelete="CASCADE"), nullable=False)
    attended_classes = Column(Integer, default=0)
    total_classes = Column(Integer, default=0)
    required_threshold = Column(Float, default=75.0)
    is_official = Column(Boolean, default=False)
    last_updated = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="attendance_records")
    subject = relationship("AcademicSubject", back_populates="attendance")

    __table_args__ = (
        UniqueConstraint("user_id", "subject_id", name="uq_user_subject_attendance"),
    )


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("academic_subjects.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
    start_time = Column(String(10), nullable=False)  # "08:00"
    end_time = Column(String(10), nullable=False)    # "08:50"
    slot_name = Column(String(30), nullable=True)    # "A1", "TA1", "L1+L2"
    classroom = Column(String(50), nullable=True)    # "SJT-412"
    course_type = Column(String(20), default="Theory") # Theory, Lab

    user = relationship("User", back_populates="timetable_entries")
    subject = relationship("AcademicSubject", back_populates="timetable_entries")


class AcademicMark(Base):
    __tablename__ = "academic_marks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("academic_subjects.id", ondelete="CASCADE"), nullable=False)
    assessment_name = Column(String(100), nullable=False)  # CAT-1, CAT-2, DA-1, DA-2, Quiz, PAT, FAT
    score = Column(Float, nullable=False)
    max_score = Column(Float, default=50.0)
    weightage_pct = Column(Float, default=15.0)
    is_official = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="marks")
    subject = relationship("AcademicSubject", back_populates="marks")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    notify_days_before = Column(String(50), default="3,1,0")  # 3 days, 1 day, and on due date
    delivery_time = Column(String(10), default="08:00")       # 08:00 AM
    email_enabled = Column(Boolean, default=True)
    in_app_enabled = Column(Boolean, default=True)
    attendance_warning_enabled = Column(Boolean, default=True)
    attendance_threshold_alert = Column(Float, default=80.0)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="notification_preferences")


class ScheduledNotification(Base):
    __tablename__ = "scheduled_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("academic_events.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_for = Column(DateTime(timezone=True), nullable=False, index=True)
    reminder_type = Column(String(50), default="deadline_reminder")  # 3_days_before, 1_day_before, today
    status = Column(String(30), default="pending")  # pending, sent, failed, cancelled
    deduplication_key = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="scheduled_notifications")
    event = relationship("AcademicEvent", back_populates="scheduled_notifications")


class NotificationHistory(Base):
    __tablename__ = "notification_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("academic_events.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    channel = Column(String(30), default="email")  # email, in_app
    status = Column(String(30), default="sent")    # sent, failed, read
    sent_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="notification_history")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("academic_events.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    session_date = Column(DateTime(timezone=True), nullable=False)
    start_time = Column(String(10), default="18:00")
    duration_minutes = Column(Integer, default=90)
    topic = Column(String(255), nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="study_sessions")
    event = relationship("AcademicEvent", back_populates="study_sessions")


class RefreshSession(Base):
    __tablename__ = "refresh_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="refresh_sessions")
