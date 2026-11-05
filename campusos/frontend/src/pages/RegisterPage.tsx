import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('Vellore Campus');
  const [programme, setProgramme] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState(3);
  const [semester, setSemester] = useState('Fall Semester 2026-27');
  const [regNo, setRegNo] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        university: 'Vellore Institute of Technology',
        campus,
        programme,
        branch,
        year_of_study: Number(yearOfStudy),
        semester,
        registration_number: regNo.toUpperCase(),
        reminder_email: reminderEmail || email
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create student account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#176d50] text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap size={28} />
          </div>
          <h2 className="mt-4 font-heading font-extrabold text-2xl text-[#17263d] tracking-tight">
            Create your CampusOS account
          </h2>
          <p className="mt-1 text-xs text-[#6e7d91]">
            Set up your academic profile for intelligent deadline planning.
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#e5ebf0] rounded-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-none" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Santhosh Sivan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21BCE1042"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50] focus:border-transparent transition uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  VIT Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@vitstudent.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50] focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  Campus
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                >
                  <option value="Vellore Campus">Vellore Campus</option>
                  <option value="Chennai Campus">Chennai Campus</option>
                  <option value="VIT-AP">VIT-AP</option>
                  <option value="VIT Bhopal">VIT Bhopal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  Programme
                </label>
                <select
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.Tech Honours">B.Tech Honours</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="Integrated M.Tech">Integrated M.Tech</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  Branch / Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                  Year of Study
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                Personal Reminder Email (Optional)
              </label>
              <input
                type="email"
                placeholder="Where should daily 8:00 AM alerts be sent?"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50]"
              />
              <span className="block text-[10px] text-[#8695a7] mt-1">
                Defaults to your university email if left blank.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Setting up student profile...' : 'Complete Registration'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6b7b90]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#176d50] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
