import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  UserCheck,
  Award,
  Clock,
  Radio,
  Settings as SettingsIcon,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  ShieldAlert,
  BookOpen,
  Sparkles,
  TrendingUp,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'CSE3002 - Digital Assignment 3 (DA-3)',
    course: 'CSE3002 • IOT & Applications',
    type: 'Assignment',
    date: '2026-11-05',
    displayDay: '05',
    displayMonth: 'NOV',
    venue: 'VTOP Submission Portal • 11:59 PM',
    priority: 'high',
    source: 'Moodle',
    isDone: false,
    statusText: 'Due Tonight'
  },
  {
    id: 'evt-2',
    title: 'CSE3001 - Continuous Assessment Test 2 (CAT-2)',
    course: 'CSE3001 • Database Systems',
    type: 'Midterm',
    date: '2026-11-08',
    displayDay: '08',
    displayMonth: 'NOV',
    venue: 'TT-412 • 02:00 PM - 03:30 PM',
    priority: 'high',
    source: 'VTOP',
    isDone: false,
    statusText: 'In 3 days'
  },
  {
    id: 'evt-3',
    title: 'CSE2005 - Lab Practical Assessment Test (PAT)',
    course: 'CSE2005 • Operating Systems Lab',
    type: 'PAT',
    date: '2026-11-12',
    displayDay: '12',
    displayMonth: 'NOV',
    venue: 'SJT Lab 3 • 10:00 AM - 12:00 PM',
    priority: 'medium',
    source: 'Teams',
    isDone: false,
    statusText: 'In 7 days'
  },
  {
    id: 'evt-4',
    title: 'SWE3001 - Capstone Project Review 2',
    course: 'SWE3001 • Software Engineering',
    type: 'Project Review',
    date: '2026-11-15',
    displayDay: '15',
    displayMonth: 'NOV',
    venue: 'PRP-204 Panel 4 • 04:00 PM',
    priority: 'high',
    source: 'Manual',
    isDone: false,
    statusText: 'In 10 days'
  },
  {
    id: 'evt-5',
    title: 'MAT2002 - Complex Variables Quiz 2',
    course: 'MAT2002 • Applied Math',
    type: 'Assignment',
    date: '2026-11-18',
    displayDay: '18',
    displayMonth: 'NOV',
    venue: 'Google Classroom • 06:00 PM',
    priority: 'low',
    source: 'Classroom',
    isDone: false,
    statusText: 'In 13 days'
  },
  {
    id: 'evt-6',
    title: 'CSE3002 - Final Assessment Test (FAT)',
    course: 'CSE3002 • IOT & Applications',
    type: 'FAT',
    date: '2026-11-28',
    displayDay: '28',
    displayMonth: 'NOV',
    venue: 'Main Exam Hall • 09:00 AM',
    priority: 'high',
    source: 'VTOP',
    isDone: false,
    statusText: 'In 23 days'
  }
];

const ATTENDANCE_DATA = [
  { code: 'CSE3002', name: 'IOT & Applications', slot: 'A1+TA1', attended: 28, total: 30, pct: 93.3 },
  { code: 'CSE3001', name: 'Database Management Systems', slot: 'B1+TB1', attended: 26, total: 30, pct: 86.6 },
  { code: 'CSE2005', name: 'Operating Systems', slot: 'C1+TC1', attended: 25, total: 30, pct: 83.3 },
  { code: 'SWE3001', name: 'Software Engineering', slot: 'D1+TD1', attended: 27, total: 30, pct: 90.0 },
  { code: 'MAT2002', name: 'Applied Linear Algebra', slot: 'E1+TE1', attended: 23, total: 30, pct: 76.7 },
  { code: 'ENG1011', name: 'Professional Communication', slot: 'F1+TF1', attended: 29, total: 30, pct: 96.6 }
];

const TIMETABLE_DATA = [
  { slot: '8:00 - 8:50', mon: 'A1 (CSE3002)', tue: 'B1 (CSE3001)', wed: 'C1 (CSE2005)', thu: 'D1 (SWE3001)', fri: 'E1 (MAT2002)' },
  { slot: '9:00 - 9:50', mon: 'F1 (ENG1011)', tue: 'A1 (CSE3002)', wed: 'B1 (CSE3001)', thu: 'C1 (CSE2005)', fri: 'D1 (SWE3001)' },
  { slot: '10:00 - 10:50', mon: 'E1 (MAT2002)', tue: 'F1 (ENG1011)', wed: 'TA1 (CSE3002)', thu: 'TB1 (CSE3001)', fri: 'TC1 (CSE2005)' },
  { slot: '11:00 - 11:50', mon: 'TD1 (SWE3001)', tue: 'TE1 (MAT2002)', wed: 'TF1 (ENG1011)', thu: 'Library / Study', fri: 'Mentor Hour' },
  { slot: '2:00 - 3:40', mon: 'CSE2005 Lab (L1+L2)', tue: 'Free Slot', wed: 'CSE3001 Lab (L7+L8)', thu: 'Free Slot', fri: 'Project Review' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('campusos_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CSE3002 • IOT & Applications');
  const [newType, setNewType] = useState('Assignment');
  const [newDate, setNewDate] = useState('2026-11-10');
  const [newVenue, setNewVenue] = useState('VTOP / SJT');
  const [newPriority, setNewPriority] = useState('medium');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('campusos_events', JSON.stringify(events));
  }, [events]);

  const toggleEventDone = (id) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextDone = !e.isDone;
          return {
            ...e,
            isDone: nextDone,
            statusText: nextDone ? 'Done' : 'Pending'
          };
        }
        return e;
      })
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedDate = new Date(newDate);
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = parsedDate.toLocaleString('default', { month: 'short' }).toUpperCase();

    const newEvt = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      course: newCourse,
      type: newType,
      date: newDate,
      displayDay: isNaN(day) ? '01' : day,
      displayMonth: month === 'INVALID DATE' ? 'NOV' : month,
      venue: newVenue || 'Online / Campus',
      priority: newPriority,
      source: 'Manual',
      isDone: false,
      statusText: 'Upcoming'
    };

    setEvents((prev) => [newEvt, ...prev]);
    setNewTitle('');
    setNewNotes('');
    setIsModalOpen(false);
  };

  // Filtered Events
  const filteredEvents = events.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && !item.isDone) ||
      (statusFilter === 'COMPLETED' && item.isDone) ||
      (statusFilter === 'HIGH_PRIORITY' && item.priority === 'high');
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = events.filter((e) => !e.isDone && e.type === 'Assignment').length;
  const examsCount = events.filter(
    (e) => !e.isDone && ['Midterm', 'FAT', 'PAT', 'Lab Exam'].includes(e.type)
  ).length;
  const completedCount = events.filter((e) => e.isDone).length;

  return (
    <div className="app-shell">
      {/* Mobile Drawer Scrim */}
      {sidebarOpen && (
        <div className="scrim" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={22} />
          </div>
          <div>
            <strong>CampusOS</strong>
            <span>VIT Student Companion</span>
          </div>
          <button
            className="icon-btn close-menu"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="campus-pill">
          <div className="pulse" />
          <span>Vellore Campus</span>
          <ChevronDown size={14} />
        </div>

        <div className="nav-label">ACADEMIC</div>

        <button
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('overview');
            setSidebarOpen(false);
          }}
        >
          <LayoutDashboard size={16} />
          <span>Overview</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'deadlines' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('deadlines');
            setSidebarOpen(false);
          }}
        >
          <CheckSquare size={16} />
          <span>Deadlines</span>
          <small>{events.filter((e) => !e.isDone).length}</small>
        </button>

        <button
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('calendar');
            setSidebarOpen(false);
          }}
        >
          <CalendarIcon size={16} />
          <span>Calendar</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('attendance');
            setSidebarOpen(false);
          }}
        >
          <UserCheck size={16} />
          <span>Attendance</span>
          <small>88%</small>
        </button>

        <button
          className={`nav-item ${activeTab === 'marks' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('marks');
            setSidebarOpen(false);
          }}
        >
          <Award size={16} />
          <span>Marks & Grades</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('timetable');
            setSidebarOpen(false);
          }}
        >
          <Clock size={16} />
          <span>Timetable</span>
        </button>

        <div className="nav-label campus-label">SYSTEM</div>

        <button
          className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('integrations');
            setSidebarOpen(false);
          }}
        >
          <Radio size={16} />
          <span>Integrations</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('settings');
            setSidebarOpen(false);
          }}
        >
          <SettingsIcon size={16} />
          <span>Settings</span>
        </button>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <Sparkles size={16} />
            <strong>Campus Sync</strong>
            <p>Connect Moodle, Teams & VTOP for automated reminders.</p>
            <button onClick={() => setActiveTab('integrations')}>
              <span>Configure Sync</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="profile-row">
            <div className="avatar">SS</div>
            <div>
              <strong>Santhosh Sivan</strong>
              <span>21BCE1042 • CSE Core</span>
            </div>
            <ChevronRight size={14} />
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        {/* Sticky Topbar */}
        <header className="topbar">
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            CampusOS <span>/</span>{' '}
            <strong>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </strong>
          </div>

          <div className="top-actions">
            <div className="sync-status">
              <span className="status-dot" />
              <span>Fall Sem 2026-27</span>
            </div>
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>
            <div className="avatar top-avatar">SS</div>
          </div>
        </header>

        {/* Dynamic Content View */}
        <main className="content">
          {activeTab === 'overview' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow">FALL SEMESTER 2026-27</div>
                  <h1>
                    Welcome back, <em>Santhosh</em>
                  </h1>
                  <p className="subhead">
                    You have {events.filter((e) => !e.isDone).length} active
                    milestones and assignments scheduled this month.
                  </p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>New Deadline</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <BookOpen size={18} />
                  </div>
                  <span className="stat-label">PENDING ASSIGNMENTS</span>
                  <span className="stat-value">{pendingCount}</span>
                  <small>Due within 14 days</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <AlertCircle size={18} />
                  </div>
                  <span className="stat-label">EXAMS & ASSESSMENTS</span>
                  <span className="stat-value">{examsCount}</span>
                  <small>Midterms, PATs & FATs</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <CheckCircle size={18} />
                  </div>
                  <span className="stat-label">COMPLETED TASKS</span>
                  <span className="stat-value">{completedCount}</span>
                  <small>This semester</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon rose">
                    <TrendingUp size={18} />
                  </div>
                  <span className="stat-label">ATTENDANCE AVERAGE</span>
                  <span className="stat-value">88.4%</span>
                  <small>All courses &gt; 75% threshold</small>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="dashboard-grid">
                {/* Upcoming Deadlines Panel */}
                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Upcoming Deadlines & Milestones</h2>
                      <p>Priority items requiring submission or preparation</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => setActiveTab('deadlines')}
                    >
                      <span>View all</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="event-list">
                    {events.slice(0, 5).map((evt) => (
                      <div
                        key={evt.id}
                        className={`event-row ${evt.isDone ? 'is-done' : ''}`}
                      >
                        <button
                          className="check-button"
                          onClick={() => toggleEventDone(evt.id)}
                          aria-label="Toggle task completion"
                        >
                          {evt.isDone ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>

                        <div className="event-date">
                          <strong>{evt.displayDay}</strong>
                          <span>{evt.displayMonth}</span>
                        </div>

                        <div className="event-main">
                          <strong>{evt.title}</strong>
                          <span>
                            {evt.course} <i>•</i> {evt.type}
                          </span>
                          <small>{evt.venue}</small>
                        </div>

                        <div className="event-meta">
                          <span
                            className={`source-tag ${
                              evt.source === 'Manual' ? 'manual' : ''
                            }`}
                          >
                            {evt.source}
                          </span>
                          <span className={`priority ${evt.priority}`}>
                            {evt.priority}
                          </span>
                          <span
                            className={`event-status ${
                              evt.isDone
                                ? 'done'
                                : evt.statusText.includes('Tonight')
                                ? 'late'
                                : ''
                            }`}
                          >
                            {evt.statusText}
                          </span>
                        </div>

                        <button
                          className="delete-btn"
                          onClick={() => deleteEvent(evt.id)}
                          aria-label="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side Panel: This Week & Focus */}
                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>This Week</h2>
                      <p>November 2026</p>
                    </div>
                  </div>

                  <div className="week-days">
                    <div className="week-day">
                      <span>Mon</span>
                      <strong>2</strong>
                      <i />
                    </div>
                    <div className="week-day">
                      <span>Tue</span>
                      <strong>3</strong>
                      <i />
                    </div>
                    <div className="week-day">
                      <span>Wed</span>
                      <strong>4</strong>
                      <i />
                    </div>
                    <div className="week-day today">
                      <span>Thu</span>
                      <strong>5</strong>
                      <i className="has-event" />
                    </div>
                    <div className="week-day">
                      <span>Fri</span>
                      <strong>6</strong>
                      <i />
                    </div>
                    <div className="week-day">
                      <span>Sat</span>
                      <strong>7</strong>
                      <i />
                    </div>
                    <div className="week-day">
                      <span>Sun</span>
                      <strong>8</strong>
                      <i className="has-event" />
                    </div>
                  </div>

                  <div className="focus-card">
                    <div className="focus-icon">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <strong>Today's Focus: CSE3002 DA-3</strong>
                      <span>Submit on VTOP before 11:59 PM</span>
                    </div>
                  </div>

                  <button
                    className="outline-btn full"
                    onClick={() => setActiveTab('calendar')}
                  >
                    View Full Calendar
                  </button>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="bottom-grid">
                <div className="connect-placeholder">
                  <div className="placeholder-icon">
                    <Radio size={18} />
                  </div>
                  <div>
                    <strong>Campus Sync Connectors</strong>
                    <span>
                      Connect Moodle, Teams, and VTOP to automatically pull
                      graded assessments and slot timetables.
                    </span>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setActiveTab('integrations')}
                  >
                    <span>Configure</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Semester Progress</h2>
                      <p>Fall Semester 2026-27</p>
                    </div>
                    <div className="progress-number">68%</div>
                  </div>
                  <div className="progress-track">
                    <div style={{ width: '68%' }} />
                  </div>
                  <div className="progress-legend">
                    <span>
                      <i className="green-dot" /> Weeks Completed (12)
                    </span>
                    <span>
                      <i className="gray-dot" /> Remaining (6)
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'deadlines' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">ACADEMIC PLANNER</div>
                  <h1>Deadlines & Assessments</h1>
                  <p className="subhead">
                    Manage and filter all your assignments, CATs, FATs and lab
                    exams.
                  </p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>New Deadline</span>
                </button>
              </div>

              <div className="toolbar">
                <div className="searchbox">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search by title, course or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filterbox">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Assignment">Assignments / DAs</option>
                    <option value="Midterm">Midterms / CATs</option>
                    <option value="PAT">PAT (Practical Test)</option>
                    <option value="FAT">FAT (Final Exam)</option>
                    <option value="Project Review">Project Reviews</option>
                    <option value="Personal">Personal Targets</option>
                  </select>
                </div>

                <div className="filterbox">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending Only</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="HIGH_PRIORITY">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="panel">
                {filteredEvents.length === 0 ? (
                  <div className="empty-state">
                    <p>No deadlines match your current search or filter criteria.</p>
                  </div>
                ) : (
                  <div className="event-list">
                    {filteredEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className={`event-row ${evt.isDone ? 'is-done' : ''}`}
                      >
                        <button
                          className="check-button"
                          onClick={() => toggleEventDone(evt.id)}
                          aria-label="Toggle task completion"
                        >
                          {evt.isDone ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>

                        <div className="event-date">
                          <strong>{evt.displayDay}</strong>
                          <span>{evt.displayMonth}</span>
                        </div>

                        <div className="event-main">
                          <strong>{evt.title}</strong>
                          <span>
                            {evt.course} <i>•</i> {evt.type}
                          </span>
                          <small>{evt.venue}</small>
                        </div>

                        <div className="event-meta">
                          <span
                            className={`source-tag ${
                              evt.source === 'Manual' ? 'manual' : ''
                            }`}
                          >
                            {evt.source}
                          </span>
                          <span className={`priority ${evt.priority}`}>
                            {evt.priority}
                          </span>
                          <span
                            className={`event-status ${
                              evt.isDone ? 'done' : ''
                            }`}
                          >
                            {evt.statusText}
                          </span>
                        </div>

                        <button
                          className="delete-btn"
                          onClick={() => deleteEvent(evt.id)}
                          aria-label="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'calendar' && (
            <div className="panel calendar-panel">
              <div className="calendar-head">
                <div>
                  <h2>November 2026</h2>
                  <p className="subhead">
                    Upcoming academic schedule and exam calendar
                  </p>
                </div>
                <span className="demo-tag">Fall Semester 2026-27</span>
              </div>

              <div className="calendar-grid">
                <div className="cal-weekday">Sun</div>
                <div className="cal-weekday">Mon</div>
                <div className="cal-weekday">Tue</div>
                <div className="cal-weekday">Wed</div>
                <div className="cal-weekday">Thu</div>
                <div className="cal-weekday">Fri</div>
                <div className="cal-weekday">Sat</div>

                {/* Week 1 */}
                <div className="cal-cell">
                  <span>1</span>
                </div>
                <div className="cal-cell">
                  <span>2</span>
                </div>
                <div className="cal-cell">
                  <span>3</span>
                </div>
                <div className="cal-cell">
                  <span>4</span>
                </div>
                <div className="cal-cell cal-today">
                  <span>5</span>
                  <small>CSE3002 DA-3</small>
                </div>
                <div className="cal-cell">
                  <span>6</span>
                </div>
                <div className="cal-cell">
                  <span>7</span>
                </div>

                {/* Week 2 */}
                <div className="cal-cell">
                  <span>8</span>
                  <small>CSE3001 CAT-2</small>
                </div>
                <div className="cal-cell">
                  <span>9</span>
                </div>
                <div className="cal-cell">
                  <span>10</span>
                </div>
                <div className="cal-cell">
                  <span>11</span>
                </div>
                <div className="cal-cell">
                  <span>12</span>
                  <small>CSE2005 PAT</small>
                </div>
                <div className="cal-cell">
                  <span>13</span>
                </div>
                <div className="cal-cell">
                  <span>14</span>
                </div>

                {/* Week 3 */}
                <div className="cal-cell">
                  <span>15</span>
                  <small>SWE3001 Review</small>
                </div>
                <div className="cal-cell">
                  <span>16</span>
                </div>
                <div className="cal-cell">
                  <span>17</span>
                </div>
                <div className="cal-cell">
                  <span>18</span>
                  <small>MAT2002 Quiz</small>
                </div>
                <div className="cal-cell">
                  <span>19</span>
                </div>
                <div className="cal-cell">
                  <span>20</span>
                </div>
                <div className="cal-cell">
                  <span>21</span>
                </div>

                {/* Week 4 */}
                <div className="cal-cell">
                  <span>22</span>
                </div>
                <div className="cal-cell">
                  <span>23</span>
                </div>
                <div className="cal-cell">
                  <span>24</span>
                </div>
                <div className="cal-cell">
                  <span>25</span>
                </div>
                <div className="cal-cell">
                  <span>26</span>
                </div>
                <div className="cal-cell">
                  <span>27</span>
                </div>
                <div className="cal-cell">
                  <span>28</span>
                  <small>CSE3002 FAT</small>
                </div>

                {/* Week 5 */}
                <div className="cal-cell">
                  <span>29</span>
                </div>
                <div className="cal-cell">
                  <span>30</span>
                </div>
                <div className="cal-cell muted-cell">
                  <span>1</span>
                </div>
                <div className="cal-cell muted-cell">
                  <span>2</span>
                </div>
                <div className="cal-cell muted-cell">
                  <span>3</span>
                </div>
                <div className="cal-cell muted-cell">
                  <span>4</span>
                </div>
                <div className="cal-cell muted-cell">
                  <span>5</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">ATTENDANCE COMPLIANCE</div>
                  <h1>Course Attendance Tracker</h1>
                  <p className="subhead">
                    VIT maintains a mandatory 75% attendance policy for FAT
                    eligibility.
                  </p>
                </div>
              </div>

              <div className="notice-card">
                <AlertCircle size={20} />
                <div>
                  <strong>VTOP Attendance Sync (Simulated)</strong>
                  <p>
                    Values are calculated based on registered slots and teacher
                    biometric sign-ins. Keep track of margin classes to stay
                    safely above the 75% threshold.
                  </p>
                </div>
              </div>

              <div className="feature-grid">
                {ATTENDANCE_DATA.map((item) => {
                  const safeBunk = Math.max(
                    0,
                    Math.floor((item.attended - 0.75 * item.total) / 0.75)
                  );
                  return (
                    <div key={item.code} className="feature-card">
                      <div className="feature-icon">
                        <UserCheck size={18} />
                      </div>
                      <strong>
                        {item.code} — {item.name}
                      </strong>
                      <p>
                        Slot: {item.slot} • Attended: {item.attended} / {item.total}{' '}
                        classes
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '10px'
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '16px',
                            color: item.pct >= 85 ? '#238c68' : '#cf705f'
                          }}
                        >
                          {item.pct.toFixed(1)}%
                        </span>
                        <span className="coming-soon">
                          Safe to miss: {safeBunk} classes
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'marks' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">ASSESSMENT PERFORMANCE</div>
                  <h1>Continuous Assessments & Marks</h1>
                  <p className="subhead">
                    Review your CAT-1, CAT-2, and Digital Assignment scores.
                  </p>
                </div>
              </div>

              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <Award size={18} />
                  </div>
                  <strong>CSE3002 • IOT & Applications</strong>
                  <p>CAT-1: 44.5/50 • CAT-2: In Progress • DA1: 10/10 • DA2: 9.5/10</p>
                  <span className="coming-soon">Internal Score: 42.5 / 60</span>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <Award size={18} />
                  </div>
                  <strong>CSE3001 • Database Management Systems</strong>
                  <p>CAT-1: 46.0/50 • CAT-2: 43.5/50 • DA1: 10/10 • Quiz: 5/5</p>
                  <span className="coming-soon">Internal Score: 52.0 / 60</span>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <Award size={18} />
                  </div>
                  <strong>SWE3001 • Software Engineering</strong>
                  <p>CAT-1: 42.0/50 • Project Review 1: 18/20 • DA1: 9/10</p>
                  <span className="coming-soon">Internal Score: 44.0 / 60</span>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <Award size={18} />
                  </div>
                  <strong>MAT2002 • Applied Linear Algebra</strong>
                  <p>CAT-1: 40.0/50 • CAT-2: 41.0/50 • Quiz 1: 5/5</p>
                  <span className="coming-soon">Internal Score: 47.5 / 60</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'timetable' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">SLOT SCHEDULE</div>
                  <h1>Weekly Slot Timetable</h1>
                  <p className="subhead">
                    Theory and laboratory slots according to FFCS slot allocations.
                  </p>
                </div>
              </div>

              <div className="panel" style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                    textAlign: 'left'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid #edf0f3',
                        color: '#657488'
                      }}
                    >
                      <th style={{ padding: '10px 8px' }}>Timing</th>
                      <th style={{ padding: '10px 8px' }}>Monday</th>
                      <th style={{ padding: '10px 8px' }}>Tuesday</th>
                      <th style={{ padding: '10px 8px' }}>Wednesday</th>
                      <th style={{ padding: '10px 8px' }}>Thursday</th>
                      <th style={{ padding: '10px 8px' }}>Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TIMETABLE_DATA.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: '1px solid #f2f5f8' }}
                      >
                        <td
                          style={{
                            padding: '12px 8px',
                            fontWeight: 700,
                            color: '#34465c'
                          }}
                        >
                          {row.slot}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#526276' }}>
                          {row.mon}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#526276' }}>
                          {row.tue}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#526276' }}>
                          {row.wed}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#526276' }}>
                          {row.thu}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#526276' }}>
                          {row.fri}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'integrations' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">CAMPUS CONNECTORS</div>
                  <h1>Connected Platforms & Services</h1>
                  <p className="subhead">
                    Connect and synchronize data across VIT educational
                    platforms.
                  </p>
                </div>
              </div>

              <div className="notice-card compact">
                <AlertCircle size={20} />
                <div>
                  <strong>Roadmap Architecture Preview</strong>
                  <p>
                    This is a front-end prototype. Authentic connections will
                    use OAuth2 PKCE or official university API tokens once
                    backend connectors are authorized.
                  </p>
                </div>
              </div>

              <div className="connection-list">
                <div className="connection-row">
                  <div className="provider-icon provider-m">M</div>
                  <div className="connection-info">
                    <strong>VIT Moodle (Course Assessment Portal)</strong>
                    <span>
                      Sync digital assignments, quiz deadlines, and uploaded
                      lecture notes.
                    </span>
                  </div>
                  <span className="connection-status">Roadmap Feature</span>
                  <button className="outline-btn small-btn" disabled>
                    Connect
                  </button>
                </div>

                <div className="connection-row">
                  <div className="provider-icon provider-t">T</div>
                  <div className="connection-info">
                    <strong>Microsoft Teams (VIT Tenant)</strong>
                    <span>
                      Import class schedule alerts, project reviews, and teacher
                      notices.
                    </span>
                  </div>
                  <span className="connection-status">Roadmap Feature</span>
                  <button className="outline-btn small-btn" disabled>
                    Connect
                  </button>
                </div>

                <div className="connection-row">
                  <div className="provider-icon provider-g">G</div>
                  <div className="connection-info">
                    <strong>Google Classroom</strong>
                    <span>
                      Import assignment due dates from your VIT student Google
                      account.
                    </span>
                  </div>
                  <span className="connection-status">Roadmap Feature</span>
                  <button className="outline-btn small-btn" disabled>
                    Connect
                  </button>
                </div>

                <div className="connection-row">
                  <div className="provider-icon provider-c">V</div>
                  <div className="connection-info">
                    <strong>VTOP Student Portal</strong>
                    <span>
                      Sync attendance thresholds, grade history, and FFCS
                      timetable.
                    </span>
                  </div>
                  <span className="connection-status">Roadmap Feature</span>
                  <button className="outline-btn small-btn" disabled>
                    Connect
                  </button>
                </div>

                <div className="connection-row">
                  <div className="provider-icon provider-i">iP</div>
                  <div className="connection-info">
                    <strong>vitColab / iPilot Lab Environments</strong>
                    <span>
                      Fetch coding assessment schedules, test run scores, and
                      deadlines.
                    </span>
                  </div>
                  <span className="connection-status">Roadmap Feature</span>
                  <button className="outline-btn small-btn" disabled>
                    Connect
                  </button>
                </div>
              </div>

              <div className="security-note">
                <ShieldAlert size={20} />
                <div>
                  <strong>Important Security & Credential Guidelines</strong>
                  <p>
                    Never input your VIT password, Microsoft passwords, or OTPs
                    into unofficial third-party applications. CampusOS relies on
                    secure local device storage and planned delegated OAuth
                    mechanisms.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <div className="panel settings-panel">
              <h2>Settings & Preferences</h2>
              <p>Configure student companion preferences and notifications.</p>

              <div className="setting-row">
                <div>
                  <strong>Deadline Reminders</strong>
                  <small>Receive email alerts 24 hours prior to submission deadlines</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="setting-row">
                <div>
                  <strong>Attendance Warning Alerts</strong>
                  <small>Alert me when attendance in any course drops below 80%</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="setting-row">
                <div>
                  <strong>Compact Timetable View</strong>
                  <small>Only show currently registered slots in the daily view</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="setting-row">
                <div>
                  <strong>Offline Mode PWA</strong>
                  <small>Cache timetable and assignments for offline campus access</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="form-field">
                <label>Default Campus</label>
                <select defaultValue="vellore">
                  <option value="vellore">Vellore Campus</option>
                  <option value="chennai">Chennai Campus</option>
                  <option value="ap">VIT-AP</option>
                  <option value="bhopal">VIT Bhopal</option>
                </select>
              </div>

              <div className="form-field">
                <label>Registered Student Reg. No.</label>
                <input type="text" defaultValue="21BCE1042" readOnly />
              </div>

              <p className="muted-small">CampusOS v0.1.0 • Client Build 2026.11</p>
            </div>
          )}
        </main>

        {/* Global Footer */}
        <footer>
          CampusOS — Vellore Institute of Technology • Student Academic Companion
          <span>|</span> Front-End Prototype MVP <span>|</span> Built with React + Vite
        </footer>
      </div>

      {/* Add New Deadline Modal */}
      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="modal">
            <div className="modal-head">
              <div>
                <h2>Create New Deadline</h2>
                <p>Add an assignment, midterm, lab exam or personal goal</p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEvent}>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Title / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE3002 Digital Assignment 4"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Course / Subject</label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                  >
                    <option value="CSE3002 • IOT & Applications">
                      CSE3002 • IOT & Applications
                    </option>
                    <option value="CSE3001 • Database Systems">
                      CSE3001 • Database Systems
                    </option>
                    <option value="CSE2005 • Operating Systems">
                      CSE2005 • Operating Systems
                    </option>
                    <option value="SWE3001 • Software Engineering">
                      SWE3001 • Software Engineering
                    </option>
                    <option value="MAT2002 • Applied Math">
                      MAT2002 • Applied Math
                    </option>
                    <option value="General Academic">General Academic</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Type / Assessment</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="Assignment">Assignment (DA)</option>
                    <option value="Midterm">Midterm (CAT-1 / CAT-2)</option>
                    <option value="PAT">Practical Assessment (PAT)</option>
                    <option value="FAT">Final Exam (FAT)</option>
                    <option value="Lab Exam">Lab Exam</option>
                    <option value="Project Review">Project Review</option>
                    <option value="Viva">Viva Voce</option>
                    <option value="Target">Personal Target</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="form-field full">
                  <label>Venue / Submission Mode</label>
                  <input
                    type="text"
                    placeholder="e.g. VTOP Submission Portal / TT-412"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                  />
                </div>

                <div className="form-field full">
                  <label>Notes / Checklist (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Reference chapters, rubric criteria or team members..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
