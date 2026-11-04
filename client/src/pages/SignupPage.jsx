import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Command, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);
      // Public signup creates Student account -> redirect to student dashboard
      navigate('/student/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
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
          <div className="tech-label text-emerald-400 mb-2">PUBLIC STUDENT ENROLLMENT</div>
          <h1 className="font-headline text-3xl text-white font-normal">
            Create Student Account
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Register for courses, study lessons, and receive instructor feedback.
          </p>
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
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Matthews"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@domain.com"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
                PASSWORD (MIN 6 CHARACTERS)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Public signup creates a <strong>Student</strong> account. Instructor accounts are provisioned via CLI.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold link-hover-emerald">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
