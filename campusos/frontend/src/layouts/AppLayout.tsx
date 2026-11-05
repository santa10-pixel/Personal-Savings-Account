import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  UserCheck,
  Award,
  Clock,
  Radio,
  Settings as SettingsIcon,
  BookMarked,
  Menu,
  X,
  Bell,
  ChevronDown,
  Sparkles,
  ChevronRight,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get active breadcrumb title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path.startsWith('/deadlines')) return 'Deadlines & Planner';
    if (path.startsWith('/calendar')) return 'Academic Calendar';
    if (path.startsWith('/attendance')) return 'Attendance Compliance';
    if (path.startsWith('/timetable')) return 'Slot Timetable';
    if (path.startsWith('/marks')) return 'Marks & CGPA';
    if (path.startsWith('/study-planner')) return 'Smart Study Planner';
    if (path.startsWith('/integrations')) return 'Platform Integrations';
    if (path.startsWith('/settings')) return 'Preferences & Settings';
    return 'Dashboard';
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/deadlines', label: 'Deadlines', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { to: '/attendance', label: 'Attendance', icon: UserCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/marks', label: 'Marks & CGPA', icon: Award },
    { to: '/study-planner', label: 'Study Planner', icon: BookMarked },
    { to: '/integrations', label: 'Integrations', icon: Radio },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-[#f5f7fa] text-[#172338]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#101b2d]/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#101b2d] text-[#dbe3ef] flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#1e2f47]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d7f4e6] text-[#116b4b] flex items-center justify-center font-bold shadow-sm">
              <GraduationCap size={20} />
            </div>
            <div>
              <strong className="block font-heading font-extrabold text-base tracking-tight text-white leading-none">
                CampusOS
              </strong>
              <span className="block text-[10px] text-[#8493a9] mt-1 font-medium tracking-wide">
                VIT Student Companion
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-[#8493a9] hover:text-white p-1"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Campus Indicator Pill */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#17253b] border border-[#263750] rounded-lg text-xs text-[#dce6f2]">
            <span className="w-2 h-2 rounded-full bg-[#43c88b] shadow-[0_0_8px_#43c88b88]" />
            <span className="font-medium text-[11px] truncate">{user?.profile?.campus || 'Vellore Campus'}</span>
            <ChevronDown size={13} className="ml-auto text-[#8191a8]" />
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[9px] font-bold tracking-wider text-[#63758e] uppercase">
            Academic Suite
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1e324a] text-white shadow-sm font-semibold border-l-2 border-[#43c88b]'
                    : 'text-[#9ba9bc] hover:bg-[#162438] hover:text-white'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#5dd49d]' : 'text-[#8291a5]'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Card & Profile */}
        <div className="p-3 border-t border-[#1e2f47] space-y-3">
          <div className="bg-[#17273d] border border-[#263a54] p-3 rounded-xl">
            <div className="flex items-center gap-2 text-[#60d5a0] text-xs font-semibold">
              <Sparkles size={14} />
              <span>Campus Sync Engine</span>
            </div>
            <p className="text-[10px] text-[#93a3b5] mt-1 leading-snug">
              Connect Moodle, Teams & Classroom for automatic due-date imports.
            </p>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/integrations');
              }}
              className="mt-2 text-[11px] text-[#82dfb7] font-semibold flex items-center gap-1 hover:underline"
            >
              Configure Hub <ChevronRight size={12} />
            </button>
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-[#273a52] text-[#dbe6f2] flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
              {getInitials(user?.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-white truncate">
                {user?.full_name || 'VIT Student'}
              </span>
              <span className="block text-[10px] text-[#8493a9] truncate">
                {user?.profile?.registration_number || user?.email}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-[#8493a9] hover:text-[#f87171] rounded-lg hover:bg-[#1c293c] transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#e9edf2] px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#5a6b82] hover:text-[#172338] rounded-lg hover:bg-[#f0f3f6]"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="text-xs text-[#8793a4]">
              CampusOS <span className="mx-1.5 text-[#cbd5e1]">/</span>
              <strong className="text-[#1e2b3e] font-semibold">{getPageTitle()}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#6b7c93] bg-[#f4f7f9] px-3 py-1.5 rounded-full border border-[#e2e8f0]">
              <span className="w-2 h-2 rounded-full bg-[#176d50]" />
              <span>Fall Semester 2026-27</span>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="relative p-2 text-[#64748b] hover:text-[#172338] hover:bg-[#f1f4f8] rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full ring-2 ring-white" />
            </button>

            <div
              onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-full bg-[#176d50] text-white flex items-center justify-center text-xs font-bold cursor-pointer shadow-sm hover:opacity-90"
            >
              {getInitials(user?.full_name)}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#e8edf2] py-4 px-6 md:px-8 text-center md:text-left text-[11px] text-[#8e9cae] flex flex-col md:flex-row items-center justify-between gap-2 bg-white/50">
          <div>
            <strong>CampusOS</strong> — Unified Academic Management System for Vellore Institute of Technology.
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span>FastAPI + PostgreSQL Architecture</span>
            <span>•</span>
            <span>Local Database Storage</span>
            <span>•</span>
            <span>v1.0.0 Production Ready</span>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#e2e8f0] py-2 px-3 flex justify-around items-center md:hidden z-30 shadow-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-[#176d50] font-bold' : 'text-[#64748b]'
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span className="mt-0.5">Overview</span>
          </NavLink>
          <NavLink
            to="/deadlines"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-[#176d50] font-bold' : 'text-[#64748b]'
              }`
            }
          >
            <CheckSquare size={18} />
            <span className="mt-0.5">Deadlines</span>
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-[#176d50] font-bold' : 'text-[#64748b]'
              }`
            }
          >
            <CalendarIcon size={18} />
            <span className="mt-0.5">Calendar</span>
          </NavLink>
          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-[#176d50] font-bold' : 'text-[#64748b]'
              }`
            }
          >
            <UserCheck size={18} />
            <span className="mt-0.5">Attendance</span>
          </NavLink>
          <NavLink
            to="/timetable"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-[#176d50] font-bold' : 'text-[#64748b]'
              }`
            }
          >
            <Clock size={18} />
            <span className="mt-0.5">Timetable</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
