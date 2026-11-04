import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Award, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function StudentGradesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gradebook/student/my-grades', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
      })
      .catch((err) => console.error('Failed to load student grades:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-zinc-500 font-mono text-sm">Loading your personal gradebook...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-28">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/[0.08]">
          <div>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 mb-2 link-hover-emerald"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Dashboard</span>
            </Link>
            <h1 className="font-headline text-3xl sm:text-5xl text-[#EBEBEB] font-normal tracking-tight">
              My Academic Grades
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
              Personal assignment submissions, quiz evaluations, and returned instructor critique.
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="py-16 text-center rounded-3xl glass-panel border border-white/[0.08] max-w-lg mx-auto p-8">
            <Award className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
            <h3 className="font-headline text-xl text-white mb-2">No Course Grades Yet</h3>
            <p className="text-zinc-400 text-xs mb-6">
              You are not enrolled in any courses with graded assessments yet.
            </p>
            <Link
              to="/catalog"
              className="px-6 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
            >
              Explore Course Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {courses.map((cData, cIdx) => (
              <div key={cIdx} className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden shadow-2xl p-6 sm:p-8">
                
                {/* Course Header & Average */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
                  <div>
                    <span className="text-[10px] tech-label text-emerald-400">{cData.course.category}</span>
                    <h2 className="font-headline text-2xl text-white font-medium mt-0.5">
                      {cData.course.title}
                    </h2>
                  </div>

                  <div className="px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/10 text-right">
                    <div className="text-[10px] tech-label text-zinc-400">WEIGHTED AVERAGE</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">
                      {cData.averageDisplay}
                    </div>
                  </div>
                </div>

                {/* Assignments Section */}
                <div className="mb-8">
                  <h3 className="tech-label text-zinc-400 mb-3">ASSIGNMENT SUBMISSIONS</h3>
                  {cData.assignments.length === 0 ? (
                    <div className="text-xs text-zinc-500 font-mono py-2">No assignments in this course.</div>
                  ) : (
                    <div className="space-y-3">
                      {cData.assignments.map((asgn) => (
                        <div
                          key={asgn._id}
                          className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="text-sm font-medium text-white">{asgn.title}</div>
                            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                              Deadline: {new Date(asgn.deadline).toLocaleDateString()} • Max Marks: {asgn.maxMarks}
                            </div>
                            {asgn.feedback && (
                              <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-sans">
                                <strong className="text-emerald-400">Instructor Feedback: </strong>
                                {asgn.feedback}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            {asgn.status === 'graded' ? (
                              <div>
                                <span className="text-base font-mono font-bold text-emerald-400">
                                  {asgn.marksAwarded} / {asgn.maxMarks}
                                </span>
                                <div className="text-[10px] font-mono text-emerald-500/80">GRADED</div>
                              </div>
                            ) : asgn.status === 'submitted' ? (
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-mono">
                                Submitted · Pending Review
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-mono">
                                Missing
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quizzes Section */}
                <div>
                  <h3 className="tech-label text-zinc-400 mb-3">QUIZ ATTEMPTS</h3>
                  {cData.quizzes.length === 0 ? (
                    <div className="text-xs text-zinc-500 font-mono py-2">No quizzes in this course.</div>
                  ) : (
                    <div className="space-y-3">
                      {cData.quizzes.map((qz) => (
                        <div
                          key={qz._id}
                          className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium text-white">{qz.title}</div>
                            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                              Max Points: {qz.maxMarks}
                            </div>
                          </div>

                          <div className="text-right">
                            {qz.hasAttempt ? (
                              <div>
                                <span className="text-base font-mono font-bold text-emerald-400">
                                  {qz.marksEarned} / {qz.maxMarks} ({qz.percentage}%)
                                </span>
                                <div className="text-[10px] font-mono text-emerald-500/80">COMPLETED</div>
                              </div>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-white/[0.04] text-zinc-400 text-xs font-mono">
                                Unattempted
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
