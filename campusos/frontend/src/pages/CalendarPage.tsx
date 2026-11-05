import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Tag,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { AcademicEvent } from '../types';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // November 2026 default
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.getEvents(),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calculate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day: Date) => {
    if (!events) return [];
    return events.filter((e) => isSameDay(new Date(e.due_date), day));
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'Midterm':
      case 'CAT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FAT':
      case 'PAT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Lab Exam':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Project Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            ACADEMIC SCHEDULE
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            Academic Calendar
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            Visual month grid of submission deadlines, CATs, FATs, and university milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#d8e1e8] rounded-xl p-1 flex">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'month' ? 'bg-[#176d50] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'agenda' ? 'bg-[#176d50] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              Agenda View
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-[#d8e1e8] rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-[#64748b] hover:text-[#1e293b] rounded-lg hover:bg-[#f1f5f9]"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-[#1e293b] px-3 min-w-[130px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-[#64748b] hover:text-[#1e293b] rounded-lg hover:bg-[#f1f5f9]"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        /* Month Grid */
        <div className="bg-white rounded-2xl border border-[#e5ebf0] shadow-sm overflow-hidden">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-[#e9edf2] bg-[#f8fafc] text-center py-2.5 text-[11px] font-bold text-[#64748b]">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#edf2f7]">
            {days.map((day, idx) => {
              const dayEvents = getDayEvents(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={idx}
                  className={`min-h-[105px] p-2 flex flex-col transition hover:bg-[#fafbfc] ${
                    !isCurrentMonth ? 'bg-[#fafbfc]/50 text-[#cbd5e1]' : 'text-[#1e293b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isTodayDate ? 'bg-[#176d50] text-white shadow-sm' : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-semibold text-[#64748b]">
                        {dayEvents.length} {dayEvents.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left px-2 py-1 rounded text-[10px] font-semibold truncate border transition shadow-xs ${getEventBadgeClass(
                          evt.event_type
                        )}`}
                      >
                        {evt.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="bg-white rounded-2xl border border-[#e5ebf0] shadow-sm divide-y divide-[#f2f5f8] overflow-hidden">
          {!events || events.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8c9cae]">No events scheduled in agenda.</div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="p-4 flex items-center justify-between hover:bg-[#f8fafc] cursor-pointer transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f1f5f9] flex flex-col items-center justify-center">
                    <span className="font-heading font-extrabold text-sm text-[#1e293b]">
                      {format(new Date(evt.due_date), 'dd')}
                    </span>
                    <span className="text-[9px] font-bold text-[#64748b] uppercase">
                      {format(new Date(evt.due_date), 'MMM')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-[#1e293b]">{evt.title}</h3>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      {evt.subject?.code} • {evt.event_type} • Due {evt.due_time || '23:59'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${getEventBadgeClass(
                    evt.event_type
                  )}`}
                >
                  {evt.priority} priority
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-[#101b2d]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
              <span className="text-[10px] font-bold text-[#176d50] bg-[#e7f7ef] px-2 py-0.5 rounded uppercase">
                {selectedEvent.event_type}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#94a3b8] hover:text-[#1e293b]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <h2 className="font-heading font-extrabold text-lg text-[#1e293b]">
                {selectedEvent.title}
              </h2>

              {selectedEvent.description && (
                <p className="text-xs text-[#64748b] leading-relaxed bg-[#f8fafc] p-3 rounded-xl border border-[#eef2f6]">
                  {selectedEvent.description}
                </p>
              )}

              <div className="space-y-2 text-xs text-[#475569] pt-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-[#176d50]" />
                  <span>Due: {format(new Date(selectedEvent.due_date), 'EEEE, d MMMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#176d50]" />
                  <span>Time: {selectedEvent.due_time || '23:59'} (Asia/Kolkata)</span>
                </div>
                {selectedEvent.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#176d50]" />
                    <span>Venue: {selectedEvent.venue}</span>
                  </div>
                )}
                {selectedEvent.heard_from && (
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[#176d50]" />
                    <span>Source: {selectedEvent.heard_from}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f0f3f6] flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
