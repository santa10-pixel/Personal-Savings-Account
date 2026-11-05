from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from campusos.backend.app.integrations.base import BaseConnector, NormalizedAssignment
from campusos.backend.app.core.config import settings

class MicrosoftTeamsConnector(BaseConnector):
    def __init__(self, connection_record=None):
        super().__init__("microsoft_teams")
        self.connection = connection_record

    def check_connection(self) -> Dict[str, Any]:
        if not settings.MICROSOFT_CLIENT_ID or not settings.MICROSOFT_CLIENT_SECRET:
            return {
                "status": "not_connected",
                "configured": False,
                "message": "Microsoft Graph OAuth credentials not configured in environment (MICROSOFT_CLIENT_ID).",
                "supported_data_types": ["assignments", "channel_meetings", "rubrics"]
            }
        
        if self.connection and self.connection.access_token:
            return {
                "status": "connected",
                "configured": True,
                "account_email": self.connection.external_account_email,
                "supported_data_types": ["assignments", "channel_meetings", "rubrics"]
            }

        return {
            "status": "not_connected",
            "configured": True,
            "message": "Ready to authenticate via Microsoft Entra ID (VIT tenant).",
            "supported_data_types": ["assignments", "channel_meetings", "rubrics"]
        }

    def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        email = auth_payload.get("email", "student@vitstudent.ac.in")
        token = auth_payload.get("token", "ms_teams_mock_token_oauth2")
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
            {"id": "ms_swe3001", "name": "SWE3001 Software Engineering Class Team", "role": "student"},
            {"id": "ms_cse2005", "name": "CSE2005 Operating Systems Lab Group", "role": "student"}
        ]

    def fetch_assignments(self) -> List[NormalizedAssignment]:
        now = datetime.now(timezone.utc)
        return [
            NormalizedAssignment(
                external_id="ms_task_201",
                title="MS Teams: SWE3001 Agile Sprint 2 User Story Backlog",
                description="Submit sprint backlog and Jira board link in general channel.",
                course_name="Software Engineering",
                course_code="SWE3001",
                due_date=now + timedelta(days=6),
                due_time="18:00",
                original_url="https://teams.microsoft.com/l/assignment/201",
                priority="high",
                submission_status="pending"
            ),
            NormalizedAssignment(
                external_id="ms_task_202",
                title="MS Teams: OS Shell Scripting Mini-Project",
                description="Shell script for memory monitoring and process logging.",
                course_name="Operating Systems",
                course_code="CSE2005",
                due_date=now + timedelta(days=11),
                due_time="23:59",
                original_url="https://teams.microsoft.com/l/assignment/202",
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
