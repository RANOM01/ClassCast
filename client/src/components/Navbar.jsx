import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Command, Menu, X, ArrowUpRight, LogOut, User, Sparkles } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const dashboardRoute = user?.role === 'Instructor' ? '/instructor/dashboard' : '/student/dashboard';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black shadow-md rotate-on-hover">
            <Command className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight text-[#EBEBEB] group-hover:text-emerald-400 transition-colors">
            ClassCast
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/catalog"
            className="text-sm font-medium text-zinc-300 hover:text-white link-hover-emerald transition-colors"
          >
            Courses
          </Link>
          <a
            href="/#features"
            className="text-sm font-medium text-zinc-300 hover:text-white link-hover-emerald transition-colors"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-zinc-300 hover:text-white link-hover-emerald transition-colors"
          >
            How It Works
          </a>
        </nav>

        {/* Right CTA / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={dashboardRoute}
                className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <span>Open dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-zinc-300 hover:text-white link-hover-emerald transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="relative group px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center gap-2"
              >
                <span className="relative z-10">Get Started</span>
                <span className="w-2 h-2 rounded-full bg-black/60 animate-ping"></span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 py-6 px-6 shadow-2xl flex flex-col gap-4">
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-zinc-200 hover:text-emerald-400 py-2 border-b border-white/5"
          >
            Courses Catalog
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-zinc-200 hover:text-emerald-400 py-2 border-b border-white/5"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-zinc-200 hover:text-emerald-400 py-2 border-b border-white/5"
          >
            How It Works
          </a>

          {user ? (
            <div className="pt-2 flex flex-col gap-3">
              <Link
                to={dashboardRoute}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-full bg-emerald-500 text-black font-semibold text-sm shadow-lg shadow-emerald-500/20"
              >
                Open dashboard ({user.role})
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-center py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-red-400 text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-200 font-medium text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-full bg-emerald-500 text-black font-semibold text-sm shadow-lg shadow-emerald-500/20"
              >
                Get Started as Student
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
