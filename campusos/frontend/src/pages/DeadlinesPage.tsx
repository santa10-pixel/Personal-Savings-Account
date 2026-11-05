import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  X,
  ExternalLink,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { AcademicEvent, AcademicSubject } from '../types';
import { format } from 'date-fns';

export const DeadlinesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('due_date');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [eventType, setEventType] = useState('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [heardFrom, setHeardFrom] = useState('');

  // Queries
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', eventTypeFilter, priorityFilter, statusFilter, search, sortBy],
    queryFn: () =>
      api.getEvents({
        event_type: eventTypeFilter,
        priority: priorityFilter,
        completion_status: statusFilter,
        search: search,
        sort_by: sortBy,
      }),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: api.getSubjects,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-focus'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AcademicEvent> }) =>
      api.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-focus'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-focus'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: api.toggleEventComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-focus'] });
    },
  });

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setSubjectId(subjects && subjects.length > 0 ? subjects[0].id : undefined);
    setEventType('Assignment');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
    setDueTime('23:59');
    setPriority('medium');
    setDescription('');
    setVenue('VTOP / SJT');
    setHeardFrom('Faculty Announcement');
    setModalOpen(true);
  };

  const openEditModal = (evt: AcademicEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setSubjectId(evt.subject_id);
    setEventType(evt.event_type);
    setDueDate(evt.due_date.split('T')[0]);
    setDueTime(evt.due_time || '23:59');
    setPriority(evt.priority);
    setDescription(evt.description || '');
    setVenue(evt.venue || '');
    setHeardFrom(evt.heard_from || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventDateTime = new Date(`${dueDate}T${dueTime || '23:59'}:00Z`).toISOString();

    if (editingEvent) {
      updateMutation.mutate({
        id: editingEvent.id,
        data: {
          title,
          subject_id: subjectId,
          event_type: eventType,
          due_date: eventDateTime,
          due_time: dueTime,
          priority,
          description,
          venue,
          heard_from: heardFrom,
        },
      });
    } else {
      createMutation.mutate({
        title,
        subject_id: subjectId,
        event_type: eventType,
        due_date: eventDateTime,
        due_time: dueTime,
        priority,
        description,
        venue,
        heard_from: heardFrom,
        is_manual: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            ACADEMIC EVENT MANAGER
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            Deadlines & Examinations
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            Manual and synchronized academic milestones, midterms, PATs, FATs, and assignments.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus size={16} />
          <span>Add Academic Event</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5ebf0] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search by title, subject, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#475569] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Assignment">Assignments / DAs</option>
            <option value="Midterm">Midterms / CATs</option>
            <option value="PAT">Practical Assessment (PAT)</option>
            <option value="FAT">Final Exam (FAT)</option>
            <option value="Lab Exam">Lab Exams</option>
            <option value="Project Review">Project Reviews</option>
            <option value="Quiz">Quizzes</option>
            <option value="Target">Personal Targets</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#475569] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#475569] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl border border-[#e5ebf0] shadow-sm divide-y divide-[#f2f5f8] overflow-hidden">
        {eventsLoading ? (
          <div className="py-12 text-center text-xs text-[#8c9cae]">Loading academic events...</div>
        ) : !events || events.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar size={32} className="mx-auto text-[#94a3b8] mb-2" />
            <p className="text-xs font-semibold text-[#1e293b]">No academic events found</p>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Try adjusting your search criteria or click "Add Academic Event" to create one.
            </p>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className={`p-4 flex items-start gap-4 hover:bg-[#fafbfc] transition ${
                evt.completion_status === 'completed' ? 'opacity-65' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleMutation.mutate(evt.id)}
                className="mt-1 text-[#cbd5e1] hover:text-[#176d50] transition flex-none"
                aria-label="Toggle completed"
              >
                {evt.completion_status === 'completed' ? (
                  <CheckCircle2 size={20} className="text-[#176d50]" />
                ) : (
                  <Circle size={20} />
                )}
              </button>

              {/* Date Box */}
              <div className="w-11 h-12 bg-[#f1f5f9] rounded-xl flex flex-col items-center justify-center flex-none">
                <span className="font-heading font-extrabold text-sm text-[#1e293b]">
                  {format(new Date(evt.due_date), 'dd')}
                </span>
                <span className="text-[8px] font-bold text-[#64748b] uppercase tracking-wider">
                  {format(new Date(evt.due_date), 'MMM')}
                </span>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`font-semibold text-xs text-[#1e293b] truncate ${
                      evt.completion_status === 'completed' ? 'line-through text-[#94a3b8]' : ''
                    }`}
                  >
                    {evt.title}
                  </h3>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      evt.priority === 'high'
                        ? 'bg-red-50 text-red-600'
                        : evt.priority === 'medium'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {evt.priority}
                  </span>
                  <span className="text-[9px] font-medium text-[#475569] bg-[#f1f5f9] px-2 py-0.5 rounded">
                    {evt.event_type}
                  </span>
                </div>

                {evt.description && (
                  <p className="text-[11px] text-[#64748b] mt-1 line-clamp-2">{evt.description}</p>
                )}

                <div className="flex items-center gap-3 text-[10px] text-[#8392a5] mt-1.5 flex-wrap">
                  <span className="font-semibold text-[#176d50]">
                    {evt.subject?.code} {evt.subject?.name && `• ${evt.subject.name}`}
                  </span>
                  <span>•</span>
                  <span>Time: {evt.due_time || '23:59'}</span>
                  {evt.venue && (
                    <>
                      <span>•</span>
                      <span>Venue: {evt.venue}</span>
                    </>
                  )}
                  {evt.heard_from && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#475569]">
                        <Tag size={10} /> {evt.heard_from}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Source Tag & Action Buttons */}
              <div className="flex items-center gap-2 flex-none">
                <span className="text-[9px] font-semibold text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-1 rounded">
                  {evt.source_platform}
                </span>

                <button
                  onClick={() => openEditModal(evt)}
                  className="p-1.5 text-[#94a3b8] hover:text-[#176d50] hover:bg-[#f1f5f9] rounded-lg transition"
                  title="Edit event"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete academic event "${evt.title}"?`)) {
                      deleteMutation.mutate(evt.id);
                    }
                  }}
                  className="p-1.5 text-[#94a3b8] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete event"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#101b2d]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f3f6]">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-[#1e293b]">
                  {editingEvent ? 'Edit Academic Event' : 'Create Academic Event'}
                </h2>
                <p className="text-[11px] text-[#64748b]">
                  Add assignments, midterms, PATs, FATs, and personal study targets.
                </p>
              </div>
              <button onClick={closeModal} className="text-[#94a3b8] hover:text-[#1e293b]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE3002 Digital Assignment 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Course / Subject
                  </label>
                  <select
                    value={subjectId || ''}
                    onChange={(e) => setSubjectId(Number(e.target.value) || undefined)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  >
                    {subjects?.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  >
                    <option value="Assignment">Assignment (DA)</option>
                    <option value="Midterm">Midterm (CAT-1 / CAT-2)</option>
                    <option value="PAT">Practical Assessment (PAT)</option>
                    <option value="FAT">Final Exam (FAT)</option>
                    <option value="Lab Exam">Lab Exam</option>
                    <option value="Project Review">Project Review</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Target">Personal Target</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Where did you hear about this?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Faculty / WhatsApp / Self"
                    value={heardFrom}
                    onChange={(e) => setHeardFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Venue / Submission Portal
                </label>
                <input
                  type="text"
                  placeholder="e.g. VTOP Submission Portal / TT-412"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Description / Preparation Checklist (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Reference materials, rubric notes, team split..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f3f6]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  {editingEvent ? 'Update Event' : 'Save Academic Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
