import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, AcademicEvent, AcademicSubject
from campusos.backend.app.schemas.api_schemas import EventCreate, EventUpdate, EventOut
from campusos.backend.app.api.deps import get_current_user
from campusos.backend.app.services.notification_scheduler import schedule_event_notifications

router = APIRouter(prefix="/events", tags=["Academic Events"])

@router.get("", response_model=List[EventOut])
def list_events(
    event_type: Optional[str] = None,
    completion_status: Optional[str] = None,
    priority: Optional[str] = None,
    subject_id: Optional[int] = None,
    source_platform: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "due_date",
    sort_order: str = "asc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AcademicEvent).filter(AcademicEvent.user_id == current_user.id)

    if event_type and event_type != "ALL":
        query = query.filter(AcademicEvent.event_type == event_type)
    if completion_status and completion_status != "ALL":
        query = query.filter(AcademicEvent.completion_status == completion_status)
    if priority and priority != "ALL":
        query = query.filter(AcademicEvent.priority == priority)
    if subject_id:
        query = query.filter(AcademicEvent.subject_id == subject_id)
    if source_platform and source_platform != "ALL":
        query = query.filter(AcademicEvent.source_platform == source_platform)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (AcademicEvent.title.ilike(s)) |
            (AcademicEvent.description.ilike(s)) |
            (AcademicEvent.venue.ilike(s))
        )

    if sort_by == "due_date":
        if sort_order == "desc":
            query = query.order_by(AcademicEvent.due_date.desc())
        else:
            query = query.order_by(AcademicEvent.due_date.asc())
    elif sort_by == "priority":
        query = query.order_by(AcademicEvent.priority.asc(), AcademicEvent.due_date.asc())
    else:
        query = query.order_by(AcademicEvent.due_date.asc())

    return query.all()

@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.subject_id:
        subject = db.query(AcademicSubject).filter(
            AcademicSubject.id == payload.subject_id,
            AcademicSubject.user_id == current_user.id
        ).first()
        if not subject:
            raise HTTPException(status_code=400, detail="Invalid subject ID for this student")

    event = AcademicEvent(
        user_id=current_user.id,
        subject_id=payload.subject_id,
        title=payload.title,
        description=payload.description,
        event_type=payload.event_type,
        source_platform="manual",
        due_date=payload.due_date,
        due_time=payload.due_time or "23:59",
        timezone=payload.timezone or "Asia/Kolkata",
        priority=payload.priority,
        completion_status="pending",
        is_manual=True,
        heard_from=payload.heard_from,
        venue=payload.venue
    )
    db.add(event)
    db.flush()

    # Schedule notification reminders
    schedule_event_notifications(db, event)

    db.commit()
    db.refresh(event)
    return event

@router.get("/{event_id}", response_model=EventOut)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(AcademicEvent).filter(
        AcademicEvent.id == event_id,
        AcademicEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Academic event not found")
    return event

@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(AcademicEvent).filter(
        AcademicEvent.id == event_id,
        AcademicEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Academic event not found")

    date_changed = False
    if payload.due_date is not None and payload.due_date != event.due_date:
        date_changed = True
        event.due_date = payload.due_date

    if payload.title is not None:
        event.title = payload.title
    if payload.description is not None:
        event.description = payload.description
    if payload.event_type is not None:
        event.event_type = payload.event_type
    if payload.due_time is not None:
        event.due_time = payload.due_time
    if payload.priority is not None:
        event.priority = payload.priority
    if payload.completion_status is not None:
        event.completion_status = payload.completion_status
    if payload.heard_from is not None:
        event.heard_from = payload.heard_from
    if payload.venue is not None:
        event.venue = payload.venue
    if payload.subject_id is not None:
        event.subject_id = payload.subject_id

    event.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    if date_changed or payload.completion_status is not None:
        schedule_event_notifications(db, event)

    db.refresh(event)
    return event

@router.patch("/{event_id}/toggle-complete", response_model=EventOut)
def toggle_event_complete(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(AcademicEvent).filter(
        AcademicEvent.id == event_id,
        AcademicEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Academic event not found")

    if event.completion_status == "completed":
        event.completion_status = "pending"
    else:
        event.completion_status = "completed"

    event.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    schedule_event_notifications(db, event)
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(AcademicEvent).filter(
        AcademicEvent.id == event_id,
        AcademicEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Academic event not found")

    db.delete(event)
    db.commit()
    return None
