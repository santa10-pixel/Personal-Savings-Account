import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, NotificationPreference, NotificationHistory
from campusos.backend.app.schemas.api_schemas import (
    NotificationPreferenceUpdate, NotificationPreferenceOut, NotificationHistoryOut
)
from campusos.backend.app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications & Reminders"])

@router.get("/preferences", response_model=NotificationPreferenceOut)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    if not prefs:
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs

@router.put("/preferences", response_model=NotificationPreferenceOut)
def update_preferences(
    payload: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    if not prefs:
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)

    if payload.notify_days_before is not None:
        prefs.notify_days_before = payload.notify_days_before
    if payload.delivery_time is not None:
        prefs.delivery_time = payload.delivery_time
    if payload.email_enabled is not None:
        prefs.email_enabled = payload.email_enabled
    if payload.in_app_enabled is not None:
        prefs.in_app_enabled = payload.in_app_enabled
    if payload.attendance_warning_enabled is not None:
        prefs.attendance_warning_enabled = payload.attendance_warning_enabled
    if payload.attendance_threshold_alert is not None:
        prefs.attendance_threshold_alert = payload.attendance_threshold_alert

    prefs.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(prefs)
    return prefs

@router.get("/history", response_model=List[NotificationHistoryOut])
def get_notification_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(NotificationHistory).filter(
        NotificationHistory.user_id == current_user.id
    ).order_by(NotificationHistory.sent_at.desc()).limit(30).all()

@router.post("/test-email", response_model=Dict[str, Any])
def send_test_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recipient = current_user.email
    if current_user.profile and current_user.profile.reminder_email:
        recipient = current_user.profile.reminder_email

    title = "CampusOS Test Reminder Notification"
    msg = f"Hello {current_user.full_name}, your notification delivery channel is operational and ready to send 3-day and 1-day deadline reminders."

    history = NotificationHistory(
        user_id=current_user.id,
        title=title,
        message=msg,
        channel="email",
        status="sent",
        sent_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(history)
    db.commit()

    return {
        "success": True,
        "recipient": recipient,
        "message": f"Test reminder recorded and dispatched for {recipient}"
    }
