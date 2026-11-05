import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, AttendanceRecord, AcademicSubject
from campusos.backend.app.schemas.api_schemas import AttendanceCreate, AttendanceUpdate, AttendanceOut
from campusos.backend.app.api.deps import get_current_user
from campusos.backend.app.services.academic_metrics import calculate_attendance_metrics

router = APIRouter(prefix="/attendance", tags=["Attendance Management"])

@router.get("", response_model=List[AttendanceOut])
def list_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(AttendanceRecord).filter(AttendanceRecord.user_id == current_user.id).all()
    results = []
    for r in records:
        metrics = calculate_attendance_metrics(r.attended_classes, r.total_classes, r.required_threshold)
        results.append(
            AttendanceOut(
                id=r.id,
                subject_id=r.subject_id,
                subject=r.subject,
                attended_classes=r.attended_classes,
                total_classes=r.total_classes,
                required_threshold=r.required_threshold,
                attendance_percentage=metrics["percentage"],
                can_miss_classes=metrics["can_miss_classes"],
                classes_needed_for_target=metrics["classes_needed_for_target"],
                is_official=r.is_official,
                last_updated=r.last_updated
            )
        )
    return results

@router.post("", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def create_or_update_attendance(
    payload: AttendanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(AcademicSubject).filter(
        AcademicSubject.id == payload.subject_id,
        AcademicSubject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=400, detail="Invalid subject ID")

    record = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.subject_id == payload.subject_id
    ).first()

    if not record:
        record = AttendanceRecord(
            user_id=current_user.id,
            subject_id=payload.subject_id,
            attended_classes=payload.attended_classes,
            total_classes=payload.total_classes,
            required_threshold=payload.required_threshold,
            is_official=False
        )
        db.add(record)
    else:
        record.attended_classes = payload.attended_classes
        record.total_classes = payload.total_classes
        record.required_threshold = payload.required_threshold
        record.last_updated = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(record)

    metrics = calculate_attendance_metrics(record.attended_classes, record.total_classes, record.required_threshold)
    return AttendanceOut(
        id=record.id,
        subject_id=record.subject_id,
        subject=record.subject,
        attended_classes=record.attended_classes,
        total_classes=record.total_classes,
        required_threshold=record.required_threshold,
        attendance_percentage=metrics["percentage"],
        can_miss_classes=metrics["can_miss_classes"],
        classes_needed_for_target=metrics["classes_needed_for_target"],
        is_official=record.is_official,
        last_updated=record.last_updated
    )

@router.put("/{record_id}", response_model=AttendanceOut)
def update_attendance_record(
    record_id: int,
    payload: AttendanceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(AttendanceRecord).filter(
        AttendanceRecord.id == record_id,
        AttendanceRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    if payload.attended_classes is not None:
        record.attended_classes = payload.attended_classes
    if payload.total_classes is not None:
        record.total_classes = payload.total_classes
    if payload.required_threshold is not None:
        record.required_threshold = payload.required_threshold

    record.last_updated = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(record)

    metrics = calculate_attendance_metrics(record.attended_classes, record.total_classes, record.required_threshold)
    return AttendanceOut(
        id=record.id,
        subject_id=record.subject_id,
        subject=record.subject,
        attended_classes=record.attended_classes,
        total_classes=record.total_classes,
        required_threshold=record.required_threshold,
        attendance_percentage=metrics["percentage"],
        can_miss_classes=metrics["can_miss_classes"],
        classes_needed_for_target=metrics["classes_needed_for_target"],
        is_official=record.is_official,
        last_updated=record.last_updated
    )

@router.post("/calculate", response_model=Dict[str, Any])
def calculate_standalone(payload: Dict[str, Any]):
    attended = int(payload.get("attended_classes", 0))
    total = int(payload.get("total_classes", 0))
    threshold = float(payload.get("required_threshold", 75.0))
    return calculate_attendance_metrics(attended, total, threshold)
