import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Menu,
  X,
  PlayCircle,
  ExternalLink,
  BookOpen,
  Award,
  FileCheck,
  AlertCircle,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export function LessonPlayer() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Course sub-tab for student: 'lesson' | 'assignments' | 'quizzes'
  const [viewMode, setViewMode] = useState('lesson');
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [courseQuizzes, setCourseQuizzes] = useState([]);

  // Assignment submission modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [subText, setSubText] = useState('');
  const [subUrl, setSubUrl] = useState('');
  const [subError, setSubError] = useState('');
  const [subReceipt, setSubReceipt] = useState(null);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch(`/api/enrollments/course/${courseId}`, { credentials: 'include' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to load course player');
      }

      const data = await res.json();
      setCourse(data.course);
      setEnrollment(data.enrollment);

      // Determine which lesson to show:
      // Priority: lastViewedLessonId if set in MongoDB, or first lesson of first module
      let targetLesson = null;
      const allLessons = [];
      data.course.modules?.forEach((m) => {
        m.lessons?.forEach((l) => allLessons.push(l));
      });

      if (data.enrollment.lastViewedLessonId) {
        targetLesson = allLessons.find((l) => l._id.toString() === data.enrollment.lastViewedLessonId.toString());
      }
      if (!targetLesson && allLessons.length > 0) {
        targetLesson = allLessons[0];
      }

      setActiveLesson(targetLesson);

      // Record lesson view in MongoDB
      if (targetLesson) {
        fetch(`/api/enrollments/course/${courseId}/lesson-viewed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ lessonId: targetLesson._id }),
        }).catch((e) => console.error('Failed to log lesson view:', e));
      }

      // Also load assignments and quizzes for this course
      fetch(`/api/assignments/course/${courseId}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setCourseAssignments(d.assignments || []))
        .catch((e) => console.error(e));

      fetch(`/api/quizzes/course/${courseId}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setCourseQuizzes(d.quizzes || []))
        .catch((e) => console.error(e));

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayerData();
  }, [courseId]);

  // Flattened lessons list to facilitate Next / Previous navigation
  const allLessons = [];
  if (course && course.modules) {
    course.modules.forEach((mod) => {
      mod.lessons?.forEach((les) => {
        allLessons.push({
          ...les,
          moduleTitle: mod.title,
        });
      });
    });
  }

  const currentLessonIndex = allLessons.findIndex(
    (l) => activeLesson && l._id.toString() === activeLesson._id.toString()
  );

  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    setViewMode('lesson');
    setMobileDrawerOpen(false);

    // Save last-viewed lesson to MongoDB
    fetch(`/api/enrollments/course/${courseId}/lesson-viewed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ lessonId: lesson._id }),
    }).then((r) => r.json()).then((d) => {
      if (d.enrollment) setEnrollment(d.enrollment);
    }).catch(console.error);
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setMarkingComplete(true);

    try {
      const res = await fetch(`/api/enrollments/course/${courseId}/lesson-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId: activeLesson._id }),
      });

      const data = await res.json();
      if (res.ok) {
        setEnrollment(data.enrollment);
        // Automatically advance to next lesson if available
        if (nextLesson) {
          handleSelectLesson(nextLesson);
        }
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleOpenSubmitAssignment = (asgn) => {
    setSelectedAssignment(asgn);
    setSubText(asgn.mySubmission?.textResponse || '');
    setSubUrl(asgn.mySubmission?.projectUrl || '');
    setSubError('');
    setSubReceipt(null);
  };

  const handleAssignmentSubmit = async (isDraft = false) => {
    if (!selectedAssignment) return;
    setSubmittingAssignment(true);
    setSubError('');

    try {
      const res = await fetch(`/api/assignments/${selectedAssignment._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          textResponse: subText,
          projectUrl: subUrl,
          isDraft,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubReceipt(data.submissionReceipt);

      // Refresh assignments
      const asgnRes = await fetch(`/api/assignments/course/${courseId}`, { credentials: 'include' });
      const asgnData = await asgnRes.json();
      setCourseAssignments(asgnData.assignments || []);
    } catch (err) {
      setSubError(err.message);
    } finally {
      setSubmittingAssignment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-zinc-500 font-mono text-sm">Resuming lesson state from MongoDB...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-xl mx-auto text-center">
        <div className="p-8 rounded-3xl glass-panel border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-headline text-2xl text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-sm mb-6">{errorMsg}</p>
          <Link
            to={`/courses/${courseId}`}
            className="px-6 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
          >
            Go to Course Registration
          </Link>
        </div>
      </div>
    );
  }

  const completedSet = new Set(enrollment?.completedLessonIds?.map((id) => id.toString()) || []);
  const isCurrentCompleted = activeLesson && completedSet.has(activeLesson._id.toString());

  const totalLessons = allLessons.length;
  const completedCount = completedSet.size;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen pt-20 flex flex-col bg-[#050505]">
      
      {/* Top Learning Bar */}
      <div className="border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-md sticky top-16 z-30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/student/dashboard"
              className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              title="Back to Student Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="text-[10px] tech-label text-emerald-400">
                CLASSCAST LESSON PLAYER // {course?.category}
              </div>
              <h1 className="font-headline text-lg sm:text-xl text-white font-medium truncate max-w-xs sm:max-w-md">
                {course?.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Progress Telemetry */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-mono text-zinc-300">
                <strong className="text-emerald-400">{completedCount}</strong> of <strong>{totalLessons}</strong> lessons ({progressPercentage}%)
              </span>
              <div className="w-36 h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-zinc-300 flex items-center gap-1.5"
            >
              <Menu className="w-4 h-4" />
              <span>Curriculum</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Player Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar: Curriculum, Assignments & Quizzes Drawer */}
        <aside className="hidden lg:block lg:col-span-4 rounded-3xl glass-panel border border-white/[0.08] overflow-hidden sticky top-36 max-h-[calc(100vh-160px)] flex flex-col">
          {/* Tabs: Lessons, Assignments, Quizzes */}
          <div className="p-3 border-b border-white/[0.08] grid grid-cols-3 gap-1 bg-white/[0.02]">
            <button
              onClick={() => setViewMode('lesson')}
              className={`py-2 text-xs font-medium rounded-xl transition-all ${
                viewMode === 'lesson'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lessons ({totalLessons})
            </button>
            <button
              onClick={() => setViewMode('assignments')}
              className={`py-2 text-xs font-medium rounded-xl transition-all ${
                viewMode === 'assignments'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tasks ({courseAssignments.length})
            </button>
            <button
              onClick={() => setViewMode('quizzes')}
              className={`py-2 text-xs font-medium rounded-xl transition-all ${
                viewMode === 'quizzes'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Quizzes ({courseQuizzes.length})
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="overflow-y-auto p-4 space-y-6 flex-1">
            {viewMode === 'lesson' && (
              <div className="space-y-6">
                {course?.modules?.map((mod, modIdx) => (
                  <div key={mod._id} className="space-y-2">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-2">
                      MODULE {modIdx + 1}: {mod.title}
                    </div>

                    <div className="space-y-1">
                      {mod.lessons?.map((lesson, lesIdx) => {
                        const isActive = activeLesson && activeLesson._id.toString() === lesson._id.toString();
                        const isDone = completedSet.has(lesson._id.toString());

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`w-full p-3 rounded-2xl text-left text-xs transition-all flex items-center justify-between ${
                              isActive
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                : 'hover:bg-white/[0.03] text-zinc-300 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate mr-2">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                              {modIdx + 1}.{lesIdx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'assignments' && (
              <div className="space-y-3">
                {courseAssignments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No assignments published for this course yet.
                  </div>
                ) : (
                  courseAssignments.map((asgn) => (
                    <div
                      key={asgn._id}
                      onClick={() => handleOpenSubmitAssignment(asgn)}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 cursor-pointer transition-all"
                    >
                      <div className="text-xs font-medium text-white mb-1">{asgn.title}</div>
                      <div className="text-[11px] font-mono text-zinc-400 mb-2">
                        Max Marks: {asgn.maxMarks} • Due: {new Date(asgn.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        {asgn.mySubmission ? (
                          <span className="text-emerald-400">
                            Status: {asgn.mySubmission.status.toUpperCase()}
                            {asgn.mySubmission.marksAwarded !== null && ` (${asgn.mySubmission.marksAwarded}/${asgn.maxMarks})`}
                          </span>
                        ) : (
                          <span className="text-amber-400">NOT SUBMITTED</span>
                        )}
                        <span className="text-zinc-400 underline">Open</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {viewMode === 'quizzes' && (
              <div className="space-y-3">
                {courseQuizzes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No quizzes published for this course yet.
                  </div>
                ) : (
                  courseQuizzes.map((qz) => (
                    <div
                      key={qz._id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                      <div className="text-xs font-medium text-white mb-1">{qz.title}</div>
                      <div className="text-[11px] font-mono text-zinc-400 mb-3">
                        {qz.questionCount} Questions • {qz.totalPoints} Points
                      </div>
                      {qz.hasAttempted ? (
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300">
                          Completed: {qz.myAttempt?.marksEarned}/{qz.myAttempt?.maxMarks} ({qz.myAttempt?.percentage}%)
                        </div>
                      ) : (
                        <Link
                          to={`/quiz/${qz._id}`}
                          className="block text-center py-2 rounded-xl bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors"
                        >
                          Take Quiz (1 Attempt)
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Lesson Content Area */}
        <main className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Main Lesson Card */}
          <div className="p-6 sm:p-10 rounded-3xl glass-panel border border-white/[0.08] shadow-2xl">
            {activeLesson ? (
              <div>
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[10px] tech-label text-emerald-400">
                      CURRENT LESSON
                    </span>
                    <h2 className="font-headline text-3xl sm:text-4xl text-white font-normal mt-1">
                      {activeLesson.title}
                    </h2>
                  </div>

                  <button
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                    className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                      isCurrentCompleted
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCurrentCompleted ? 'Completed' : 'Mark complete'}</span>
                  </button>
                </div>

                {/* Video Player Embed (if provided) */}
                {activeLesson.videoUrl && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
                    {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={
                          activeLesson.videoUrl.includes('watch?v=')
                            ? activeLesson.videoUrl.replace('watch?v=', 'embed/')
                            : activeLesson.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                        }
                        title={activeLesson.title}
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="p-8 text-center">
                        <PlayCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <div className="text-sm font-mono text-zinc-300 mb-2">Video Stream Resource</div>
                        <a
                          href={activeLesson.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-xs text-emerald-400 hover:underline"
                        >
                          <span>Open External Video</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Lesson Reading Text */}
                <div className="prose prose-invert max-w-none text-zinc-300 font-sans text-base leading-relaxed whitespace-pre-line space-y-4 mb-10">
                  {activeLesson.text}
                </div>

                {/* Resource Links */}
                {activeLesson.resourceLinks && activeLesson.resourceLinks.length > 0 && (
                  <div className="pt-8 border-t border-white/[0.08] mb-8">
                    <h4 className="tech-label text-emerald-400 mb-3">CURRICULUM REFERENCES & PAPERS</h4>
                    <div className="space-y-2">
                      {activeLesson.resourceLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 flex items-center justify-between text-xs transition-all group"
                        >
                          <span className="text-zinc-200 group-hover:text-emerald-400 transition-colors font-medium">
                            {link.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous & Next Navigation Controls */}
                <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between">
                  {prevLesson ? (
                    <button
                      onClick={() => handleSelectLesson(prevLesson)}
                      className="px-5 py-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 flex items-center gap-2 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous: {prevLesson.title}</span>
                      <span className="sm:hidden">Previous</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {nextLesson ? (
                    <button
                      onClick={() => handleSelectLesson(nextLesson)}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <span className="hidden sm:inline">Next: {nextLesson.title}</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-xs font-mono text-emerald-400">
                      Final lesson reached!
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-16 text-center text-zinc-500 font-mono text-sm">
                No active lesson selected. Please choose a lesson from the curriculum outline.
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Mobile Curriculum Drawer Modal */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
          <div className="w-4/5 max-w-sm h-full bg-[#0a0a0a] border-l border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <span className="tech-label text-emerald-400">CURRICULUM DRAWER</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[75vh]">
                {course?.modules?.map((mod, modIdx) => (
                  <div key={mod._id} className="space-y-2">
                    <div className="text-[10px] font-mono text-zinc-500">
                      MODULE {modIdx + 1}: {mod.title}
                    </div>
                    {mod.lessons?.map((les) => (
                      <button
                        key={les._id}
                        onClick={() => handleSelectLesson(les)}
                        className="w-full p-2.5 rounded-xl text-left text-xs bg-white/[0.02] border border-white/[0.04] text-zinc-200"
                      >
                        {les.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full py-2.5 rounded-full bg-white/[0.05] text-xs text-zinc-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div>
                <span className="text-[10px] tech-label text-emerald-400">ASSIGNMENT SUBMISSION</span>
                <h3 className="font-headline text-2xl text-white font-medium">{selectedAssignment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {subReceipt ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-headline text-xl text-white mb-2">Submission Receipt Generated</h4>
                <p className="text-xs text-zinc-300 font-mono mb-4">
                  Receipt ID: {subReceipt.receiptId}
                </p>
                <div className="text-xs text-zinc-400 font-mono mb-6">
                  Saved at: {new Date(subReceipt.submittedAt).toLocaleString()}
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="px-6 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs text-zinc-300 leading-relaxed font-sans">
                  <div className="text-[10px] font-mono text-zinc-500 mb-1">INSTRUCTIONS:</div>
                  {selectedAssignment.instructions}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Deadline: {new Date(selectedAssignment.deadline).toLocaleString()}</span>
                  <span>Max Marks: {selectedAssignment.maxMarks}</span>
                </div>

                {subError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                    {subError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">
                    TEXT RESPONSE / SOURCE CODE
                  </label>
                  <textarea
                    rows={5}
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="Provide your solution text, algorithm description, or analysis..."
                    className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 font-mono"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">
                    PROJECT OR DOCUMENT URL (OPTIONAL)
                  </label>
                  <input
                    type="url"
                    value={subUrl}
                    onChange={(e) => setSubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => handleAssignmentSubmit(true)}
                    disabled={submittingAssignment}
                    className="px-5 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-300"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAssignmentSubmit(false)}
                    disabled={submittingAssignment}
                    className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-lg shadow-emerald-500/20"
                  >
                    Submit Final
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
