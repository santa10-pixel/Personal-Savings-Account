import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & Profile -----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    university: Optional[str] = "Vellore Institute of Technology"
    campus: Optional[str] = "Vellore Campus"
    programme: Optional[str] = "B.Tech"
    branch: Optional[str] = "Computer Science & Engineering"
    year_of_study: Optional[int] = 3
    semester: Optional[str] = "Fall Semester 2026-27"
    registration_number: Optional[str] = None
    reminder_email: Optional[EmailStr] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserProfileOut(BaseModel):
    university: str
    campus: str
    programme: str
    branch: str
    year_of_study: int
    semester: str
    registration_number: Optional[str] = None
    reminder_email: Optional[str] = None
    timezone: str

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    profile: Optional[UserProfileOut] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    university: Optional[str] = None
    campus: Optional[str] = None
    programme: Optional[str] = None
    branch: Optional[str] = None
    year_of_study: Optional[int] = None
    semester: Optional[str] = None
    registration_number: Optional[str] = None
    reminder_email: Optional[EmailStr] = None
    timezone: Optional[str] = None

# ----------------- Academic Subjects -----------------
class SubjectBase(BaseModel):
    code: str
    name: str
    faculty_name: Optional[str] = None
    slot: Optional[str] = None
    credits: float = 3.0
    default_venue: Optional[str] = None
    color: Optional[str] = "#176d50"

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    faculty_name: Optional[str] = None
    slot: Optional[str] = None
    credits: Optional[float] = None
    default_venue: Optional[str] = None
    color: Optional[str] = None

class SubjectOut(SubjectBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Academic Events -----------------
class EventBase(BaseModel):
    subject_id: Optional[int] = None
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    event_type: str = "Assignment"
    due_date: datetime.datetime
    due_time: Optional[str] = "23:59"
    timezone: Optional[str] = "Asia/Kolkata"
    priority: str = "medium"
    completion_status: str = "pending"
    is_manual: bool = True
    heard_from: Optional[str] = None
    venue: Optional[str] = None

class EventCreate(EventBase):
    source_platform: Optional[str] = "manual"
    external_id: Optional[str] = None
    original_url: Optional[str] = None

class EventUpdate(BaseModel):
    subject_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    due_time: Optional[str] = None
    priority: Optional[str] = None
    completion_status: Optional[str] = None
    heard_from: Optional[str] = None
    venue: Optional[str] = None

class EventOut(BaseModel):
    id: int
    subject_id: Optional[int] = None
    subject: Optional[SubjectOut] = None
    title: str
    description: Optional[str] = None
    event_type: str
    source_platform: str
    external_id: Optional[str] = None
    original_url: Optional[str] = None
    due_date: datetime.datetime
    due_time: Optional[str] = None
    timezone: str
    priority: str
    completion_status: str
    is_manual: bool
    heard_from: Optional[str] = None
    venue: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    last_synced_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# ----------------- Dashboard -----------------
class DashboardStats(BaseModel):
    total_pending: int
    due_today: int
    due_this_week: int
    overdue: int
    completed: int
    upcoming_exams: int
    attendance_average: float
    semester_progress_pct: float

# ----------------- Platform Connections -----------------
class PlatformConnectionOut(BaseModel):
    id: int
    platform_name: str
    auth_status: str
    external_account_email: Optional[str] = None
    last_synced_at: Optional[datetime.datetime] = None
    last_attempted_at: Optional[datetime.datetime] = None
    last_error_message: Optional[str] = None
    supported_data_types: List[str] = []

    class Config:
        from_attributes = True

class SyncResult(BaseModel):
    platform_name: str
    status: str
    items_added: int
    items_updated: int
    message: Optional[str] = None

class SyncReport(BaseModel):
    synced_at: datetime.datetime
    results: List[SyncResult]

# ----------------- Attendance -----------------
class AttendanceCreate(BaseModel):
    subject_id: int
    attended_classes: int = Field(..., ge=0)
    total_classes: int = Field(..., ge=0)
    required_threshold: float = 75.0

class AttendanceUpdate(BaseModel):
    attended_classes: Optional[int] = Field(None, ge=0)
    total_classes: Optional[int] = Field(None, ge=0)
    required_threshold: Optional[float] = None

class AttendanceOut(BaseModel):
    id: int
    subject_id: int
    subject: Optional[SubjectOut] = None
    attended_classes: int
    total_classes: int
    required_threshold: float
    attendance_percentage: float
    can_miss_classes: int
    classes_needed_for_target: int
    is_official: bool
    last_updated: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Timetable -----------------
class TimetableCreate(BaseModel):
    subject_id: int
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str
    end_time: str
    slot_name: Optional[str] = None
    classroom: Optional[str] = None
    course_type: str = "Theory"

class TimetableUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    slot_name: Optional[str] = None
    classroom: Optional[str] = None
    course_type: Optional[str] = None

class TimetableOut(BaseModel):
    id: int
    subject_id: int
    subject: Optional[SubjectOut] = None
    day_of_week: int
    start_time: str
    end_time: str
    slot_name: Optional[str] = None
    classroom: Optional[str] = None
    course_type: str

    class Config:
        from_attributes = True

# ----------------- Marks & CGPA -----------------
class MarkCreate(BaseModel):
    subject_id: int
    assessment_name: str
    score: float = Field(..., ge=0)
    max_score: float = Field(..., gt=0)
    weightage_pct: float = Field(..., ge=0)
    is_official: bool = False

class MarkUpdate(BaseModel):
    assessment_name: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[float] = None
    weightage_pct: Optional[float] = None

class MarkOut(BaseModel):
    id: int
    subject_id: int
    subject: Optional[SubjectOut] = None
    assessment_name: str
    score: float
    max_score: float
    weightage_pct: float
    is_official: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SubjectMarksSummary(BaseModel):
    subject_id: int
    subject_code: str
    subject_name: str
    credits: float
    total_weighted_score: float
    predicted_grade: str
    grade_points: float

class CGPACalculationOut(BaseModel):
    total_registered_credits: float
    estimated_gpa: float
    subject_summaries: List[SubjectMarksSummary]

# ----------------- Study Planner -----------------
class StudyPlanGenerate(BaseModel):
    event_id: int
    start_date: datetime.date
    daily_available_hours: float = 2.0
    subject_difficulty: str = "medium"  # easy, medium, hard
    topics: List[str]

class StudySessionOut(BaseModel):
    id: int
    event_id: int
    title: str
    session_date: datetime.datetime
    start_time: str
    duration_minutes: int
    topic: str
    is_completed: bool

    class Config:
        from_attributes = True

# ----------------- Notifications -----------------
class NotificationPreferenceUpdate(BaseModel):
    notify_days_before: Optional[str] = None
    delivery_time: Optional[str] = None
    email_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    attendance_warning_enabled: Optional[bool] = None
    attendance_threshold_alert: Optional[float] = None

class NotificationPreferenceOut(BaseModel):
    notify_days_before: str
    delivery_time: str
    email_enabled: bool
    in_app_enabled: bool
    attendance_warning_enabled: bool
    attendance_threshold_alert: float

    class Config:
        from_attributes = True

class NotificationHistoryOut(BaseModel):
    id: int
    event_id: Optional[int] = None
    title: str
    message: str
    channel: str
    status: str
    sent_at: datetime.datetime

    class Config:
        from_attributes = True
