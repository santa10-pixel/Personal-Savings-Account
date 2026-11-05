# Third-Party Platform API Setup Guide

This document explains how institutional OAuth and API credentials are configured for real-time synchronization with VIT external platforms.

---

## 1. Google Classroom API
### Prerequisites:
1. Google Cloud Console project.
2. Enable **Google Classroom API** (`classroom.googleapis.com`).
3. Configure OAuth Consent Screen:
   - Scopes required:
     - `https://www.googleapis.com/auth/classroom.courses.readonly`
     - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
     - `https://www.googleapis.com/auth/classroom.student-submissions.me.readonly`
4. Add Authorized Redirect URI:
   - `http://localhost:8000/api/sync/google_classroom/callback`

### Environment Variables:
```env
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

---

## 2. Microsoft Teams (Microsoft Graph API)
### Prerequisites:
1. Azure Portal / Microsoft Entra Admin Center.
2. App Registration under the VIT Educational Tenant.
3. API Permissions:
   - `EduAssignments.Read`
   - `EduRoster.Read`
   - `Team.ReadBasic.All`
4. Add Authorized Redirect URI:
   - `http://localhost:8000/api/sync/microsoft_teams/callback`

### Environment Variables:
```env
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_TENANT_ID=common # Or institutional tenant ID
```

---

## 3. VIT Moodle LMS (lms.vit.ac.in)
### Prerequisites:
1. Moodle Web Services enabled on the server (`/admin/settings.php?section=webservicesoverview`).
2. Protocol: REST (`webservice/rest/server.php`).
3. Required functions:
   - `core_course_get_courses`
   - `mod_assign_get_assignments`
4. Student Web Services Token generated under *User Preferences → Security keys*.

### Environment Variables:
```env
MOODLE_BASE_URL=https://lms.vit.ac.in
MOODLE_API_TOKEN=your-moodle-webservice-token
```

---

## 4. VTOP, vitColab & iPilot
- **VTOP:** No authorized public REST API is currently exposed by VIT. In compliance with security policy, CampusOS does not collect user portal passwords or bypass university CAPTCHA systems. Instead, CampusOS provides manual entry and timetable matrix configuration.
- **vitColab & iPilot:** Institutional roadmap integrations.
