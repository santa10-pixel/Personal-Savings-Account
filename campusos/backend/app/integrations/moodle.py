from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from campusos.backend.app.integrations.base import BaseConnector, NormalizedAssignment
from campusos.backend.app.core.config import settings

class MoodleConnector(BaseConnector):
    def __init__(self, connection_record=None):
        super().__init__("moodle")
        self.connection = connection_record

    def check_connection(self) -> Dict[str, Any]:
        if not settings.MOODLE_API_TOKEN and not (self.connection and self.connection.access_token):
            return {
                "status": "not_connected",
                "configured": False,
                "message": "VIT Moodle Web Services token not configured.",
                "supported_data_types": ["digital_assignments", "quizzes", "course_materials"]
            }

        return {
            "status": "connected",
            "configured": True,
            "message": "Connected to VIT LMS (lms.vit.ac.in)",
            "supported_data_types": ["digital_assignments", "quizzes", "course_materials"]
        }

    def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        token = auth_payload.get("token", "moodle_mock_ws_token")
        email = auth_payload.get("email", "student@vitstudent.ac.in")
        return {
            "success": True,
            "auth_status": "connected",
            "token": token,
            "email": email
        }

    def disconnect(self) -> bool:
        return True

    def fetch_courses(self) -> List[Dict[str, Any]]:
        return [
            {"id": "mdl_cse3001", "name": "CSE3001 - Database Systems (Fall 26)", "shortname": "CSE3001"},
            {"id": "mdl_eng1011", "name": "ENG1011 - Technical English", "shortname": "ENG1011"}
        ]

    def fetch_assignments(self) -> List[NormalizedAssignment]:
        now = datetime.now(timezone.utc)
        return [
            NormalizedAssignment(
                external_id="mdl_task_301",
                title="Moodle: CSE3001 SQL Normalization (DA-2)",
                description="Upload SQL queries and ER diagram addressing 3NF / BCNF requirements.",
                course_name="Database Systems",
                course_code="CSE3001",
                due_date=now + timedelta(days=2),
                due_time="23:59",
                original_url="https://lms.vit.ac.in/mod/assign/view.php?id=301",
                priority="high",
                submission_status="pending"
            ),
            NormalizedAssignment(
                external_id="mdl_task_302",
                title="Moodle: ENG1011 Technical Report Writing Case Study",
                description="Submit 1500-word engineering ethics whitepaper PDF.",
                course_name="Professional Communication",
                course_code="ENG1011",
                due_date=now + timedelta(days=14),
                due_time="20:00",
                original_url="https://lms.vit.ac.in/mod/assign/view.php?id=302",
                priority="low",
                submission_status="pending"
            )
        ]

    def sync(self) -> Dict[str, Any]:
        assignments = self.fetch_assignments()
        return {
            "status": "success",
            "count": len(assignments),
            "assignments": assignments
        }
