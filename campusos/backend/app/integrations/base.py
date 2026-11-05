from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class NormalizedAssignment:
    def __init__(
        self,
        external_id: str,
        title: str,
        description: Optional[str],
        course_name: str,
        course_code: Optional[str],
        due_date: datetime,
        due_time: Optional[str],
        original_url: Optional[str] = None,
        priority: str = "medium",
        submission_status: str = "pending"
    ):
        self.external_id = external_id
        self.title = title
        self.description = description
        self.course_name = course_name
        self.course_code = course_code
        self.due_date = due_date
        self.due_time = due_time
        self.original_url = original_url
        self.priority = priority
        self.submission_status = submission_status

class BaseConnector(ABC):
    def __init__(self, platform_name: str, config: Optional[Dict[str, Any]] = None):
        self.platform_name = platform_name
        self.config = config or {}

    @abstractmethod
    def check_connection(self) -> Dict[str, Any]:
        """Returns connection status: status (connected/not_connected/unavailable), message, supported_data_types"""
        pass

    @abstractmethod
    def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Authenticates or saves credentials"""
        pass

    @abstractmethod
    def disconnect(self) -> bool:
        """Revokes tokens and cleans up connection"""
        pass

    @abstractmethod
    def fetch_courses(self) -> List[Dict[str, Any]]:
        """Discovers enrolled courses"""
        pass

    @abstractmethod
    def fetch_assignments(self) -> List[NormalizedAssignment]:
        """Discovers assignments and returns normalized models"""
        pass

    @abstractmethod
    def sync(self) -> Dict[str, Any]:
        """Runs synchronization and returns summary"""
        pass
