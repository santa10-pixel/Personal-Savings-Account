import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from campusos.backend.app.models.entities import (
    User, AcademicEvent, NotificationPreference, ScheduledNotification, NotificationHistory
)
from campusos.backend.app.core.config import settings

logger = logging.getLogger("campusos.notifications")

def schedule_event_notifications(db: Session, event: AcademicEvent):
    """
    Schedules notifications for an academic event based on user preferences.
    Prevents duplicate scheduling via deduplication_key.
    Never schedules for completed/cancelled tasks.
    """
    if event.completion_status in ["completed", "cancelled"]:
        # Cancel any pending notifications
        db.query(ScheduledNotification).filter(
            ScheduledNotification.event_id == event.id,
            ScheduledNotification.status == "pending"
        ).update({"status": "cancelled"})
        db.commit()
        return

    # Fetch user preferences
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == event.user_id
    ).first()

    days_before_list = [3, 1, 0]
    if prefs and prefs.notify_days_before:
        try:
            days_before_list = [int(x.strip()) for x in prefs.notify_days_before.split(",") if x.strip()]
        except Exception:
            days_before_list = [3, 1, 0]

    due = event.due_date
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)

    for days in days_before_list:
        reminder_type = f"{days}_days_before" if days > 0 else "today"
        scheduled_for = due - timedelta(days=days)

        # Build deduplication key
        dedup_key = f"rem_{event.user_id}_{event.id}_{reminder_type}"

        existing = db.query(ScheduledNotification).filter(
            ScheduledNotification.deduplication_key == dedup_key
        ).first()

        if existing:
            # If date changed and still pending, update schedule
            if existing.status == "pending":
                existing.scheduled_for = scheduled_for
        else:
            new_notif = ScheduledNotification(
                user_id=event.user_id,
                event_id=event.id,
                scheduled_for=scheduled_for,
                reminder_type=reminder_type,
                status="pending",
                deduplication_key=dedup_key
            )
            db.add(new_notif)

    db.commit()

def dispatch_due_notifications(db: Session) -> int:
    """
    Checks for pending notifications scheduled <= now and dispatches them.
    Used by the background worker process.
    """
    now = datetime.now(timezone.utc)
    due_notifications = db.query(ScheduledNotification).filter(
        ScheduledNotification.status == "pending",
        ScheduledNotification.scheduled_for <= now
    ).all()

    dispatched_count = 0
    for notif in due_notifications:
        event = db.query(AcademicEvent).filter(AcademicEvent.id == notif.event_id).first()
        if not event or event.completion_status in ["completed", "cancelled"]:
            notif.status = "cancelled"
            continue

        user = db.query(User).filter(User.id == notif.user_id).first()
        if not user:
            notif.status = "failed"
            continue

        recipient_email = user.email
        if user.profile and user.profile.reminder_email:
            recipient_email = user.profile.reminder_email

        subject_title = event.subject.name if event.subject else "Academic Event"
        title = f"CampusOS Reminder: {event.title} due soon"
        msg = (
            f"Hello {user.full_name},\n\n"
            f"This is an academic deadline reminder from CampusOS.\n\n"
            f"Task: {event.title}\n"
            f"Subject: {subject_title}\n"
            f"Due Date: {event.due_date.strftime('%d %B %Y')} ({event.due_time or '23:59'})\n"
            f"Priority: {event.priority.upper()}\n"
            f"Venue: {event.venue or 'Campus/Online'}\n\n"
            f"Open CampusOS to view and mark this task complete."
        )

        # Log or send email
        logger.info(f"[EMAIL DISPATCH] To: {recipient_email} | Subject: {title}")

        # Record in history
        history = NotificationHistory(
            user_id=user.id,
            event_id=event.id,
            title=title,
            message=msg,
            channel="email",
            status="sent",
            sent_at=now
        )
        db.add(history)
        notif.status = "sent"
        dispatched_count += 1

    db.commit()
    return dispatched_count
