from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from campusos.backend.app.integrations.base import BaseConnector, NormalizedAssignment
from campusos.backend.app.core.config import settings

class GoogleClassroomConnector(BaseConnector):
    def __init__(self, connection_record=None):
        super().__init__("google_classroom")
        self.connection = connection_record

    def check_connection(self) -> Dict[str, Any]:
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return {
                "status": "not_connected",
                "configured": False,
                "message": "Google Classroom OAuth credentials not configured in environment (GOOGLE_CLIENT_ID).",
                "supported_data_types": ["assignments", "coursework", "announcements"]
            }
        
        if self.connection and self.connection.access_token:
            return {
                "status": "connected",
                "configured": True,
                "account_email": self.connection.external_account_email,
                "supported_data_types": ["assignments", "coursework", "announcements"]
            }

        return {
            "status": "not_connected",
            "configured": True,
            "message": "Ready to connect with VIT student Google account.",
            "supported_data_types": ["assignments", "coursework", "announcements"]
        }

    def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        email = auth_payload.get("email", "student@vitstudent.ac.in")
        token = auth_payload.get("token", "gclass_mock_token_oauth2")
        return {
            "success": True,
            "auth_status": "connected",
            "email": email,
            "token": token
        }

    def disconnect(self) -> bool:
        return True

    def fetch_courses(self) -> List[Dict[str, Any]]:
        return [
            {"id": "gc_cse3002", "name": "CSE3002 - Internet of Things", "section": "Fall 2026"},
            {"id": "gc_mat2002", "name": "MAT2002 - Applied Linear Algebra", "section": "Fall 2026"}
        ]

    def fetch_assignments(self) -> List[NormalizedAssignment]:
        now = datetime.now(timezone.utc)
        return [
            NormalizedAssignment(
                external_id="gc_task_101",
                title="Google Classroom: IoT Sensor Interface Lab Write-up",
                description="Upload the breadboard circuit diagram and Arduino firmware sketch.",
                course_name="IOT & Applications",
                course_code="CSE3002",
                due_date=now + timedelta(days=4),
                due_time="23:59",
                original_url="https://classroom.google.com/c/gc_cse3002/a/101",
                priority="high",
                submission_status="pending"
            ),
            NormalizedAssignment(
                external_id="gc_task_102",
                title="Google Classroom: Linear Algebra Problem Set 4",
                description="Submit solved questions from Gilbert Strang Chapter 4.",
                course_name="Applied Linear Algebra",
                course_code="MAT2002",
                due_date=now + timedelta(days=9),
                due_time="17:00",
                original_url="https://classroom.google.com/c/gc_mat2002/a/102",
                priority="medium",
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
