import React from 'react';
import { Link } from 'react-router-dom';
import { Command } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#050505] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black">
                <Command className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight text-[#EBEBEB]">
                ClassCast
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-sans">
              Precision learning management system built for rigorous technical mastery and architectural depth.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] tech-label text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CORE WORKFLOW ONLINE
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 tech-label">
              Platform
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/catalog" className="hover:text-emerald-400 transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-emerald-400 transition-colors">
                  Curriculum Builder
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-emerald-400 transition-colors">
                  Instructor Roster
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-emerald-400 transition-colors">
                  Gradebook & Quizzes
                </a>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 tech-label">
              Portals
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Instructor Portal
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-emerald-400 transition-colors">
                  Create Student Account
                </Link>
              </li>
            </ul>
          </div>

          {/* System Telemetry */}
          <div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 tech-label">
              Design & Architecture
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 space-y-2">
              <div className="flex justify-between">
                <span>Theme:</span>
                <span className="text-zinc-200 font-mono">Cyber Serif</span>
              </div>
              <div className="flex justify-between">
                <span>Stack:</span>
                <span className="text-emerald-400 font-mono">MERN + Tailwind</span>
              </div>
              <div className="flex justify-between">
                <span>Sessions:</span>
                <span className="text-zinc-200 font-mono">MongoDB HTTP-Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} ClassCast LMS. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">System Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
