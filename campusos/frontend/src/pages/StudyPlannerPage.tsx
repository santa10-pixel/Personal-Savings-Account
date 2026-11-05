import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookMarked, Sparkles, CheckCircle2, Circle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { format } from 'date-fns';

export const StudyPlannerPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: examEvents } = useQuery({
    queryKey: ['events-exams'],
    queryFn: () => api.getEvents({ completion_status: 'pending' }),
  });

  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyHours, setDailyHours] = useState(2.5);
  const [difficulty, setDifficulty] = useState('medium');
  const [topicsInput, setTopicsInput] = useState(
    'Module 1: Architecture & Peripherals\nModule 2: Memory Hierarchy & Cache\nModule 3: Pipelining & Branch Hazards\nModule 4: Parallel Processing & Vectors'
  );
  const [error, setError] = useState<string | null>(null);

  // Filter only examinations
  const validExams = examEvents?.filter((e) =>
    ['Midterm', 'CAT', 'FAT', 'PAT', 'Lab Exam', 'Quiz'].includes(e.event_type)
  );

  // Active sessions query
  const { data: studySessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['study-sessions', selectedEventId],
    queryFn: () => (selectedEventId ? api.getEventStudySessions(selectedEventId) : Promise.resolve([])),
    enabled: !!selectedEventId,
  });

  const generateMutation = useMutation({
    mutationFn: api.generateStudyPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions', selectedEventId] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to generate study plan.');
    },
  });

  const toggleSessionMutation = useMutation({
    mutationFn: api.toggleStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions', selectedEventId] });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      setError('Please select an upcoming examination.');
      return;
    }
    const topicList = topicsInput
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    generateMutation.mutate({
      event_id: selectedEventId,
      start_date: startDate,
      daily_available_hours: Number(dailyHours),
      subject_difficulty: difficulty,
      topics: topicList,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            EXAM PREPARATION ENGINE
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            Smart Study Planner
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            Generate an automated day-by-day revision schedule for upcoming Midterms, CATs, and FATs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator Form */}
        <div className="bg-white border border-[#e5ebf0] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0f3f6]">
            <Sparkles size={18} className="text-[#176d50]" />
            <h2 className="font-heading font-bold text-sm text-[#1e293b]">
              Generate Revision Schedule
            </h2>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-none" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Target Examination *
              </label>
              <select
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(Number(e.target.value) || undefined)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              >
                <option value="">Select an examination...</option>
                {validExams?.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} (Due: {format(new Date(ex.due_date), 'dd MMM')})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Daily Study Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="8"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Subject Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              >
                <option value="easy">Easy (1.0x time allocation)</option>
                <option value="medium">Medium (Standard pace)</option>
                <option value="hard">Hard (Extra 25% deep dive sessions)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Syllabus Topics (One per line)
              </label>
              <textarea
                rows={4}
                required
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              />
            </div>

            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles size={15} />
              <span>{generateMutation.isPending ? 'Generating Plan...' : 'Generate Preparation Schedule'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Generated Sessions */}
        <div className="lg:col-span-2 bg-white border border-[#e5ebf0] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
            <div>
              <h2 className="font-heading font-bold text-sm text-[#1e293b]">
                Structured Daily Study Sessions
              </h2>
              <p className="text-[11px] text-[#64748b]">
                Tick sessions as you complete them to stay ahead of the examination.
              </p>
            </div>
            {studySessions && studySessions.length > 0 && (
              <span className="text-xs font-semibold text-[#176d50] bg-[#e7f7ef] px-2.5 py-1 rounded-lg">
                {studySessions.filter((s) => s.is_completed).length} / {studySessions.length} Completed
              </span>
            )}
          </div>

          {!selectedEventId ? (
            <div className="py-16 text-center text-xs text-[#94a3b8]">
              Select an examination on the left to view or generate its study schedule.
            </div>
          ) : sessionsLoading ? (
            <div className="py-16 text-center text-xs text-[#94a3b8]">
              Loading sessions...
            </div>
          ) : !studySessions || studySessions.length === 0 ? (
            <div className="py-16 text-center">
              <BookMarked size={32} className="mx-auto text-[#94a3b8] mb-2" />
              <p className="text-xs font-semibold text-[#1e293b]">No study plan generated yet</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Click "Generate Preparation Schedule" to distribute topics across your calendar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f2f5f8] max-h-[600px] overflow-y-auto">
              {studySessions.map((session) => (
                <div
                  key={session.id}
                  className={`py-3.5 flex items-start gap-3.5 transition ${
                    session.is_completed ? 'opacity-60' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleSessionMutation.mutate(session.id)}
                    className="mt-0.5 text-[#cbd5e1] hover:text-[#176d50] transition flex-none"
                    aria-label="Toggle completed"
                  >
                    {session.is_completed ? (
                      <CheckCircle2 size={18} className="text-[#176d50]" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-xs text-[#1e293b] ${
                        session.is_completed ? 'line-through text-[#94a3b8]' : ''
                      }`}
                    >
                      {session.title}
                    </h3>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{session.topic}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[#94a3b8] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {format(new Date(session.session_date), 'EEE, d MMM yyyy')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {session.start_time} ({session.duration_minutes} mins)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
