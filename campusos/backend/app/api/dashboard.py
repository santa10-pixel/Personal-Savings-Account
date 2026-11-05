import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, AcademicEvent, AttendanceRecord, TimetableEntry
from campusos.backend.app.schemas.api_schemas import DashboardStats, EventOut
from campusos.backend.app.api.deps import get_current_user
from typing import List

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.datetime.now(datetime.timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + datetime.timedelta(days=1)
    week_end = today_start + datetime.timedelta(days=7)

    # Events queries
    events_query = db.query(AcademicEvent).filter(AcademicEvent.user_id == current_user.id)

    total_pending = events_query.filter(AcademicEvent.completion_status == "pending").count()
    due_today = events_query.filter(
        AcademicEvent.completion_status == "pending",
        AcademicEvent.due_date >= today_start,
        AcademicEvent.due_date < today_end
    ).count()

    due_this_week = events_query.filter(
        AcademicEvent.completion_status == "pending",
        AcademicEvent.due_date >= today_start,
        AcademicEvent.due_date <= week_end
    ).count()

    overdue = events_query.filter(
        AcademicEvent.completion_status == "pending",
        AcademicEvent.due_date < today_start
    ).count()

    completed = events_query.filter(AcademicEvent.completion_status == "completed").count()

    upcoming_exams = events_query.filter(
        AcademicEvent.completion_status == "pending",
        AcademicEvent.event_type.in_(["Midterm", "CAT", "FAT", "PAT", "Lab Exam", "Practical Exam"])
    ).count()

    # Attendance average
    attendance_records = db.query(AttendanceRecord).filter(AttendanceRecord.user_id == current_user.id).all()
    avg_attendance = 0.0
    if attendance_records:
        total_pct = sum([(r.attended_classes / r.total_classes * 100.0) for r in attendance_records if r.total_classes > 0])
        avg_attendance = round(total_pct / len(attendance_records), 1)

    return DashboardStats(
        total_pending=total_pending,
        due_today=due_today,
        due_this_week=due_this_week,
        overdue=overdue,
        completed=completed,
        upcoming_exams=upcoming_exams,
        attendance_average=avg_attendance,
        semester_progress_pct=68.0
    )

@router.get("/focus", response_model=List[EventOut])
def get_todays_focus(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Returns top priority upcoming pending items
    events = db.query(AcademicEvent).filter(
        AcademicEvent.user_id == current_user.id,
        AcademicEvent.completion_status == "pending"
    ).order_by(AcademicEvent.due_date.asc()).limit(5).all()

    return events
