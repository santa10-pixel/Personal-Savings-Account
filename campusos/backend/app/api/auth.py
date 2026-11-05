import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import (
    User, UserProfile, NotificationPreference, AcademicSubject, AcademicEvent, AttendanceRecord, TimetableEntry, AcademicMark
)
from campusos.backend.app.core.security import (
    get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
)
from campusos.backend.app.schemas.api_schemas import (
    UserRegister, UserLogin, TokenResponse, RefreshTokenRequest, UserOut, UserProfileUpdate
)
from campusos.backend.app.api.deps import get_current_user
from campusos.backend.app.services.notification_scheduler import schedule_event_notifications

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pw = get_password_hash(payload.password)
    user = User(
        email=payload.email.lower(),
        hashed_password=hashed_pw,
        full_name=payload.full_name,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.flush()

    # Create profile
    profile = UserProfile(
        user_id=user.id,
        university=payload.university or "Vellore Institute of Technology",
        campus=payload.campus or "Vellore Campus",
        programme=payload.programme or "B.Tech",
        branch=payload.branch or "Computer Science & Engineering",
        year_of_study=payload.year_of_study or 3,
        semester=payload.semester or "Fall Semester 2026-27",
        registration_number=payload.registration_number,
        reminder_email=payload.reminder_email or payload.email.lower()
    )
    db.add(profile)

    # Create default notification preference
    prefs = NotificationPreference(
        user_id=user.id,
        notify_days_before="3,1,0",
        delivery_time="08:00",
        email_enabled=True,
        in_app_enabled=True,
        attendance_warning_enabled=True,
        attendance_threshold_alert=80.0
    )
    db.add(prefs)

    # Seed starter subjects and sample academic milestones for VIT Fall 2026
    sub_iot = AcademicSubject(user_id=user.id, code="CSE3002", name="IOT & Applications", faculty_name="Dr. K. Raman", slot="A1+TA1", credits=4.0, color="#176d50", default_venue="SJT-412")
    sub_db = AcademicSubject(user_id=user.id, code="CSE3001", name="Database Systems", faculty_name="Prof. S. Priya", slot="B1+TB1", credits=4.0, color="#2563eb", default_venue="TT-304")
    sub_os = AcademicSubject(user_id=user.id, code="CSE2005", name="Operating Systems", faculty_name="Dr. V. Anand", slot="C1+TC1", credits=4.0, color="#7c3aed", default_venue="SJT-210")
    sub_se = AcademicSubject(user_id=user.id, code="SWE3001", name="Software Engineering", faculty_name="Prof. M. Karthik", slot="D1+TD1", credits=3.0, color="#d97706", default_venue="PRP-204")
    sub_mat = AcademicSubject(user_id=user.id, code="MAT2002", name="Applied Math", faculty_name="Dr. R. Meenakshi", slot="E1+TE1", credits=4.0, color="#dc2626", default_venue="MB-112")
    
    db.add_all([sub_iot, sub_db, sub_os, sub_se, sub_mat])
    db.flush()

    # Initial attendance records
    db.add_all([
        AttendanceRecord(user_id=user.id, subject_id=sub_iot.id, attended_classes=28, total_classes=30, required_threshold=75.0),
        AttendanceRecord(user_id=user.id, subject_id=sub_db.id, attended_classes=26, total_classes=30, required_threshold=75.0),
        AttendanceRecord(user_id=user.id, subject_id=sub_os.id, attended_classes=25, total_classes=30, required_threshold=75.0),
        AttendanceRecord(user_id=user.id, subject_id=sub_se.id, attended_classes=27, total_classes=30, required_threshold=75.0),
        AttendanceRecord(user_id=user.id, subject_id=sub_mat.id, attended_classes=23, total_classes=30, required_threshold=75.0),
    ])

    # Initial timetable slots
    db.add_all([
        TimetableEntry(user_id=user.id, subject_id=sub_iot.id, day_of_week=0, start_time="08:00", end_time="08:50", slot_name="A1", classroom="SJT-412", course_type="Theory"),
        TimetableEntry(user_id=user.id, subject_id=sub_db.id, day_of_week=1, start_time="08:00", end_time="08:50", slot_name="B1", classroom="TT-304", course_type="Theory"),
        TimetableEntry(user_id=user.id, subject_id=sub_os.id, day_of_week=2, start_time="08:00", end_time="08:50", slot_name="C1", classroom="SJT-210", course_type="Theory"),
        TimetableEntry(user_id=user.id, subject_id=sub_se.id, day_of_week=3, start_time="08:00", end_time="08:50", slot_name="D1", classroom="PRP-204", course_type="Theory"),
        TimetableEntry(user_id=user.id, subject_id=sub_mat.id, day_of_week=4, start_time="08:00", end_time="08:50", slot_name="E1", classroom="MB-112", course_type="Theory"),
    ])

    # Initial starter events
    now = datetime.datetime.now(datetime.timezone.utc)
    evt1 = AcademicEvent(
        user_id=user.id,
        subject_id=sub_iot.id,
        title="CSE3002 - Digital Assignment 3 (DA-3)",
        description="Design IoT MQTT gateway packet monitor and submit report on VTOP.",
        event_type="Assignment",
        source_platform="manual",
        due_date=now + datetime.timedelta(days=2),
        due_time="23:59",
        priority="high",
        completion_status="pending",
        is_manual=True,
        venue="VTOP Submission Portal"
    )
    evt2 = AcademicEvent(
        user_id=user.id,
        subject_id=sub_db.id,
        title="CSE3001 - Continuous Assessment Test 2 (CAT-2)",
        description="Syllabus: B-Trees, Query Optimization, Concurrency Control (2PL, Timestamp).",
        event_type="Midterm",
        source_platform="manual",
        due_date=now + datetime.timedelta(days=5),
        due_time="14:00",
        priority="high",
        completion_status="pending",
        is_manual=True,
        venue="TT-412"
    )
    evt3 = AcademicEvent(
        user_id=user.id,
        subject_id=sub_os.id,
        title="CSE2005 - Lab Practical Assessment Test (PAT)",
        description="Operating Systems IPC & Semaphore Synchronization Coding Assessment.",
        event_type="PAT",
        source_platform="manual",
        due_date=now + datetime.timedelta(days=9),
        due_time="10:00",
        priority="medium",
        completion_status="pending",
        is_manual=True,
        venue="SJT Lab 3"
    )
    db.add_all([evt1, evt2, evt3])
    db.flush()

    schedule_event_notifications(db, evt1)
    schedule_event_notifications(db, evt2)
    schedule_event_notifications(db, evt3)

    db.commit()

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is disabled")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = decoded.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if payload.university is not None:
        profile.university = payload.university
    if payload.campus is not None:
        profile.campus = payload.campus
    if payload.programme is not None:
        profile.programme = payload.programme
    if payload.branch is not None:
        profile.branch = payload.branch
    if payload.year_of_study is not None:
        profile.year_of_study = payload.year_of_study
    if payload.semester is not None:
        profile.semester = payload.semester
    if payload.registration_number is not None:
        profile.registration_number = payload.registration_number
    if payload.reminder_email is not None:
        profile.reminder_email = payload.reminder_email
    if payload.timezone is not None:
        profile.timezone = payload.timezone

    db.commit()
    db.refresh(current_user)
    return current_user
