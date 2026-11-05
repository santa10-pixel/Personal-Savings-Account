from typing import List, Dict, Any, Optional
from campusos.backend.app.integrations.base import BaseConnector, NormalizedAssignment

class VTOPConnector(BaseConnector):
    def __init__(self, connection_record=None):
        super().__init__("vtop")
        self.connection = connection_record

    def check_connection(self) -> Dict[str, Any]:
        return {
            "status": "unavailable",
            "configured": False,
            "message": "Official VTOP integration is not currently available.",
            "manual_import_available": True,
            "supported_data_types": ["attendance", "timetable", "marks"]
        }

    def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "success": False,
            "auth_status": "unavailable",
            "message": "Official VTOP integration is not currently available. Please use the Manual Data Entry or CSV/JSON import feature."
        }

    def disconnect(self) -> bool:
        return True

    def fetch_courses(self) -> List[Dict[str, Any]]:
        return []

    def fetch_assignments(self) -> List[NormalizedAssignment]:
        return []

    def sync(self) -> Dict[str, Any]:
        return {
            "status": "unavailable",
            "count": 0,
            "message": "Official VTOP integration is not currently available."
        }
