import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Plus,
  Radio,
  Calendar,
  ChevronRight,
  Circle,
  ExternalLink,
  Flame,
  CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getDashboardStats,
  });

  const { data: focusTasks, isLoading: focusLoading } = useQuery({
    queryKey: ['dashboard-focus'],
    queryFn: api.getTodaysFocus,
  });

  const { data: todayClasses } = useQuery({
    queryKey: ['timetable-today'],
    queryFn: api.getTodayTimetable,
  });

  // Toggle completion mutation
  const toggleMutation = useMutation({
    mutationFn: api.toggleEventComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-focus'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            {user?.profile?.semester || 'FALL SEMESTER 2026-27'}
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            {getGreeting()}, <span className="text-[#176d50]">{firstName}</span>
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            Today is {format(new Date(), 'EEEE, d MMMM yyyy')}. Here is your academic focus and timetable.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/deadlines')}
            className="px-3.5 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition"
          >
            <Plus size={15} />
            <span>New Academic Event</span>
          </button>
          <button
            onClick={() => navigate('/integrations')}
            className="px-3.5 py-2.5 bg-white hover:bg-[#f8fafc] text-[#334458] border border-[#d8e1e8] rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Radio size={14} className="text-[#176d50]" />
            <span>Sync Hub</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#e5ebf0] rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <BookOpen size={17} />
          </div>
          <span className="text-[10px] font-bold text-[#8392a5] uppercase tracking-wider block">
            Pending Tasks
          </span>
          <span className="font-heading font-extrabold text-2xl text-[#17263d] block mt-0.5">
            {statsLoading ? '...' : stats?.total_pending ?? 0}
          </span>
          <span className="text-[10px] text-[#95a3b5] block mt-1">
            {stats?.due_this_week ?? 0} due within 7 days
          </span>
        </div>

        <div className="bg-white border border-[#e5ebf0] rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <AlertCircle size={17} />
          </div>
          <span className="text-[10px] font-bold text-[#8392a5] uppercase tracking-wider block">
            Examinations
          </span>
          <span className="font-heading font-extrabold text-2xl text-[#17263d] block mt-0.5">
            {statsLoading ? '...' : stats?.upcoming_exams ?? 0}
          </span>
          <span className="text-[10px] text-[#95a3b5] block mt-1">
            Midterms, PATs & FATs
          </span>
        </div>

        <div className="bg-white border border-[#e5ebf0] rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 size={17} />
          </div>
          <span className="text-[10px] font-bold text-[#8392a5] uppercase tracking-wider block">
            Completed
          </span>
          <span className="font-heading font-extrabold text-2xl text-[#17263d] block mt-0.5">
            {statsLoading ? '...' : stats?.completed ?? 0}
          </span>
          <span className="text-[10px] text-[#95a3b5] block mt-1">
            Finished this semester
          </span>
        </div>

        <div className="bg-white border border-[#e5ebf0] rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <TrendingUp size={17} />
          </div>
          <span className="text-[10px] font-bold text-[#8392a5] uppercase tracking-wider block">
            Attendance Avg
          </span>
          <span className="font-heading font-extrabold text-2xl text-[#17263d] block mt-0.5">
            {statsLoading ? '...' : `${stats?.attendance_average ?? 85.0}%`}
          </span>
          <span className="text-[10px] text-[#95a3b5] block mt-1">
            Requirement: &gt; 75.0%
          </span>
        </div>
      </div>

      {/* Main Grid: Today's Focus & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Focus */}
        <div className="lg:col-span-2 bg-white border border-[#e5ebf0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
            <div>
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-500" />
                <h2 className="font-heading font-bold text-sm text-[#1e2a3c]">
                  Today's Priority Focus
                </h2>
              </div>
              <p className="text-[11px] text-[#8493a8] mt-0.5">
                Top tasks sorted by deadline urgency and priority level
              </p>
            </div>
            <button
              onClick={() => navigate('/deadlines')}
              className="text-xs font-semibold text-[#176d50] hover:underline flex items-center gap-1"
            >
              All Deadlines <ChevronRight size={13} />
            </button>
          </div>

          {focusLoading ? (
            <div className="py-8 text-center text-xs text-[#8c9cae]">Loading focus items...</div>
          ) : !focusTasks || focusTasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle size={28} className="mx-auto text-[#176d50] mb-2" />
              <p className="text-xs font-semibold text-[#2a384c]">All caught up!</p>
              <p className="text-[11px] text-[#8696a8] mt-0.5">
                No urgent tasks pending right now. Relax or plan ahead!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f2f5f8]">
              {focusTasks.map((task) => (
                <div key={task.id} className="py-3 flex items-start gap-3 group">
                  <button
                    onClick={() => toggleMutation.mutate(task.id)}
                    className="mt-0.5 text-[#cbd5e1] hover:text-[#176d50] transition"
                    aria-label="Mark task completed"
                  >
                    {task.completion_status === 'completed' ? (
                      <CheckCircle2 size={18} className="text-[#176d50]" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1e2b3e] truncate">
                        {task.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          task.priority === 'high'
                            ? 'bg-red-50 text-red-600'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#8392a5] mt-1">
                      <span>{task.subject?.code || task.event_type}</span>
                      <span>•</span>
                      <span>
                        Due {format(new Date(task.due_date), 'd MMM, yyyy')} ({task.due_time || '23:59'})
                      </span>
                      {task.venue && (
                        <>
                          <span>•</span>
                          <span className="truncate">{task.venue}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-md flex-none">
                    {task.source_platform}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Timetable Slots */}
        <div className="bg-white border border-[#e5ebf0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
            <div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#176d50]" />
                <h2 className="font-heading font-bold text-sm text-[#1e2a3c]">
                  Today's Slots
                </h2>
              </div>
              <p className="text-[11px] text-[#8493a8] mt-0.5">
                FFCS registered class schedule
              </p>
            </div>
            <button
              onClick={() => navigate('/timetable')}
              className="text-xs font-semibold text-[#176d50] hover:underline flex items-center gap-1"
            >
              Full Week <ChevronRight size={13} />
            </button>
          </div>

          {!todayClasses || todayClasses.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8c9cae]">
              No scheduled classes for today (Weekend or free day).
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayClasses.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-xl bg-[#f8fafc] border border-[#eef2f6] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1e2b3e]">
                        {slot.subject?.code || 'Course'}
                      </span>
                      <span className="text-[10px] text-[#176d50] font-semibold bg-[#e7f7ef] px-1.5 py-0.5 rounded">
                        {slot.slot_name || 'Slot'}
                      </span>
                    </div>
                    <span className="block text-[10px] text-[#64748b] mt-0.5 truncate max-w-[180px]">
                      {slot.subject?.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-semibold text-[#334155]">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    <span className="block text-[10px] text-[#94a3b8]">
                      {slot.classroom || 'Classroom'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Semester Progress Tracker */}
          <div className="pt-3 border-t border-[#f0f3f6]">
            <div className="flex justify-between items-center text-xs font-semibold text-[#334155] mb-2">
              <span>Semester Timeline</span>
              <span className="text-[#176d50]">68% Completed</span>
            </div>
            <div className="h-2 w-full bg-[#edf2f7] rounded-full overflow-hidden">
              <div className="h-full bg-[#176d50] rounded-full" style={{ width: '68%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#94a3b8] mt-1.5">
              <span>Week 12 of 18</span>
              <span>CAT-2 Phase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
