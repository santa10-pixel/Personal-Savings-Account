import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Bell,
  Mail,
  Shield,
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Profile Form State
  const [programme, setProgramme] = useState(user?.profile?.programme || 'B.Tech');
  const [branch, setBranch] = useState(user?.profile?.branch || 'Computer Science & Engineering');
  const [campus, setCampus] = useState(user?.profile?.campus || 'Vellore Campus');
  const [reminderEmail, setReminderEmail] = useState(user?.profile?.reminder_email || user?.email || '');

  // Notifications State
  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: api.getNotificationPreferences,
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notifyDays, setNotifyDays] = useState('3,1,0');
  const [deliveryTime, setDeliveryTime] = useState('08:00');
  const [attendanceAlert, setAttendanceAlert] = useState(true);

  // Status feedback
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sync state when preferences query finishes
  React.useEffect(() => {
    if (prefs) {
      setEmailEnabled(prefs.email_enabled);
      setNotifyDays(prefs.notify_days_before);
      setDeliveryTime(prefs.delivery_time);
      setAttendanceAlert(prefs.attendance_warning_enabled);
    }
  }, [prefs]);

  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      refreshUser();
      setStatusMsg('Academic profile updated successfully.');
      setTimeout(() => setStatusMsg(null), 3000);
    },
  });

  const updatePrefsMutation = useMutation({
    mutationFn: api.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setStatusMsg('Notification preferences saved.');
      setTimeout(() => setStatusMsg(null), 3000);
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: api.sendTestEmail,
    onSuccess: (res) => {
      setStatusMsg(res.message);
      setTimeout(() => setStatusMsg(null), 4000);
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      programme,
      branch,
      campus,
      reminder_email: reminderEmail,
    });
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrefsMutation.mutate({
      email_enabled: emailEnabled,
      notify_days_before: notifyDays,
      delivery_time: deliveryTime,
      attendance_warning_enabled: attendanceAlert,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="pb-2 border-b border-[#e9edf2]">
        <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
          SYSTEM PREFERENCES
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
          Settings & Profile
        </h1>
        <p className="text-xs text-[#6e7d91] mt-1">
          Manage your student credentials, email reminder schedules, and device PWA preferences.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#176d50]" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Academic Profile Section */}
      <div className="bg-white border border-[#e5ebf0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#f0f3f6]">
          <User size={18} className="text-[#176d50]" />
          <h2 className="font-heading font-bold text-sm text-[#1e293b]">Academic Profile Details</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.full_name || ''}
                className="w-full px-3.5 py-2.5 bg-[#f1f5f9] border border-[#d8e1e8] rounded-xl text-xs text-[#64748b] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Registration Number</label>
              <input
                type="text"
                disabled
                value={user?.profile?.registration_number || '21BCE1042'}
                className="w-full px-3.5 py-2.5 bg-[#f1f5f9] border border-[#d8e1e8] rounded-xl text-xs text-[#64748b] cursor-not-allowed uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Campus</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              >
                <option value="Vellore Campus">Vellore Campus</option>
                <option value="Chennai Campus">Chennai Campus</option>
                <option value="VIT-AP">VIT-AP</option>
                <option value="VIT Bhopal">VIT Bhopal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Programme</label>
              <input
                type="text"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Active Reminder Delivery Email
            </label>
            <input
              type="email"
              required
              value={reminderEmail}
              onChange={(e) => setReminderEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
            />
            <span className="block text-[10px] text-[#94a3b8] mt-1">
              CampusOS dispatches daily 8:00 AM upcoming deadline notices to this address.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-5 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              Update Academic Profile
            </button>
          </div>
        </form>
      </div>

      {/* Reminder System Section */}
      <div className="bg-white border border-[#e5ebf0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#176d50]" />
            <h2 className="font-heading font-bold text-sm text-[#1e293b]">
              Email Reminder Configuration
            </h2>
          </div>

          <button
            onClick={() => testEmailMutation.mutate()}
            disabled={testEmailMutation.isPending}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#176d50] bg-[#e7f7ef] hover:bg-[#d6f0e3] rounded-lg flex items-center gap-1.5 transition"
          >
            <Send size={13} />
            <span>Send Test Reminder</span>
          </button>
        </div>

        <form onSubmit={handleSavePrefs} className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[#f1f5f9]">
            <div>
              <strong className="block text-xs font-semibold text-[#1e293b]">
                Automated Email Reminders
              </strong>
              <span className="text-[11px] text-[#64748b]">
                Send formatted email alerts prior to assignment submissions and exams
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-4 h-4 text-[#176d50] rounded focus:ring-[#176d50]"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#f1f5f9]">
            <div>
              <strong className="block text-xs font-semibold text-[#1e293b]">
                Low Attendance Warnings
              </strong>
              <span className="text-[11px] text-[#64748b]">
                Trigger alert if any registered subject drops below 80.0%
              </span>
            </div>
            <input
              type="checkbox"
              checked={attendanceAlert}
              onChange={(e) => setAttendanceAlert(e.target.checked)}
              className="w-4 h-4 text-[#176d50] rounded focus:ring-[#176d50]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Notify Days in Advance
              </label>
              <input
                type="text"
                placeholder="3,1,0"
                value={notifyDays}
                onChange={(e) => setNotifyDays(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              />
              <span className="block text-[10px] text-[#94a3b8] mt-1">
                Comma-separated: e.g. 3,1,0 (3 days before, 1 day before, day of)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Daily Delivery Time (Asia/Kolkata)
              </label>
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatePrefsMutation.isPending}
              className="px-5 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              Save Notification Preferences
            </button>
          </div>
        </form>
      </div>

      {/* PWA & Mobile Installation */}
      <div className="bg-white border border-[#e5ebf0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#eaf4ee] text-[#176d50] flex items-center justify-center font-bold">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#1e293b]">Install as Mobile App (PWA)</h3>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Install CampusOS on iOS or Android directly from Safari / Chrome with offline timetable access.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('To install CampusOS on your phone: In Safari, tap Share → "Add to Home Screen". In Chrome, tap Menu → "Install App".')}
          className="px-4 py-2 border border-[#d8e1e8] hover:bg-[#f8fafc] text-[#1e293b] rounded-xl text-xs font-semibold transition"
        >
          Installation Guide
        </button>
      </div>

      {/* Account Actions */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
        <div>
          <span className="font-bold text-xs text-red-900 block">Sign Out of CampusOS</span>
          <span className="text-[11px] text-red-700 block mt-0.5">
            Safely disconnect this browser session on shared campus systems.
          </span>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
