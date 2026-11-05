import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from campusos.backend.app.database.session import get_db
from campusos.backend.app.models.entities import User, PlatformConnection, SyncHistory
from campusos.backend.app.schemas.api_schemas import PlatformConnectionOut, SyncReport, SyncResult
from campusos.backend.app.api.deps import get_current_user
from campusos.backend.app.sync.engine import sync_all_platforms_for_user, sync_platform_for_user, get_connector_for_platform

router = APIRouter(prefix="/sync", tags=["Synchronization & Integrations"])

PLATFORMS = ["google_classroom", "microsoft_teams", "moodle", "vtop", "vit_colab", "ipilot"]

@router.get("/status", response_model=List[PlatformConnectionOut])
def get_platforms_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = []
    for p_name in PLATFORMS:
        conn = db.query(PlatformConnection).filter(
            PlatformConnection.user_id == current_user.id,
            PlatformConnection.platform_name == p_name
        ).first()

        connector = get_connector_for_platform(p_name, conn)
        check = connector.check_connection() if connector else {}

        # If no DB row yet, determine virtual representation
        auth_status = "not_connected"
        if conn:
            auth_status = conn.auth_status
        elif check.get("status") == "unavailable":
            auth_status = "unavailable"

        results.append(
            PlatformConnectionOut(
                id=conn.id if conn else 0,
                platform_name=p_name,
                auth_status=auth_status,
                external_account_email=conn.external_account_email if conn else None,
                last_synced_at=conn.last_synced_at if conn else None,
                last_attempted_at=conn.last_attempted_at if conn else None,
                last_error_message=conn.last_error_message if conn else check.get("message"),
                supported_data_types=check.get("supported_data_types", [])
            )
        )
    return results

@router.post("/all", response_model=SyncReport)
def sync_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sync_results = sync_all_platforms_for_user(db, current_user)
    items = []
    for r in sync_results:
        items.append(
            SyncResult(
                platform_name=r["platform_name"],
                status=r["status"],
                items_added=r["items_added"],
                items_updated=r["items_updated"],
                message=r.get("message")
            )
        )

    return SyncReport(
        synced_at=datetime.datetime.now(datetime.timezone.utc),
        results=items
    )

@router.post("/{platform_name}", response_model=SyncResult)
def sync_single_platform(
    platform_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if platform_name not in PLATFORMS:
        raise HTTPException(status_code=400, detail="Invalid platform name")

    res = sync_platform_for_user(db, current_user, platform_name)
    return SyncResult(
        platform_name=res["platform_name"],
        status=res["status"],
        items_added=res["items_added"],
        items_updated=res["items_updated"],
        message=res.get("message")
    )

@router.post("/{platform_name}/connect", response_model=Dict[str, Any])
def connect_platform(
    platform_name: str,
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if platform_name not in PLATFORMS:
        raise HTTPException(status_code=400, detail="Invalid platform name")

    conn = db.query(PlatformConnection).filter(
        PlatformConnection.user_id == current_user.id,
        PlatformConnection.platform_name == platform_name
    ).first()

    connector = get_connector_for_platform(platform_name, conn)
    res = connector.connect(payload)

    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Connection failed"))

    if not conn:
        conn = PlatformConnection(
            user_id=current_user.id,
            platform_name=platform_name,
            auth_status="connected",
            external_account_email=res.get("email"),
            access_token=res.get("token")
        )
        db.add(conn)
    else:
        conn.auth_status = "connected"
        conn.external_account_email = res.get("email")
        conn.access_token = res.get("token")
        conn.last_error_message = None

    db.commit()
    db.refresh(conn)
    return {"success": True, "message": f"Successfully connected to {platform_name}"}

@router.post("/{platform_name}/disconnect", response_model=Dict[str, Any])
def disconnect_platform(
    platform_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conn = db.query(PlatformConnection).filter(
        PlatformConnection.user_id == current_user.id,
        PlatformConnection.platform_name == platform_name
    ).first()

    if conn:
        conn.auth_status = "not_connected"
        conn.access_token = None
        conn.refresh_token = None
        db.commit()

    return {"success": True, "message": f"Disconnected {platform_name}"}

@router.get("/history", response_model=List[Dict[str, Any]])
def get_sync_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    histories = db.query(SyncHistory).filter(
        SyncHistory.user_id == current_user.id
    ).order_by(SyncHistory.started_at.desc()).limit(20).all()

    return [
        {
            "id": h.id,
            "platform_name": h.platform_name,
            "sync_status": h.sync_status,
            "items_added": h.items_added,
            "items_updated": h.items_updated,
            "error_message": h.error_message,
            "completed_at": h.completed_at
        }
        for h in histories
    ]
