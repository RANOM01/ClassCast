import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CourseCoverImage } from '../../components/CoverPresets';
import { SpotlightCard } from '../../components/SpotlightCard';
import {
  BookOpen,
  PlayCircle,
  Clock,
  CheckCircle2,
  Bell,
  Award,
  ArrowRight,
  Calendar,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    myLearning: [],
    continueLearning: null,
    upcomingAssignments: [],
    announcements: [],
    recentGrades: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch('/api/enrollments/my-learning', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load learning data');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-zinc-500 font-mono text-sm">Syncing your learning telemetry...</div>
      </div>
    );
  }

  const { myLearning, continueLearning, upcomingAssignments, announcements, recentGrades } = data;

  return (
    <div className="min-h-screen pt-28 pb-28">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-3">
              STUDENT PORTAL // ACADEMIC PROFILE
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl text-[#EBEBEB] font-normal tracking-tight">
              Welcome back, {user?.name}.
            </h1>
            <p className="text-zinc-400 font-sans text-sm sm:text-base mt-2">
              Track your coursework progress, upcoming deadlines, and returned instructor evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/grades"
              className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Personal Gradebook</span>
            </Link>
            <Link
              to="/catalog"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            CONTINUE LEARNING (Prominent Feature Card)
           ========================================================================= */}
        {continueLearning && (
          <div className="mb-14">
            <div className="tech-label text-emerald-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CONTINUE LEARNING
            </div>
            
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.08)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 rounded-2xl overflow-hidden border border-white/10">
                <CourseCoverImage
                  presetId={continueLearning.course.coverPreset}
                  title={continueLearning.course.title}
                  className="w-full h-44"
                />
              </div>

              <div className="lg:col-span-8 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-emerald-400">
                      {continueLearning.course.category}
                    </span>
                    <span>•</span>
                    <span>Instructor: {continueLearning.course.instructor?.name}</span>
                  </div>

                  <h2 className="font-headline text-2xl sm:text-3xl text-white font-medium mb-3">
                    {continueLearning.course.title}
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm font-sans line-clamp-2 mb-6">
                    {continueLearning.course.shortDescription}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="text-zinc-400">Course Progress</span>
                      <span className="text-emerald-400 font-semibold">
                        {continueLearning.completedLessonsCount} of {continueLearning.totalLessonsCount} lessons ({continueLearning.progressPercentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-500"
                        style={{ width: `${continueLearning.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <div className="text-xs text-zinc-500 font-mono">
                      {continueLearning.lastActivityAt ? (
                        <span>Last active: {new Date(continueLearning.lastActivityAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-amber-400/80">Newly enrolled · Ready to begin</span>
                      )}
                    </div>

                    <Link
                      to={`/learn/${continueLearning.course._id}`}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Resume Course Player</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MY LEARNING (All Enrolled Courses)
           ========================================================================= */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl text-[#EBEBEB] font-medium">
              My Learning ({myLearning.length})
            </h2>
            <Link to="/catalog" className="text-xs font-semibold text-emerald-400 hover:underline">
              Browse more courses &rarr;
            </Link>
          </div>

          {myLearning.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel border border-white/[0.08] text-center max-w-lg mx-auto">
              <BookOpen className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
              <h3 className="font-headline text-xl text-white mb-2">No active course enrollments</h3>
              <p className="text-zinc-400 text-xs mb-6">
                Explore our catalog to find published masterclasses and register immediately.
              </p>
              <Link
                to="/catalog"
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLearning.map((item) => (
                <SpotlightCard key={item.enrollmentId} className="flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="relative rounded-t-3xl overflow-hidden border-b border-white/[0.06]">
                      <CourseCoverImage
                        presetId={item.course.coverPreset}
                        title={item.course.title}
                        className="w-full h-40"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] tech-label bg-black/80 text-emerald-400 border border-white/10">
                          {item.course.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <Link to={`/learn/${item.course._id}`}>
                        <h3 className="font-headline text-lg text-white font-medium line-clamp-1 mb-2 hover:text-emerald-400 transition-colors">
                          {item.course.title}
                        </h3>
                      </Link>
                      <p className="text-zinc-400 text-xs line-clamp-2 mb-4 font-sans">
                        {item.course.shortDescription}
                      </p>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-zinc-400">Completed</span>
                          <span className="text-emerald-400 font-semibold">
                            {item.completedLessonsCount} / {item.totalLessonsCount} ({item.progressPercentage}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${item.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-white/[0.04]">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {item.lastActivityAt ? 'In Progress' : 'Not started'}
                    </span>
                    <Link
                      to={`/learn/${item.course._id}`}
                      className="px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-emerald-500 hover:text-black border border-white/10 text-xs font-semibold text-zinc-200 transition-all"
                    >
                      Open Course
                    </Link>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Section: Deadlines, Announcements, and Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upcoming Deadlines */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-headline text-xl text-white font-medium">Upcoming Assignments</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">{upcomingAssignments.length} pending</span>
            </div>

            {upcomingAssignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                No active assignment deadlines across your enrolled courses.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map((asgn) => (
                  <div
                    key={asgn._id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/15 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono text-emerald-400 mb-0.5">{asgn.course?.title}</div>
                      <div className="text-sm font-medium text-white">{asgn.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2 font-mono">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>Deadline: {new Date(asgn.deadline).toLocaleString()}</span>
                        <span>•</span>
                        <span>{asgn.maxMarks} max marks</span>
                      </div>
                    </div>

                    <div>
                      {asgn.isSubmitted ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                          Submitted
                        </span>
                      ) : (
                        <Link
                          to={`/learn/${asgn.course?._id}`}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors"
                        >
                          Submit
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course Announcements & Recent Grades */}
          <div className="space-y-8">
            
            {/* Announcements */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-headline text-xl text-white font-medium">Course Announcements</h3>
                </div>
                <span className="text-xs font-mono text-zinc-500">Newest first</span>
              </div>

              {announcements.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No announcements published yet.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {announcements.map((ann) => (
                    <div key={ann._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                        <span className="text-emerald-400">{ann.course?.title}</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm font-medium text-white mb-1.5">{ann.title}</div>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-3">
                        {ann.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Returned Grades */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-headline text-xl text-white font-medium">Recent Returned Grades</h3>
                </div>
                <Link to="/student/grades" className="text-xs font-semibold text-emerald-400 hover:underline">
                  All Grades &rarr;
                </Link>
              </div>

              {recentGrades.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No evaluated assignments returned yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentGrades.map((sub) => (
                    <div key={sub._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-zinc-400">{sub.course?.title}</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {sub.marksAwarded} / {sub.assignment?.maxMarks} Marks
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white mb-1">{sub.assignment?.title}</div>
                      {sub.feedback && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 text-xs text-emerald-300 font-sans mt-2">
                          <span className="font-semibold text-emerald-400">Instructor Feedback: </span>
                          {sub.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
