export interface UserProfile {
  university: string;
  campus: string;
  programme: string;
  branch: string;
  year_of_study: number;
  semester: string;
  registration_number?: string;
  reminder_email?: string;
  timezone: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  profile?: UserProfile;
  created_at: string;
}

export interface AcademicSubject {
  id: number;
  code: string;
  name: string;
  faculty_name?: string;
  slot?: string;
  credits: number;
  default_venue?: string;
  color?: string;
  created_at: string;
}

export interface AcademicEvent {
  id: number;
  subject_id?: number;
  subject?: AcademicSubject;
  title: string;
  description?: string;
  event_type: string;
  source_platform: string;
  external_id?: string;
  original_url?: string;
  due_date: string;
  due_time?: string;
  timezone: string;
  priority: 'low' | 'medium' | 'high';
  completion_status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  is_manual: boolean;
  heard_from?: string;
  venue?: string;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
}

export interface DashboardStats {
  total_pending: number;
  due_today: number;
  due_this_week: number;
  overdue: number;
  completed: number;
  upcoming_exams: number;
  attendance_average: number;
  semester_progress_pct: number;
}

export interface PlatformConnection {
  id: number;
  platform_name: string;
  auth_status: 'not_connected' | 'connected' | 'syncing' | 'synced' | 'sync_failed' | 'permission_required' | 'unavailable';
  external_account_email?: string;
  last_synced_at?: string;
  last_attempted_at?: string;
  last_error_message?: string;
  supported_data_types: string[];
}

export interface SyncResult {
  platform_name: string;
  status: string;
  items_added: number;
  items_updated: number;
  message?: string;
}

export interface SyncReport {
  synced_at: string;
  results: SyncResult[];
}

export interface AttendanceRecord {
  id: number;
  subject_id: number;
  subject?: AcademicSubject;
  attended_classes: number;
  total_classes: number;
  required_threshold: number;
  attendance_percentage: number;
  can_miss_classes: number;
  classes_needed_for_target: number;
  is_official: boolean;
  last_updated: string;
}

export interface TimetableEntry {
  id: number;
  subject_id: number;
  subject?: AcademicSubject;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_name?: string;
  classroom?: string;
  course_type: string;
}

export interface AcademicMark {
  id: number;
  subject_id: number;
  subject?: AcademicSubject;
  assessment_name: string;
  score: number;
  max_score: number;
  weightage_pct: number;
  is_official: boolean;
  created_at: string;
}

export interface SubjectMarksSummary {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  total_weighted_score: number;
  predicted_grade: string;
  grade_points: number;
}

export interface CGPACalculation {
  total_registered_credits: number;
  estimated_gpa: number;
  subject_summaries: SubjectMarksSummary[];
}

export interface StudySession {
  id: number;
  event_id: number;
  title: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  topic: string;
  is_completed: boolean;
}

export interface NotificationPreference {
  notify_days_before: string;
  delivery_time: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  attendance_warning_enabled: boolean;
  attendance_threshold_alert: number;
}
