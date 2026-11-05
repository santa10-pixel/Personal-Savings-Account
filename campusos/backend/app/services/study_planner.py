from datetime import datetime, timedelta, timezone, date
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from campusos.backend.app.models.entities import AcademicEvent, StudySession, User

def generate_study_plan(
    db: Session,
    user: User,
    event_id: int,
    start_date: date,
    daily_available_hours: float,
    subject_difficulty: str,
    topics: List[str]
) -> List[StudySession]:
    event = db.query(AcademicEvent).filter(
        AcademicEvent.id == event_id,
        AcademicEvent.user_id == user.id
    ).first()

    if not event:
        raise ValueError("Academic event not found")

    exam_date = event.due_date.date()
    if start_date >= exam_date:
        raise ValueError("Study start date must be before the examination date")

    # Clear previous study sessions for this event
    db.query(StudySession).filter(
        StudySession.event_id == event.id,
        StudySession.user_id == user.id
    ).delete()

    total_days = (exam_date - start_date).days
    num_topics = max(1, len(topics))
    
    # Duration in minutes per session
    base_duration = int(daily_available_hours * 60)
    if subject_difficulty == "hard":
        base_duration = min(180, int(base_duration * 1.25))

    sessions = []
    current_d = start_date
    day_idx = 0

    while current_d < exam_date:
        topic_idx = day_idx % num_topics
        topic = topics[topic_idx] if topics else f"Module {topic_idx + 1} Review"

        # Special labels for final revision days
        days_left = (exam_date - current_d).days
        if days_left == 1:
            session_title = f"Final Revision & Formula Practice — {event.title}"
            topic_desc = "Complete mock test questions & review difficult concepts"
        elif days_left == 2:
            session_title = f"Comprehensive Problem Solving — {event.title}"
            topic_desc = f"Solve previous FAT/CAT question papers on {topic}"
        else:
            session_title = f"Study Session: {topic}"
            topic_desc = f"Concept deep dive and practice for {topic}"

        session_datetime = datetime.combine(current_d, datetime.min.time(), tzinfo=timezone.utc).replace(hour=18, minute=0)

        new_session = StudySession(
            user_id=user.id,
            event_id=event.id,
            title=session_title,
            session_date=session_datetime,
            start_time="18:00",
            duration_minutes=base_duration,
            topic=topic_desc,
            is_completed=False
        )
        db.add(new_session)
        sessions.append(new_session)

        current_d += timedelta(days=1)
        day_idx += 1

    db.commit()
    return sessions
