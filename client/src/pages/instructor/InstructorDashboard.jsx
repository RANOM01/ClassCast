import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SpotlightCard } from '../../components/SpotlightCard';
import { CourseCoverImage } from '../../components/CoverPresets';
import { CreateCourseModal } from './CreateCourseModal';
import {
  Plus,
  BookOpen,
  Users,
  FileCheck,
  Award,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        fetch('/api/courses/instructor-stats', { credentials: 'include' }),
        fetch('/api/courses/instructor/owned', { credentials: 'include' }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }
    } catch (err) {
      console.error('Failed to load instructor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCourseCreated = (newCourse) => {
    fetchDashboardData();
    navigate(`/instructor/course/${newCourse._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-zinc-500 font-mono text-sm">Loading instructor telemetry from MongoDB...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-28">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header with Prominent "Create course" action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-3">
              INSTRUCTOR OPERATIONS // LIVE METRICS
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl text-[#EBEBEB] font-normal tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="text-zinc-400 font-sans text-sm sm:text-base mt-2">
              Managing curricula, grading pending student submissions, and inspecting live course rosters.
            </p>
          </div>

          <div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold tracking-wide flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create course</span>
            </button>
          </div>
        </div>

        {/* Real Counts from MongoDB */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tech-label text-zinc-400">MANAGED COURSES</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-headline text-white font-bold mb-1">
              {stats?.totalCourses || 0}
            </div>
            <div className="text-xs text-zinc-500 font-mono">Owned courses & drafts</div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tech-label text-zinc-400">ACTIVE REGISTRATIONS</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-headline text-emerald-400 font-bold mb-1">
              {stats?.totalEnrollments || 0}
            </div>
            <div className="text-xs text-zinc-500 font-mono">Total enrolled students</div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tech-label text-zinc-400">WAITING FOR GRADING</span>
              <FileCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-4xl font-headline font-bold mb-1 ${
              (stats?.pendingGradingCount || 0) > 0 ? 'text-amber-400' : 'text-zinc-400'
            }`}>
              {stats?.pendingGradingCount || 0}
            </div>
            <div className="text-xs text-zinc-500 font-mono">Ungraded submissions</div>
          </div>
        </div>

        {/* Owned Courses Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl text-[#EBEBEB] font-medium">
              Owned Courses ({courses.length})
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              Click a course to open its workspace
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel border border-white/[0.08] text-center max-w-lg mx-auto">
              <BookOpen className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
              <h3 className="font-headline text-xl text-white mb-2">No Courses Created Yet</h3>
              <p className="text-zinc-400 text-xs mb-6">
                Start by creating your first course draft, add modules, and publish it to the catalog.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
              >
                Create First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <SpotlightCard
                  key={course._id}
                  onClick={() => navigate(`/instructor/course/${course._id}`)}
                  className="flex flex-col justify-between overflow-hidden cursor-pointer hover:border-emerald-500/40"
                >
                  <div>
                    <div className="relative rounded-t-3xl overflow-hidden border-b border-white/[0.06]">
                      <CourseCoverImage presetId={course.coverPreset} title={course.title} className="w-full h-40" />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] tech-label border ${
                          course.status === 'published'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : course.status === 'draft'
                            ? 'bg-zinc-800/80 border-white/10 text-zinc-400'
                            : course.status === 'closed'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-900 border-white/5 text-zinc-500'
                        }`}>
                          {course.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-black/80 text-zinc-300 border border-white/10">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-headline text-lg text-white font-medium line-clamp-1 mb-2 hover:text-emerald-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-zinc-400 text-xs line-clamp-2 mb-4 font-sans">
                        {course.shortDescription}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.06] text-center font-mono">
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <div className="text-[10px] text-zinc-500">LESSONS</div>
                          <div className="text-xs font-semibold text-white">{course.lessonCount || 0}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <div className="text-[10px] text-zinc-500">STUDENTS</div>
                          <div className="text-xs font-semibold text-emerald-400">{course.studentCount || 0}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <div className="text-[10px] text-zinc-500">TO GRADE</div>
                          <div className={`text-xs font-semibold ${course.pendingGrading > 0 ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                            {course.pendingGrading || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-5 pt-2 flex items-center justify-between border-t border-white/[0.04]">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column: Recent Registrations & Pending Grading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Registrations across owned courses */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-headline text-xl text-white font-medium">Recent Registrations</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">Live MongoDB records</span>
            </div>

            {stats?.recentRegistrations?.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                No students registered across your courses yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recentRegistrations?.map((reg) => (
                  <div
                    key={reg._id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {reg.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">{reg.student?.name}</div>
                        <div className="text-[10px] font-mono text-zinc-400">{reg.student?.email}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-emerald-400 font-mono truncate max-w-[150px]">
                        {reg.course?.title}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {new Date(reg.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignments Waiting for Grading */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-headline text-xl text-white font-medium">Assignments to Grade</h3>
              </div>
              <span className="text-xs font-mono text-amber-400">
                {stats?.pendingGradingCount || 0} waiting
              </span>
            </div>

            {stats?.pendingSubmissions?.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                All student submissions have been evaluated. No pending items!
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.pendingSubmissions?.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-medium text-white">{sub.assignment?.title}</div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        Student: <span className="text-emerald-400">{sub.student?.name}</span> • Max: {sub.assignment?.maxMarks} pts
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </div>
                    </div>

                    <Link
                      to={`/instructor/course/${sub.course?._id}`}
                      className="px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
                    >
                      Grade in Course
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Course Creation Modal */}
      <CreateCourseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCourseCreated}
      />
    </div>
  );
}
