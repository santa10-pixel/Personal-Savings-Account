from typing import List, Dict, Any
from campusos.backend.app.integrations.base import BaseConnector, NormalizedAssignment

class IPilotConnector(BaseConnector):
    def __init__(self, connection_record=None):
        super().__init__("ipilot")
        self.connection = connection_record

    def check_connection(self) -> Dict[str, Any]:
        return {
            "status": "unavailable",
            "configured": False,
            "message": "iPilot assessment lab integration is currently in institutional roadmap phase.",
            "supported_data_types": ["lab_exams", "coding_tests"]
        }

    def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "success": False,
            "auth_status": "unavailable",
            "message": "iPilot integration not available."
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
            "message": "Integration unavailable"
        }
