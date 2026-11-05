import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Plus, Trash2, X, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { AcademicMark, AcademicSubject } from '../types';

export const MarksPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [assessmentName, setAssessmentName] = useState('CAT-1');
  const [score, setScore] = useState(45);
  const [maxScore, setMaxScore] = useState(50);
  const [weightage, setWeightage] = useState(15);

  const { data: marks, isLoading: marksLoading } = useQuery({
    queryKey: ['marks'],
    queryFn: () => api.getMarks(),
  });

  const { data: cgpaData } = useQuery({
    queryKey: ['cgpa'],
    queryFn: api.getCGPA,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: api.getSubjects,
  });

  const createMutation = useMutation({
    mutationFn: api.createMark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      queryClient.invalidateQueries({ queryKey: ['cgpa'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      queryClient.invalidateQueries({ queryKey: ['cgpa'] });
    },
  });

  const handleOpenAdd = () => {
    if (subjects && subjects.length > 0) setSubjectId(subjects[0].id);
    setAssessmentName('CAT-1');
    setScore(45);
    setMaxScore(50);
    setWeightage(15);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    createMutation.mutate({
      subject_id: subjectId,
      assessment_name: assessmentName,
      score: Number(score),
      max_score: Number(maxScore),
      weightage_pct: Number(weightage),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            ACADEMIC PERFORMANCE
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            Marks & GPA Calculator
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            Continuous internal assessment scores (CAT-1, CAT-2, DA, Quizzes) and semester grade prediction.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus size={16} />
          <span>Add Assessment Score</span>
        </button>
      </div>

      {/* CGPA Summary Banner */}
      <div className="bg-gradient-to-r from-[#101b2d] to-[#1e3352] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4ade80] text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp size={16} />
            <span>Projected Academic Standing</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl">
            Estimated Semester GPA: <span className="text-[#4ade80]">{cgpaData?.estimated_gpa?.toFixed(2) || '8.85'}</span> / 10.0
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Calculated across {cgpaData?.total_registered_credits || 19} registered credit units based on VIT 10-point relative scale.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
            <span className="block text-[10px] text-[#cbd5e1] font-semibold uppercase">Total Credits</span>
            <span className="block font-heading font-bold text-xl text-white mt-0.5">
              {cgpaData?.total_registered_credits || 19}
            </span>
          </div>
          <div className="bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
            <span className="block text-[10px] text-[#cbd5e1] font-semibold uppercase">Courses</span>
            <span className="block font-heading font-bold text-xl text-white mt-0.5">
              {cgpaData?.subject_summaries?.length || 5}
            </span>
          </div>
        </div>
      </div>

      {/* Grade Summaries per Subject */}
      <div className="bg-white border border-[#e5ebf0] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-[#1e293b]">
          Subject-wise Grade Projections
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cgpaData?.subject_summaries?.map((sub) => (
            <div
              key={sub.subject_id}
              className="p-4 rounded-xl bg-[#f8fafc] border border-[#eef2f6] flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-[#1e293b]">{sub.subject_code}</span>
                <span className="block text-[10px] text-[#64748b] truncate max-w-[170px]">
                  {sub.subject_name}
                </span>
                <span className="block text-[9px] text-[#94a3b8] mt-1">
                  Credits: {sub.credits} • Internal: {sub.total_weighted_score.toFixed(1)}/100
                </span>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#e7f7ef] text-[#176d50]">
                  Grade {sub.predicted_grade}
                </span>
                <span className="block text-[10px] text-[#64748b] mt-1 font-semibold">
                  {sub.grade_points.toFixed(1)} GP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Marks Records List */}
      <div className="bg-white rounded-2xl border border-[#e5ebf0] shadow-sm divide-y divide-[#f2f5f8] overflow-hidden">
        <div className="p-4 bg-[#f8fafc] flex items-center justify-between text-xs font-bold text-[#475569]">
          <span>Recorded Assessment Marks</span>
          <span>{marks?.length || 0} scores</span>
        </div>

        {marksLoading ? (
          <div className="py-10 text-center text-xs text-[#94a3b8]">Loading scores...</div>
        ) : !marks || marks.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#94a3b8]">
            No assessment marks logged yet. Click "+ Add Assessment Score" to track your continuous progress.
          </div>
        ) : (
          marks.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-[#fafbfc] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eaf2ff] text-[#2563eb] flex items-center justify-center font-bold text-xs">
                  {m.subject?.code?.slice(0, 3) || 'DA'}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[#1e293b]">
                    {m.subject?.code} — {m.assessment_name}
                  </h4>
                  <p className="text-[10px] text-[#64748b]">
                    Weightage: {m.weightage_pct}% of course total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-heading font-extrabold text-sm text-[#176d50]">
                    {m.score} / {m.max_score}
                  </span>
                  <span className="block text-[10px] text-[#94a3b8]">
                    {((m.score / m.max_score) * 100).toFixed(1)}%
                  </span>
                </div>

                <button
                  onClick={() => deleteMutation.mutate(m.id)}
                  className="p-1.5 text-[#94a3b8] hover:text-red-600 rounded-lg transition"
                  title="Delete score"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Mark Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#101b2d]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
              <h2 className="font-heading font-extrabold text-lg text-[#1e293b]">
                Record Assessment Score
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]">
                <X size={18} />
              </button>
            </div>

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

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT-1, CAT-2, DA-1, Quiz 2"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Score
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Weightage (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={weightage}
                    onChange={(e) => setWeightage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>
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
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
