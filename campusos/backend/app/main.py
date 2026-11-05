from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from campusos.backend.app.core.config import settings
from campusos.backend.app.database.session import engine, Base, get_db
import campusos.backend.app.models.entities  # Ensure all models are registered

# Import routers
from campusos.backend.app.api.auth import router as auth_router
from campusos.backend.app.api.dashboard import router as dashboard_router
from campusos.backend.app.api.events import router as events_router
from campusos.backend.app.api.subjects import router as subjects_router
from campusos.backend.app.api.attendance import router as attendance_router
from campusos.backend.app.api.timetable import router as timetable_router
from campusos.backend.app.api.marks import router as marks_router
from campusos.backend.app.api.sync import router as sync_router
from campusos.backend.app.api.study_planner import router as study_planner_router
from campusos.backend.app.api.notifications import router as notifications_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusOS API",
    description="Backend API for CampusOS — Unified Academic Companion for VIT Students",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    return {
        "status": "healthy",
        "service": "CampusOS Backend API",
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "connected"
    }

# Mount API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(subjects_router, prefix=settings.API_V1_STR)
app.include_router(attendance_router, prefix=settings.API_V1_STR)
app.include_router(timetable_router, prefix=settings.API_V1_STR)
app.include_router(marks_router, prefix=settings.API_V1_STR)
app.include_router(sync_router, prefix=settings.API_V1_STR)
app.include_router(study_planner_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("campusos.backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
