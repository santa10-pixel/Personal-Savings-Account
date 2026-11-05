import {
  User,
  AcademicEvent,
  AcademicSubject,
  DashboardStats,
  PlatformConnection,
  SyncReport,
  AttendanceRecord,
  TimetableEntry,
  AcademicMark,
  CGPACalculation,
  StudySession,
  NotificationPreference
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('campusos_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('campusos_access_token');
      // If unauthorized and not on auth pages, redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || 'An unexpected error occurred');
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: any): Promise<{ access_token: string; refresh_token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async login(data: any): Promise<{ access_token: string; refresh_token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(data: any): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getTodaysFocus(): Promise<AcademicEvent[]> {
    const res = await fetch(`${API_BASE}/dashboard/focus`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Academic Events
  async getEvents(params?: Record<string, string>): Promise<AcademicEvent[]> {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/events?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createEvent(data: Partial<AcademicEvent>): Promise<AcademicEvent> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateEvent(id: number, data: Partial<AcademicEvent>): Promise<AcademicEvent> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleEventComplete(id: number): Promise<AcademicEvent> {
    const res = await fetch(`${API_BASE}/events/${id}/toggle-complete`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async deleteEvent(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Subjects
  async getSubjects(): Promise<AcademicSubject[]> {
    const res = await fetch(`${API_BASE}/subjects`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createSubject(data: Partial<AcademicSubject>): Promise<AcademicSubject> {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Attendance
  async getAttendance(): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_BASE}/attendance`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async saveAttendance(data: { subject_id: number; attended_classes: number; total_classes: number; required_threshold?: number }): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Timetable
  async getTimetable(): Promise<TimetableEntry[]> {
    const res = await fetch(`${API_BASE}/timetable`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getTodayTimetable(): Promise<TimetableEntry[]> {
    const res = await fetch(`${API_BASE}/timetable/today`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createTimetableEntry(data: Partial<TimetableEntry>): Promise<TimetableEntry> {
    const res = await fetch(`${API_BASE}/timetable`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteTimetableEntry(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/timetable/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Marks & CGPA
  async getMarks(): Promise<AcademicMark[]> {
    const res = await fetch(`${API_BASE}/marks`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createMark(data: Partial<AcademicMark>): Promise<AcademicMark> {
    const res = await fetch(`${API_BASE}/marks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteMark(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/marks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getCGPA(): Promise<CGPACalculation> {
    const res = await fetch(`${API_BASE}/marks/cgpa`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Sync & Integrations
  async getPlatformsStatus(): Promise<PlatformConnection[]> {
    const res = await fetch(`${API_BASE}/sync/status`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async syncAll(): Promise<SyncReport> {
    const res = await fetch(`${API_BASE}/sync/all`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async syncPlatform(platformName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/${platformName}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async connectPlatform(platformName: string, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/${platformName}/connect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async disconnectPlatform(platformName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/${platformName}/disconnect`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Study Planner
  async generateStudyPlan(data: { event_id: number; start_date: string; daily_available_hours: number; subject_difficulty: string; topics: string[] }): Promise<StudySession[]> {
    const res = await fetch(`${API_BASE}/study-planner/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getEventStudySessions(eventId: number): Promise<StudySession[]> {
    const res = await fetch(`${API_BASE}/study-planner/event/${eventId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async toggleStudySession(sessionId: number): Promise<StudySession> {
    const res = await fetch(`${API_BASE}/study-planner/session/${sessionId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotificationPreferences(): Promise<NotificationPreference> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateNotificationPreferences(data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async sendTestEmail(): Promise<{ success: boolean; recipient: string; message: string }> {
    const res = await fetch(`${API_BASE}/notifications/test-email`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
