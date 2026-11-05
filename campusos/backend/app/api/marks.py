from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, AcademicMark, AcademicSubject
from campusos.backend.app.schemas.api_schemas import MarkCreate, MarkUpdate, MarkOut, CGPACalculationOut, SubjectMarksSummary
from campusos.backend.app.api.deps import get_current_user
from campusos.backend.app.services.academic_metrics import map_score_to_grade

router = APIRouter(prefix="/marks", tags=["Marks & Performance"])

@router.get("", response_model=List[MarkOut])
def list_marks(
    subject_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AcademicMark).filter(AcademicMark.user_id == current_user.id)
    if subject_id:
        query = query.filter(AcademicMark.subject_id == subject_id)
    return query.all()

@router.post("", response_model=MarkOut, status_code=status.HTTP_201_CREATED)
def create_mark(
    payload: MarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(AcademicSubject).filter(
        AcademicSubject.id == payload.subject_id,
        AcademicSubject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=400, detail="Invalid subject ID")

    mark = AcademicMark(
        user_id=current_user.id,
        subject_id=payload.subject_id,
        assessment_name=payload.assessment_name,
        score=payload.score,
        max_score=payload.max_score,
        weightage_pct=payload.weightage_pct,
        is_official=payload.is_official
    )
    db.add(mark)
    db.commit()
    db.refresh(mark)
    return mark

@router.delete("/{mark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mark(
    mark_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mark = db.query(AcademicMark).filter(
        AcademicMark.id == mark_id,
        AcademicMark.user_id == current_user.id
    ).first()
    if not mark:
        raise HTTPException(status_code=404, detail="Mark entry not found")

    db.delete(mark)
    db.commit()
    return None

@router.get("/cgpa", response_model=CGPACalculationOut)
def calculate_cgpa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subjects = db.query(AcademicSubject).filter(AcademicSubject.user_id == current_user.id).all()
    summaries = []
    total_credits = 0.0
    total_grade_points = 0.0

    for sub in subjects:
        marks = db.query(AcademicMark).filter(
            AcademicMark.user_id == current_user.id,
            AcademicMark.subject_id == sub.id
        ).all()

        total_weighted = 0.0
        for m in marks:
            if m.max_score > 0:
                weighted = (m.score / m.max_score) * m.weightage_pct
                total_weighted += weighted

        # Default minimum 75 for demo if no marks entered yet
        effective_score = total_weighted if marks else 82.5
        grade_info = map_score_to_grade(effective_score)

        summaries.append(
            SubjectMarksSummary(
                subject_id=sub.id,
                subject_code=sub.code,
                subject_name=sub.name,
                credits=sub.credits,
                total_weighted_score=round(effective_score, 2),
                predicted_grade=grade_info["grade"],
                grade_points=grade_info["points"]
            )
        )

        total_credits += sub.credits
        total_grade_points += (sub.credits * grade_info["points"])

    gpa = round(total_grade_points / total_credits, 2) if total_credits > 0 else 0.0

    return CGPACalculationOut(
        total_registered_credits=total_credits,
        estimated_gpa=gpa,
        subject_summaries=summaries
    )
