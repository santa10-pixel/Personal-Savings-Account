# CampusOS — VIT Student Companion (starter MVP)

A responsive React + Vite Progressive Web App prototype that combines a VIT-style student companion dashboard with a personal academic deadline planner.

## Included in this starter
- Responsive desktop and mobile layouts
- PWA manifest and service worker (installable in supported browsers)
- Overview dashboard with task counts and upcoming events
- Manual event creation for assignments, Midterms, PATs, FATs, lab exams, project reviews, vivas and personal targets
- Search, status filters, mark-complete and delete actions
- November 2026 calendar preview
- Planned feature areas for attendance, marks, timetable, campus services and platform integrations
- Local browser storage for manually created events

## Important limitations
This is a front-end prototype. The sample VIT data is illustrative and is not connected to VTOP, Moodle, UniCC, Teams, Google Classroom, vitColab or iPilot. The connection screen is a roadmap, not a working login. Do not enter VIT, Microsoft or Google passwords into this prototype.

Live integrations require approved APIs or documented/authorized access methods, OAuth configuration, a backend, secure token storage, a database, and a scheduled worker for email reminders. VTOP/Moodle and other VIT-specific connectors must be validated before implementation.

## Run on macOS

1. Install Node.js LTS from https://nodejs.org/ if `node` and `npm` are not already installed.
2. In Terminal, enter this folder:

   ```bash
   cd campusos-starter
   npm install
   npm run dev
   ```

3. Open the local URL printed by Vite, usually http://localhost:5173.

## Production build

```bash
npm run build
npm run preview
```

For PWA installation, deploy the production build over HTTPS. In Chrome/Edge, use the install icon in the address bar. On iPhone, open the deployed site in Safari and choose Share → Add to Home Screen. On Android, use Install app / Add to Home Screen.

## Suggested next engineering milestones
1. Add FastAPI backend and PostgreSQL.
2. Add email/password or OAuth-based app account authentication.
3. Implement Google Classroom and Microsoft Graph OAuth integrations.
4. Investigate official/authorized Moodle and VTOP access methods.
5. Add sync normalization, external IDs, idempotency and sync logs.
6. Add a persistent notification queue and scheduled email worker.
7. Add native push notifications and optional Capacitor packaging if app-store distribution is required.
