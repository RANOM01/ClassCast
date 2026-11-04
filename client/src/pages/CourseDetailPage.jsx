import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CourseCoverImage } from '../components/CoverPresets';
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  BookOpen,
  ArrowRight,
  Clock,
  Globe,
  Award,
  AlertCircle,
  Sparkles,
  Users,
} from 'lucide-react';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCourse = () => {
    setLoading(true);
    fetch(`/api/courses/${courseId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Course not found or inaccessible');
        return res.json();
      })
      .then((data) => {
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled);
        setIsOwner(data.isOwner);
      })
      .catch((err) => {
        setErrorMsg(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleRegister = async () => {
    if (!user) {
      // Redirect to login and return to this course after
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (user.role === 'Instructor') {
      setErrorMsg('Instructors cannot register as students. Please sign in with a Student account.');
      return;
    }

    setRegistering(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/enrollments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register for course');
      }

      setIsEnrolled(true);
      setRegisterSuccess(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-zinc-500 font-mono text-sm">Loading course specification...</div>
      </div>
    );
  }

  if (errorMsg && !course) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-xl mx-auto text-center">
        <div className="p-8 rounded-3xl glass-panel border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-headline text-2xl text-white mb-2">Unable to Load Course</h2>
          <p className="text-zinc-400 text-sm mb-6">{errorMsg}</p>
          <Link
            to="/catalog"
            className="px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-white hover:bg-white/10"
          >
            Back to Course Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isRegistrationClosed = course.status === 'closed';

  return (
    <div className="min-h-screen pt-28 pb-28">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb & Technical Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Link to="/catalog" className="text-zinc-500 hover:text-emerald-400 link-hover-emerald">
              CATALOG
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-emerald-400 uppercase">{course.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="tech-label text-zinc-400">
              STATUS: {course.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Main Header Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Details & Objectives */}
          <div className="lg:col-span-7">
            <h1 className="font-headline text-4xl sm:text-6xl text-[#EBEBEB] font-normal tracking-tight leading-tight mb-6">
              {course.title}
            </h1>

            <p className="text-zinc-300 font-sans text-base sm:text-lg leading-relaxed mb-8">
              {course.shortDescription}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-4 pb-8 mb-8 border-b border-white/[0.08] text-xs font-mono">
              <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-zinc-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Level: {course.level}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Language: {course.language}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-zinc-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{course.studentCount || 0} Registered Students</span>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
                {course.instructor?.name?.charAt(0) || 'I'}
              </div>
              <div>
                <div className="text-xs tech-label text-emerald-400 mb-1">COURSE ARCHITECT</div>
                <div className="font-headline text-xl text-white font-medium">
                  {course.instructor?.name}
                </div>
                <div className="text-xs text-zinc-400 font-sans mt-0.5">
                  {course.instructor?.headline || 'ClassCast Instructor'}
                </div>
              </div>
            </div>

            {/* Full Course Description */}
            <div className="mb-12">
              <h2 className="font-headline text-2xl text-white font-normal mb-4">
                Curriculum Overview & Scope
              </h2>
              <div className="text-zinc-300 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
                {course.fullDescription}
              </div>
            </div>

            {/* Learning Objectives */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <div className="mb-12">
                <h2 className="font-headline text-2xl text-white font-normal mb-4">
                  What You Will Master
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.learningObjectives.map((obj, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-300 leading-relaxed font-sans">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="mb-12">
                <h2 className="font-headline text-2xl text-white font-normal mb-4">
                  Prerequisites
                </h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs text-zinc-400 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Right Column: Registration Card / Action Center */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="rounded-3xl glass-panel border border-white/[0.1] overflow-hidden shadow-2xl p-6 sm:p-8">
              
              {/* Artwork banner */}
              <div className="rounded-2xl overflow-hidden mb-6 border border-white/[0.08]">
                <CourseCoverImage presetId={course.coverPreset} title={course.title} className="w-full h-44" />
              </div>

              {/* Status Message Display */}
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Dynamic Registration State Actions */}
              {isOwner ? (
                <div className="text-center">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4">
                    You are the instructor for this course.
                  </div>
                  <Link
                    to={`/instructor/course/${course._id}`}
                    className="w-full block py-3.5 rounded-full bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25"
                  >
                    Open Instructor Workspace
                  </Link>
                </div>
              ) : isEnrolled || registerSuccess ? (
                <div className="text-center">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-5 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>You are registered for this course.</span>
                  </div>
                  <Link
                    to={`/learn/${course._id}`}
                    className="w-full block py-4 rounded-full bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                  >
                    <span>{registerSuccess ? 'Start learning' : 'Continue learning'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : isRegistrationClosed ? (
                <div className="text-center">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-4">
                    Registration is closed for new students. Existing enrolled students may continue learning.
                  </div>
                  <button
                    disabled
                    className="w-full py-3.5 rounded-full bg-white/[0.05] text-zinc-500 font-semibold text-sm cursor-not-allowed border border-white/5"
                  >
                    Registration Closed
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
                  >
                    {registering ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>Registering...</span>
                      </span>
                    ) : (
                      <>
                        <span>Register for course</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-zinc-500 text-center font-mono mt-3">
                    Immediate enrollment · Persistent MongoDB record
                  </p>
                </div>
              )}

              {/* Module & lesson breakdown summary */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Total Modules:</span>
                  <span className="font-mono text-zinc-200">{course.modules?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Curriculum Format:</span>
                  <span className="font-mono text-emerald-400">Interactive Lessons + Text</span>
                </div>
                <div className="flex justify-between">
                  <span>Assessments:</span>
                  <span className="font-mono text-zinc-200">Assignments & 1-Attempt Quizzes</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Curriculum Outline (Syllabus Preview) */}
        <div className="max-w-4xl pt-8 border-t border-white/[0.08]">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-3">
            SYLLABUS OUTLINE
          </div>
          <h2 className="font-headline text-3xl text-white font-normal mb-8">
            Curriculum Structure
          </h2>

          <div className="space-y-6">
            {course.modules?.map((mod, modIdx) => (
              <div
                key={mod._id}
                className="rounded-3xl glass-panel border border-white/[0.08] p-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[10px] font-mono text-zinc-400">
                      MODULE {modIdx + 1}
                    </span>
                    <h3 className="font-headline text-xl text-white font-medium">
                      {mod.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {mod.lessons?.length || 0} lessons
                  </span>
                </div>

                {/* Lesson Rows */}
                <div className="space-y-2">
                  {mod.lessons?.map((lesson, lesIdx) => (
                    <div
                      key={lesson._id}
                      className="p-3.5 rounded-2xl bg-white/[0.015] border border-white/[0.04] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono w-5">
                          {modIdx + 1}.{lesIdx + 1}
                        </span>
                        <span className="text-zinc-200 font-medium">{lesson.title}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isEnrolled || isOwner ? (
                          <Link
                            to={`/learn/${course._id}`}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold font-mono flex items-center gap-1"
                          >
                            <span>Open</span>
                            <PlayCircle className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-zinc-500 flex items-center gap-1 text-[11px] font-mono">
                            <Lock className="w-3 h-3" />
                            <span>Enroll to access</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
