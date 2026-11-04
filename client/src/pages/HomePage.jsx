import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/SpotlightCard';
import { CourseCoverImage } from '../components/CoverPresets';
import {
  Compass,
  Layers,
  Users,
  FileCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  BookOpen,
  PlayCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
      })
      .catch((err) => console.error('Failed to load courses for homepage table:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* =========================================================================
          SECTION B: SPLIT HERO (100vh desktop)
         ========================================================================= */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 lg:py-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Technical Label with Emerald Pulse Dot */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-6 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SYSTEM ONLINE // ARCHITECTURE & MASTERY
            </div>

            {/* Display Headline: Newsreader, ~100px on desktop, tight tracking, 0.9 line height */}
            <h1 className="font-headline text-5xl sm:text-7xl lg:text-[92px] leading-[0.95] lg:leading-[0.9] tracking-[-0.03em] font-normal text-[#EBEBEB] mb-8">
              A place to teach. A space to <span className="italic font-normal text-emerald-400 underline decoration-emerald-500/40 decoration-wavy underline-offset-8">learn.</span>
            </h1>

            {/* Muted Inter Body Copy */}
            <p className="font-sans text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed mb-10 font-normal">
              ClassCast is an uncompromising learning management system designed for deep technical curricula, real-time rosters, interactive quizzes, and rigorous feedback loops.
            </p>

            {/* Two CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/catalog"
                className="px-8 py-3.5 rounded-full bg-white text-black hover:bg-zinc-200 text-sm font-semibold tracking-wide transition-all duration-300 shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.3)] flex items-center gap-2"
              >
                <span>Explore courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-full bg-transparent hover:bg-white/[0.05] text-[#EBEBEB] border border-white/20 hover:border-white/40 text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2"
              >
                <span>Instructor sign in</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Floating HTML/CSS learning-workspace preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Glass workspace card */}
              <div className="relative rounded-3xl glass-panel p-6 shadow-2xl border border-white/[0.12] overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
                
                {/* Header of preview window */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
                    <span className="ml-2 text-xs font-mono text-zinc-500">classcast.workspace // preview</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 tech-label text-[9px]">
                    ILLUSTRATIVE PREVIEW
                  </span>
                </div>

                {/* Course Banner in preview */}
                <div className="rounded-2xl overflow-hidden mb-5 border border-white/[0.06]">
                  <CourseCoverImage presetId="preset-cyber-grid" className="w-full h-28" title="Distributed Systems: Consensus" />
                </div>

                {/* Progress Indicator */}
                <div className="mb-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-400 font-sans">Curriculum Progress</span>
                    <span className="text-emerald-400 font-mono font-medium">3 of 5 lessons (60%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"></div>
                  </div>
                </div>

                {/* Curriculum Rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-200">The CAP Theorem & PACELC Trade-offs</div>
                        <div className="text-[10px] text-zinc-500 font-mono">18 MIN // READABLE SPEC</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 font-mono">COMPLETED</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                      <div>
                        <div className="text-xs font-medium text-white">Raft Consensus: Leader Election</div>
                        <div className="text-[10px] text-emerald-400/70 font-mono">NOW PLAYING // INTERACTIVE</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">RESUME</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] opacity-70">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-300">Byzantine Fault Tolerance Protocols</div>
                        <div className="text-[10px] text-zinc-500 font-mono">NEXT LESSON</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">QUEUED</span>
                  </div>
                </div>

                {/* Pulse detail pill */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Active sync to MongoDB</span>
                  </div>
                  <span className="font-mono text-zinc-500">LATENCY 4ms</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION C: FEATURE GRID (3-column Bento layout)
         ========================================================================= */}
      <section id="features" className="relative py-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-3">
              INTEGRATED PLATFORM ARCHITECTURE
            </div>
            <h2 className="font-headline text-4xl sm:text-5xl text-[#EBEBEB] font-normal tracking-tight mb-4">
              Engineered for both sides of the lecture hall.
            </h2>
            <p className="text-zinc-400 font-sans text-base leading-relaxed">
              Every workflow connects directly to persisted MongoDB records—from course publication and enrollment to dynamic rosters and feedback.
            </p>
          </div>

          {/* 3-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Bento Card 1: Discovery */}
            <SpotlightCard className="p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Compass className="w-6 h-6 rotate-on-hover" />
                </div>
                <div className="tech-label text-emerald-400 mb-2">CATALOG DISCOVERY</div>
                <h3 className="font-headline text-2xl text-[#EBEBEB] font-medium mb-3">
                  Searchable Course Catalog
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                  Visitors and enrolled students explore published masterclasses with deep level and category filters, syllabus previews, and immediate registration.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs font-mono text-zinc-500 flex justify-between">
                <span>INDEXED QUERIES</span>
                <span className="text-emerald-400">STATUS: PUBLISHED</span>
              </div>
            </SpotlightCard>

            {/* Bento Card 2: Curriculum Builder */}
            <SpotlightCard className="p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="w-6 h-6 rotate-on-hover" />
                </div>
                <div className="tech-label text-emerald-400 mb-2">CURRICULUM ARCHITECTURE</div>
                <h3 className="font-headline text-2xl text-[#EBEBEB] font-medium mb-3">
                  Modular Lesson Builder
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                  Build structured modules, arrange lessons with move up/down controls, embed video streams, and link verified technical references safely.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs font-mono text-zinc-500 flex justify-between">
                <span>ORDER REORDERING</span>
                <span className="text-emerald-400">DESTRUCTION PROTECTED</span>
              </div>
            </SpotlightCard>

            {/* Bento Card 3: Student Rosters */}
            <SpotlightCard className="p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 rotate-on-hover" />
                </div>
                <div className="tech-label text-emerald-400 mb-2">PERSISTED ENROLLMENTS</div>
                <h3 className="font-headline text-2xl text-[#EBEBEB] font-medium mb-3">
                  Live Course Rosters
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                  The instructor’s Students tab renders real registered student records with registration dates, lesson counts, completion percentages, and last activity timestamps.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs font-mono text-zinc-500 flex justify-between">
                <span>COMPOUND UNIQUE INDEX</span>
                <span className="text-emerald-400">NO DUPLICATES</span>
              </div>
            </SpotlightCard>

            {/* Bento Card 4: Assignments */}
            <SpotlightCard className="p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-6 h-6 rotate-on-hover" />
                </div>
                <div className="tech-label text-emerald-400 mb-2">EVALUATION & DEADLINES</div>
                <h3 className="font-headline text-2xl text-[#EBEBEB] font-medium mb-3">
                  Rigorous Assignment Workflow
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                  Publish assignments with timezone-aware deadlines. Students submit code or report URLs with receipt verification and pre-deadline revision support.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs font-mono text-zinc-500 flex justify-between">
                <span>SERVER DEADLINE CHECK</span>
                <span className="text-emerald-400">RECEIPT GENERATION</span>
              </div>
            </SpotlightCard>

            {/* Bento Card 5: Quizzes */}
            <SpotlightCard className="p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-6 h-6 rotate-on-hover" />
                </div>
                <div className="tech-label text-emerald-400 mb-2">SINGLE ATTEMPT INTEGRITY</div>
                <h3 className="font-headline text-2xl text-[#EBEBEB] font-medium mb-3">
                  Secure Multiple-Choice Quizzes
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                  Evaluated strictly in Express backend without leaking answer keys. Confirmation modal guards the single allowed student attempt with instant percentage calculation.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs font-mono text-zinc-500 flex justify-between">
                <span>ZERO ANSWER LEAKAGE</span>
                <span className="text-emerald-400">1-ATTEMPT ENFORCED</span>
              </div>
            </SpotlightCard>

            {/* Bento Card 6: Gradebook & Feedback */}
            <SpotlightCard className="p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 rotate-on-hover" />
                </div>
                <div className="tech-label text-emerald-400 mb-2">TRANSPARENT GRADEBOOK</div>
                <h3 className="font-headline text-2xl text-[#EBEBEB] font-medium mb-3">
                  Private Feedback & Gradebook
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                  Instructors award marks and write actionable critique. Students privately access returned evaluations without ever exposing classmates' work or class rosters.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs font-mono text-zinc-500 flex justify-between">
                <span>ROLE-BASED ISOLATION</span>
                <span className="text-emerald-400">REAL-TIME AVERAGES</span>
              </div>
            </SpotlightCard>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: DATA TABLE ("Explore the curriculum")
         ========================================================================= */}
      <section id="how-it-works" className="relative py-28 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-3">
                REAL-TIME DATABASE TELEMETRY
              </div>
              <h2 className="font-headline text-3xl sm:text-5xl text-[#EBEBEB] font-normal tracking-tight">
                Explore the curriculum.
              </h2>
            </div>
            <Link
              to="/catalog"
              className="mt-4 md:mt-0 text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 link-hover-emerald"
            >
              <span>View full catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">COURSE TITLE</th>
                    <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">INSTRUCTOR</th>
                    <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">LEVEL</th>
                    <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">MODULES</th>
                    <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">LESSONS</th>
                    <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">AVAILABILITY</th>
                    <th className="py-4 px-6 tech-label text-zinc-400 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-zinc-500 font-mono text-sm">
                        Querying MongoDB course records...
                      </td>
                    </tr>
                  ) : courses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-zinc-500 font-mono text-sm">
                        No published courses found. Run <span className="text-emerald-400 font-mono">npm run seed</span> to populate initial courses.
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course._id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Title */}
                        <td className="py-5 px-6">
                          <Link
                            to={`/courses/${course._id}`}
                            className="font-headline text-lg text-[#EBEBEB] group-hover:text-emerald-400 transition-colors font-medium flex items-center gap-2"
                          >
                            <span>{course.title}</span>
                          </Link>
                          <div className="text-xs text-zinc-500 font-sans mt-0.5 max-w-sm truncate">
                            {course.shortDescription}
                          </div>
                        </td>

                        {/* Instructor */}
                        <td className="py-5 px-6 text-sm text-zinc-300 font-medium">
                          {course.instructor?.name || 'Instructor'}
                        </td>

                        {/* Level */}
                        <td className="py-5 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.04] border border-white/10 text-zinc-300">
                            {course.level}
                          </span>
                        </td>

                        {/* Module Count */}
                        <td className="py-5 px-6 font-mono text-sm text-zinc-300">
                          <span className="text-emerald-400 font-semibold">{course.moduleCount || 0}</span> modules
                        </td>

                        {/* Lesson Count */}
                        <td className="py-5 px-6 font-mono text-sm text-zinc-300">
                          <span className="text-emerald-400 font-semibold">{course.lessonCount || 0}</span> lessons
                        </td>

                        {/* Availability */}
                        <td className="py-5 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Open ({course.studentCount || 0} enrolled)
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-5 px-6 text-right">
                          <Link
                            to={`/courses/${course._id}`}
                            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-emerald-500 hover:text-black border border-white/10 hover:border-emerald-500 text-xs font-medium text-zinc-200 transition-all duration-200"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION E: CLOSING CTA
         ========================================================================= */}
      <section className="relative py-32 border-t border-white/[0.06] overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto px-6 z-10">
          <div className="inline-block px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-6">
            COMMENCE LEARNING
          </div>

          {/* Animated gradient headline */}
          <h2 className="font-headline text-5xl sm:text-7xl font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-400 mb-8 max-w-3xl mx-auto leading-tight">
            Elevate your engineering intellect today.
          </h2>

          <p className="text-zinc-400 font-sans text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Register for live masterclasses, submit hands-on coursework, and receive direct evaluation from senior architects.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="px-9 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold tracking-wide transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] flex items-center gap-2"
            >
              <span>Explore full course catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup"
              className="px-9 py-4 rounded-full bg-white/[0.05] hover:bg-white/10 text-white border border-white/10 text-sm font-semibold tracking-wide transition-all duration-300"
            >
              Create student account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
