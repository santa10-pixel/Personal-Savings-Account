from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, StudySession, AcademicEvent
from campusos.backend.app.schemas.api_schemas import StudyPlanGenerate, StudySessionOut
from campusos.backend.app.api.deps import get_current_user
from campusos.backend.app.services.study_planner import generate_study_plan

router = APIRouter(prefix="/study-planner", tags=["Smart Study Planner"])

@router.post("/generate", response_model=List[StudySessionOut])
def create_study_plan(
    payload: StudyPlanGenerate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        sessions = generate_study_plan(
            db=db,
            user=current_user,
            event_id=payload.event_id,
            start_date=payload.start_date,
            daily_available_hours=payload.daily_available_hours,
            subject_difficulty=payload.subject_difficulty,
            topics=payload.topics
        )
        return sessions
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/event/{event_id}", response_model=List[StudySessionOut])
def get_event_study_sessions(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(AcademicEvent).filter(
        AcademicEvent.id == event_id,
        AcademicEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return db.query(StudySession).filter(
        StudySession.event_id == event_id,
        StudySession.user_id == current_user.id
    ).order_by(StudySession.session_date.asc()).all()

@router.patch("/session/{session_id}/toggle", response_model=StudySessionOut)
def toggle_session_completed(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sess = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id
    ).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Study session not found")

    sess.is_completed = not sess.is_completed
    db.commit()
    db.refresh(sess)
    return sess
