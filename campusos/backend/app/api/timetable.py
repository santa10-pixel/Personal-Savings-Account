import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, TimetableEntry, AcademicSubject
from campusos.backend.app.schemas.api_schemas import TimetableCreate, TimetableUpdate, TimetableOut
from campusos.backend.app.api.deps import get_current_user

router = APIRouter(prefix="/timetable", tags=["Timetable"])

@router.get("", response_model=List[TimetableOut])
def list_timetable(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(TimetableEntry).filter(
        TimetableEntry.user_id == current_user.id
    ).order_by(TimetableEntry.day_of_week.asc(), TimetableEntry.start_time.asc()).all()

@router.get("/today", response_model=List[TimetableOut])
def get_today_timetable(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Python weekday(): 0=Monday, 6=Sunday
    today_dow = datetime.datetime.now().weekday()
    return db.query(TimetableEntry).filter(
        TimetableEntry.user_id == current_user.id,
        TimetableEntry.day_of_week == today_dow
    ).order_by(TimetableEntry.start_time.asc()).all()

@router.post("", response_model=TimetableOut, status_code=status.HTTP_201_CREATED)
def create_timetable_entry(
    payload: TimetableCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(AcademicSubject).filter(
        AcademicSubject.id == payload.subject_id,
        AcademicSubject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=400, detail="Invalid subject ID")

    # Overlap check
    overlap = db.query(TimetableEntry).filter(
        TimetableEntry.user_id == current_user.id,
        TimetableEntry.day_of_week == payload.day_of_week,
        TimetableEntry.start_time == payload.start_time
    ).first()
    if overlap:
        raise HTTPException(
            status_code=400,
            detail=f"Timetable slot conflict: another class ({overlap.subject.code}) is already scheduled at {payload.start_time} on this day."
        )

    entry = TimetableEntry(
        user_id=current_user.id,
        subject_id=payload.subject_id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        slot_name=payload.slot_name or subject.slot,
        classroom=payload.classroom or subject.default_venue,
        course_type=payload.course_type
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(TimetableEntry).filter(
        TimetableEntry.id == entry_id,
        TimetableEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    db.delete(entry)
    db.commit()
    return None
