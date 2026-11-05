from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from campusos.backend.app.models.entities import (
    User, AcademicEvent, AcademicSubject, PlatformConnection, SyncHistory, SyncError
)
from campusos.backend.app.integrations.google_classroom import GoogleClassroomConnector
from campusos.backend.app.integrations.microsoft_teams import MicrosoftTeamsConnector
from campusos.backend.app.integrations.moodle import MoodleConnector
from campusos.backend.app.integrations.vtop import VTOPConnector
from campusos.backend.app.integrations.vit_colab import VITCoLabConnector
from campusos.backend.app.integrations.ipilot import IPilotConnector
from campusos.backend.app.services.notification_scheduler import schedule_event_notifications

def get_connector_for_platform(platform_name: str, connection_record=None):
    if platform_name == "google_classroom":
        return GoogleClassroomConnector(connection_record)
    elif platform_name == "microsoft_teams":
        return MicrosoftTeamsConnector(connection_record)
    elif platform_name == "moodle":
        return MoodleConnector(connection_record)
    elif platform_name == "vtop":
        return VTOPConnector(connection_record)
    elif platform_name == "vit_colab":
        return VITCoLabConnector(connection_record)
    elif platform_name == "ipilot":
        return IPilotConnector(connection_record)
    return None

def sync_platform_for_user(db: Session, user: User, platform_name: str) -> Dict[str, Any]:
    connection = db.query(PlatformConnection).filter(
        PlatformConnection.user_id == user.id,
        PlatformConnection.platform_name == platform_name
    ).first()

    connector = get_connector_for_platform(platform_name, connection)
    if not connector:
        return {"platform_name": platform_name, "status": "failed", "items_added": 0, "items_updated": 0, "message": "Unknown platform"}

    status_check = connector.check_connection()
    if status_check.get("status") == "unavailable":
        return {
            "platform_name": platform_name,
            "status": "unavailable",
            "items_added": 0,
            "items_updated": 0,
            "message": status_check.get("message", "Integration unavailable")
        }

    # If connection record does not exist or not connected, mark as not connected
    if not connection or connection.auth_status != "connected":
        return {
            "platform_name": platform_name,
            "status": "not_connected",
            "items_added": 0,
            "items_updated": 0,
            "message": "Platform is not connected"
        }

    started_at = datetime.now(timezone.utc)
    try:
        assignments = connector.fetch_assignments()
        items_added = 0
        items_updated = 0

        for item in assignments:
            # Check if subject exists or create it
            subject = None
            if item.course_code:
                subject = db.query(AcademicSubject).filter(
                    AcademicSubject.user_id == user.id,
                    AcademicSubject.code == item.course_code
                ).first()
                if not subject:
                    subject = AcademicSubject(
                        user_id=user.id,
                        code=item.course_code,
                        name=item.course_name,
                        credits=3.0,
                        color="#176d50"
                    )
                    db.add(subject)
                    db.flush()

            # Deduplication check: user_id + source_platform + external_id
            existing_event = db.query(AcademicEvent).filter(
                AcademicEvent.user_id == user.id,
                AcademicEvent.source_platform == platform_name,
                AcademicEvent.external_id == item.external_id
            ).first()

            if existing_event:
                # Detect changed deadlines or titles
                deadline_changed = existing_event.due_date != item.due_date
                existing_event.title = item.title
                existing_event.description = item.description
                existing_event.due_date = item.due_date
                existing_event.due_time = item.due_time
                existing_event.priority = item.priority
                existing_event.original_url = item.original_url
                existing_event.last_synced_at = datetime.now(timezone.utc)
                if subject and not existing_event.subject_id:
                    existing_event.subject_id = subject.id

                items_updated += 1

                # If deadline changed, reschedule reminders
                if deadline_changed:
                    schedule_event_notifications(db, existing_event)
            else:
                new_event = AcademicEvent(
                    user_id=user.id,
                    subject_id=subject.id if subject else None,
                    title=item.title,
                    description=item.description,
                    event_type="Assignment",
                    source_platform=platform_name,
                    external_id=item.external_id,
                    original_url=item.original_url,
                    due_date=item.due_date,
                    due_time=item.due_time,
                    priority=item.priority,
                    completion_status=item.submission_status,
                    is_manual=False,
                    last_synced_at=datetime.now(timezone.utc)
                )
                db.add(new_event)
                db.flush()
                items_added += 1

                # Schedule notifications
                schedule_event_notifications(db, new_event)

        connection.last_synced_at = datetime.now(timezone.utc)
        connection.auth_status = "connected"
        connection.last_error_message = None

        history = SyncHistory(
            user_id=user.id,
            platform_name=platform_name,
            sync_status="success",
            items_added=items_added,
            items_updated=items_updated,
            started_at=started_at,
            completed_at=datetime.now(timezone.utc)
        )
        db.add(history)
        db.commit()

        return {
            "platform_name": platform_name,
            "status": "success",
            "items_added": items_added,
            "items_updated": items_updated,
            "message": f"Successfully synchronized ({items_added} new, {items_updated} updated)"
        }

    except Exception as e:
        db.rollback()
        err_msg = str(e)
        if connection:
            connection.auth_status = "sync_failed"
            connection.last_error_message = err_msg

        sync_err = SyncError(
            user_id=user.id,
            platform_name=platform_name,
            error_code="SYNC_FAILED",
            error_message=err_msg
        )
        db.add(sync_err)
        db.commit()

        return {
            "platform_name": platform_name,
            "status": "failed",
            "items_added": 0,
            "items_updated": 0,
            "message": f"Sync failed: {err_msg}"
        }

def sync_all_platforms_for_user(db: Session, user: User) -> List[Dict[str, Any]]:
    platforms = [
        "google_classroom",
        "microsoft_teams",
        "moodle",
        "vtop",
        "vit_colab",
        "ipilot"
    ]
    results = []
    for p in platforms:
        res = sync_platform_for_user(db, user, p)
        results.append(res)
    return results
