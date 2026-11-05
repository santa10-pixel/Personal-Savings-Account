import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit2,
  X,
  Calculator,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { AttendanceRecord, AcademicSubject } from '../types';

export const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: api.getAttendance,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: api.getSubjects,
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [attended, setAttended] = useState(25);
  const [total, setTotal] = useState(30);
  const [threshold, setThreshold] = useState(75.0);

  // Standalone Calculator State
  const [calcAttended, setCalcAttended] = useState(28);
  const [calcTotal, setCalcTotal] = useState(32);
  const [calcThreshold, setCalcThreshold] = useState(75.0);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: api.saveAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setModalOpen(false);
    },
  });

  const handleOpenAdd = () => {
    if (subjects && subjects.length > 0) setSubjectId(subjects[0].id);
    setAttended(25);
    setTotal(30);
    setThreshold(75.0);
    setModalOpen(true);
  };

  const handleEdit = (rec: AttendanceRecord) => {
    setSubjectId(rec.subject_id);
    setAttended(rec.attended_classes);
    setTotal(rec.total_classes);
    setThreshold(rec.required_threshold);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    saveMutation.mutate({
      subject_id: subjectId,
      attended_classes: Number(attended),
      total_classes: Number(total),
      required_threshold: Number(threshold),
    });
  };

  // Calculator calculations
  const calcPct = calcTotal > 0 ? ((calcAttended / calcTotal) * 100).toFixed(1) : '100.0';
  const t = calcThreshold / 100.0;
  const calcCanMiss = calcAttended >= t * calcTotal ? Math.floor((calcAttended - t * calcTotal) / t) : 0;
  const calcNeeded =
    Number(calcPct) < calcThreshold && t < 1.0 ? Math.ceil((t * calcTotal - calcAttended) / (1.0 - t)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            COMPLIANCE TRACKER
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            Attendance & Eligibility
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            VIT mandatory 75% attendance policy monitoring with automated safe-margin calculations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus size={16} />
          <span>Update Course Attendance</span>
        </button>
      </div>

      {/* Course Attendance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-[#8c9cae]">
            Loading attendance records...
          </div>
        ) : !records || records.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#e5ebf0]">
            <UserCheck size={32} className="mx-auto text-[#94a3b8] mb-2" />
            <p className="text-xs font-semibold text-[#1e293b]">No attendance records found</p>
            <p className="text-[11px] text-[#64748b] mt-0.5">Click update to add your course statistics.</p>
          </div>
        ) : (
          records.map((rec) => {
            const isDanger = rec.attendance_percentage < rec.required_threshold;
            return (
              <div
                key={rec.id}
                className="bg-white border border-[#e5ebf0] rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-heading font-extrabold text-sm text-[#1e293b]">
                      {rec.subject?.code}
                    </span>
                    <h3 className="text-xs font-medium text-[#64748b] truncate max-w-[180px]">
                      {rec.subject?.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleEdit(rec)}
                    className="p-1.5 text-[#94a3b8] hover:text-[#176d50] hover:bg-[#f1f5f9] rounded-lg transition"
                    title="Edit attendance"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>

                {/* Progress Metric Ring Bar */}
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span
                      className={`font-heading font-extrabold text-2xl ${
                        isDanger ? 'text-red-600' : 'text-[#176d50]'
                      }`}
                    >
                      {rec.attendance_percentage.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-[#64748b] font-medium">
                      {rec.attended_classes} of {rec.total_classes} attended
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDanger ? 'bg-red-500' : 'bg-[#176d50]'
                      }`}
                      style={{ width: `${Math.min(100, rec.attendance_percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Threshold & Bunk Analysis */}
                <div className="pt-3 border-t border-[#f0f3f6] flex items-center justify-between text-[11px]">
                  {isDanger ? (
                    <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                      <AlertTriangle size={14} />
                      <span>Must attend next {rec.classes_needed_for_target} classes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#176d50] font-semibold">
                      <CheckCircle size={14} />
                      <span>Safe to miss {rec.can_miss_classes} class(es)</span>
                    </div>
                  )}

                  <span className="text-[10px] text-[#8c9cae]">
                    Threshold: {rec.required_threshold}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Standalone Bunk Calculator */}
      <div className="bg-white border border-[#e5ebf0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-[#176d50]" />
          <h2 className="font-heading font-bold text-sm text-[#1e293b]">
            Interactive "Safe to Miss" Bunk Calculator
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Classes Attended
            </label>
            <input
              type="number"
              min="0"
              value={calcAttended}
              onChange={(e) => setCalcAttended(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Total Conducted Classes
            </label>
            <input
              type="number"
              min="1"
              value={calcTotal}
              onChange={(e) => setCalcTotal(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Required Threshold (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={calcThreshold}
              onChange={(e) => setCalcThreshold(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
            />
          </div>

          <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-center">
            <span className="text-[10px] text-[#64748b] block font-semibold">Result</span>
            <span className="font-heading font-bold text-sm text-[#176d50] block mt-0.5">
              {calcPct}% • {Number(calcPct) >= calcThreshold ? `Safe: ${calcCanMiss} classes` : `Need: ${calcNeeded} classes`}
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit Attendance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#101b2d]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
              <h2 className="font-heading font-extrabold text-lg text-[#1e293b]">
                Record Course Attendance
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Classes Attended *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={attended}
                    onChange={(e) => setAttended(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Total Conducted *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={total}
                    onChange={(e) => setTotal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Required Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
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
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
