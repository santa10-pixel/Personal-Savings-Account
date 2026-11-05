import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Trash2, MapPin, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { TimetableEntry, AcademicSubject } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TimetablePage: React.FC = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:50');
  const [slotName, setSlotName] = useState('A1');
  const [classroom, setClassroom] = useState('SJT-412');
  const [courseType, setCourseType] = useState('Theory');
  const [error, setError] = useState<string | null>(null);

  const { data: timetable, isLoading } = useQuery({
    queryKey: ['timetable'],
    queryFn: api.getTimetable,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: api.getSubjects,
  });

  const createMutation = useMutation({
    mutationFn: api.createTimetableEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      queryClient.invalidateQueries({ queryKey: ['timetable-today'] });
      setModalOpen(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to add timetable slot.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTimetableEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      queryClient.invalidateQueries({ queryKey: ['timetable-today'] });
    },
  });

  const handleOpenAdd = () => {
    setError(null);
    if (subjects && subjects.length > 0) setSubjectId(subjects[0].id);
    setDayOfWeek(0);
    setStartTime('08:00');
    setEndTime('08:50');
    setSlotName('A1');
    setClassroom('SJT-412');
    setCourseType('Theory');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    createMutation.mutate({
      subject_id: subjectId,
      day_of_week: Number(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      slot_name: slotName,
      classroom,
      course_type: courseType,
    });
  };

  const currentDayIndex = new Date().getDay() - 1; // 0=Mon, 4=Fri

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            SLOT SCHEDULE
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            Weekly Slot Timetable
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            Theory & Laboratory slot allocation based on FFCS course registration.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus size={16} />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {/* Week Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map((dayName, dayIndex) => {
          const daySlots = timetable?.filter((t) => t.day_of_week === dayIndex) || [];
          const isToday = currentDayIndex === dayIndex;

          return (
            <div
              key={dayIndex}
              className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col ${
                isToday ? 'border-[#176d50] ring-1 ring-[#176d50]/20' : 'border-[#e5ebf0]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6] mb-3">
                <span className="font-heading font-bold text-xs text-[#1e293b]">
                  {dayName}
                </span>
                {isToday && (
                  <span className="text-[9px] font-extrabold text-white bg-[#176d50] px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-2.5 flex-1">
                {daySlots.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-[#94a3b8]">
                    No classes
                  </div>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-[#f8fafc] border border-[#eef2f6] hover:bg-[#f1f5f9] transition group relative"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#1e293b] block">
                            {slot.subject?.code}
                          </span>
                          <span className="text-[10px] text-[#64748b] block truncate max-w-[130px]">
                            {slot.subject?.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-[#176d50] bg-[#e7f7ef] px-1.5 py-0.5 rounded">
                          {slot.slot_name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#64748b] mt-2 pt-2 border-t border-[#e2e8f0]">
                        <span className="font-medium text-[#334155]">
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <span className="flex items-center gap-1 text-[#94a3b8]">
                          <MapPin size={10} /> {slot.classroom}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteMutation.mutate(slot.id)}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                        title="Delete slot"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#101b2d]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
              <h2 className="font-heading font-extrabold text-lg text-[#1e293b]">
                Add Timetable Slot
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="flex-none" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Subject / Course
                </label>
                <select
                  value={subjectId || ''}
                  onChange={(e) => setSubjectId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                >
                  {subjects?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Day of the Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  >
                    <option value={0}>Monday</option>
                    <option value={1}>Tuesday</option>
                    <option value={2}>Wednesday</option>
                    <option value={3}>Thursday</option>
                    <option value={4}>Friday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Slot Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A1, B1, L1+L2"
                    value={slotName}
                    onChange={(e) => setSlotName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Classroom / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. SJT-412"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f3f6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  Save Timetable Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
