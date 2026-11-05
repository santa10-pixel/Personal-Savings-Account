from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, AcademicSubject
from campusos.backend.app.schemas.api_schemas import SubjectCreate, SubjectUpdate, SubjectOut
from campusos.backend.app.api.deps import get_current_user

router = APIRouter(prefix="/subjects", tags=["Academic Subjects"])

@router.get("", response_model=List[SubjectOut])
def list_subjects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(AcademicSubject).filter(AcademicSubject.user_id == current_user.id).all()

@router.post("", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: SubjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(AcademicSubject).filter(
        AcademicSubject.user_id == current_user.id,
        AcademicSubject.code == payload.code.upper()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A subject with this course code already exists.")

    subject = AcademicSubject(
        user_id=current_user.id,
        code=payload.code.upper(),
        name=payload.name,
        faculty_name=payload.faculty_name,
        slot=payload.slot,
        credits=payload.credits,
        default_venue=payload.default_venue,
        color=payload.color or "#176d50"
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(AcademicSubject).filter(
        AcademicSubject.id == subject_id,
        AcademicSubject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if payload.name is not None:
        subject.name = payload.name
    if payload.faculty_name is not None:
        subject.faculty_name = payload.faculty_name
    if payload.slot is not None:
        subject.slot = payload.slot
    if payload.credits is not None:
        subject.credits = payload.credits
    if payload.default_venue is not None:
        subject.default_venue = payload.default_venue
    if payload.color is not None:
        subject.color = payload.color

    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(AcademicSubject).filter(
        AcademicSubject.id == subject_id,
        AcademicSubject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    db.delete(subject)
    db.commit()
    return None
