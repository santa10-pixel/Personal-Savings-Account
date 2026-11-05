import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('student1@vitstudent.ac.in');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#176d50] text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap size={28} />
        </div>
        <h2 className="mt-4 font-heading font-extrabold text-2xl text-[#17263d] tracking-tight">
          Welcome to CampusOS
        </h2>
        <p className="mt-1 text-xs text-[#6e7d91]">
          Your entire academic life, in one place.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#e5ebf0] rounded-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-none" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4b586d] mb-1">
                University Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name.regno@vitstudent.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50] focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#4b586d]">
                  Password
                </label>
                <span className="text-[10px] text-[#176d50] font-medium cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#d8e1e8] rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176d50] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to CampusOS'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Quick Demo Credentials Button */}
          <div className="mt-5 pt-4 border-t border-[#f0f3f6]">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-2 px-3 text-[11px] font-semibold text-[#238c68] bg-[#eef7f3] hover:bg-[#e2f2eb] rounded-lg transition"
            >
              Autofill Seed Demo Account (student1@vitstudent.ac.in)
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-[#6b7b90]">
            <span>Don't have an account yet?</span>
            <Link to="/register" className="font-semibold text-[#176d50] hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 flex items-start gap-2.5 text-[10px] text-[#7d8b9d] px-4 text-center justify-center">
          <ShieldCheck size={16} className="text-[#176d50] flex-none" />
          <span>Never enter your official VTOP or Microsoft account passwords into third-party apps.</span>
        </div>
      </div>
    </div>
  );
};
