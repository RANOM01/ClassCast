import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Command, AlertCircle, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Return to previous page if redirect query param exists
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (user.role === 'Instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen pt-28 pb-20 flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black rotate-on-hover shadow-md">
              <Command className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-headline text-3xl font-bold tracking-tight text-[#EBEBEB]">
              ClassCast
            </span>
          </Link>
          <div className="tech-label text-emerald-400 mb-2">SYSTEM AUTHENTICATION</div>
          <h1 className="font-headline text-3xl text-white font-normal">
            Sign In to Your Workspace
          </h1>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl glass-panel border border-white/[0.1] p-8 shadow-2xl mb-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider tech-label">
                  PASSWORD
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign-In Helpers */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <div className="text-[10px] tech-label text-zinc-400 mb-3 text-center">
              QUICK DEMO CREDENTIAL SHORTCUTS
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('elena@classcast.dev', 'Password123!')}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-left hover:border-emerald-500/30 transition-all"
              >
                <div className="text-emerald-400 font-mono text-[10px]">INSTRUCTOR</div>
                <div className="text-zinc-200 truncate font-medium">Dr. Elena Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('alex@classcast.dev', 'Password123!')}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-left hover:border-emerald-500/30 transition-all"
              >
                <div className="text-cyan-400 font-mono text-[10px]">STUDENT (TEST)</div>
                <div className="text-zinc-200 truncate font-medium">Alex Rivera</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('marcus@classcast.dev', 'Password123!')}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-left hover:border-emerald-500/30 transition-all"
              >
                <div className="text-emerald-400 font-mono text-[10px]">INSTRUCTOR 2</div>
                <div className="text-zinc-200 truncate font-medium">Marcus Sterling</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('liam@classcast.dev', 'Password123!')}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-left hover:border-emerald-500/30 transition-all"
              >
                <div className="text-purple-400 font-mono text-[10px]">STUDENT 2</div>
                <div className="text-zinc-200 truncate font-medium">Liam Chen</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500 font-sans">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 font-semibold link-hover-emerald">
            Sign up as a Student
          </Link>
        </p>

      </div>
    </div>
  );
}
