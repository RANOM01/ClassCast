import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { COVER_PRESETS, CourseCoverImage } from '../../components/CoverPresets';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Users,
  FileCheck,
  CheckCircle2,
  Award,
  Bell,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Search,
  ExternalLink,
  PlayCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Eye,
  Check,
} from 'lucide-react';

const CATEGORIES = ['Computer Science', 'Web Development', 'Design', 'Machine Learning', 'Cloud Architecture'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export function CourseWorkspace() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'curriculum' | 'students' | 'assignments' | 'quizzes' | 'gradebook' | 'announcements'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Overview Tab Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [coverPreset, setCoverPreset] = useState('');
  const [learningObjectives, setLearningObjectives] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [savingOverview, setSavingOverview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Curriculum Builder State
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [activeLessonModal, setActiveLessonModal] = useState(null); // { mode: 'create' | 'edit', moduleId, lesson }
  const [previewLessonModal, setPreviewLessonModal] = useState(null);

  // Students / Roster Tab State (CRITICAL)
  const [roster, setRoster] = useState([]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterLoading, setRosterLoading] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null); // student progress drawer

  // Assignments Tab State
  const [assignments, setAssignments] = useState([]);
  const [createAsgnModal, setCreateAsgnModal] = useState(false);
  const [viewSubmissionsModal, setViewSubmissionsModal] = useState(null); // assignment object
  const [gradingSubmission, setGradingSubmission] = useState(null); // submission object
  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Quizzes Tab State
  const [quizzes, setQuizzes] = useState([]);
  const [createQuizModal, setCreateQuizModal] = useState(false);
  const [viewAttemptsModal, setViewAttemptsModal] = useState(null); // quiz object

  // Gradebook Tab State
  const [gradebookData, setGradebookData] = useState(null);

  // Announcements Tab State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Load Course Base Data
  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch(`/api/courses/instructor/workspace/${courseId}`, { credentials: 'include' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to load course workspace');
      }

      const data = await res.json();
      const c = data.course;
      setCourse(c);
      setTitle(c.title);
      setShortDescription(c.shortDescription);
      setFullDescription(c.fullDescription || '');
      setCategory(c.category);
      setLevel(c.level);
      setLanguage(c.language || 'English');
      setCoverPreset(c.coverPreset || 'preset-cyber-grid');
      setLearningObjectives(c.learningObjectives || []);
      setPrerequisites(c.prerequisites || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [courseId]);

  // Load Roster (Students Tab)
  const fetchRoster = useCallback(async () => {
    setRosterLoading(true);
    try {
      const q = rosterSearch.trim() ? `?search=${encodeURIComponent(rosterSearch.trim())}` : '';
      const res = await fetch(`/api/enrollments/instructor/${courseId}/roster${q}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRoster(data.roster || []);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setRosterLoading(false);
    }
  }, [courseId, rosterSearch]);

  // Refetch roster whenever tab opens or window regains focus
  useEffect(() => {
    if (activeTab === 'students') {
      fetchRoster();
    }
  }, [activeTab, fetchRoster]);

  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'students') {
        fetchRoster();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab, fetchRoster]);

  // Load Assignments
  const fetchAssignments = async () => {
    try {
      const res = await fetch(`/api/assignments/course/${courseId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`/api/quizzes/course/${courseId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Gradebook
  const fetchGradebook = async () => {
    try {
      const res = await fetch(`/api/gradebook/instructor/${courseId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGradebookData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`/api/announcements/course/${courseId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger sub-tab data fetch
  useEffect(() => {
    if (activeTab === 'assignments') fetchAssignments();
    if (activeTab === 'quizzes') fetchQuizzes();
    if (activeTab === 'gradebook') fetchGradebook();
    if (activeTab === 'announcements') fetchAnnouncements();
  }, [activeTab]);

  // =========================================================================
  // TAB 1: OVERVIEW ACTIONS (Save, Status Lifecycle, Delete)
  // =========================================================================
  const handleSaveOverview = async (e) => {
    e?.preventDefault();
    setSavingOverview(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/courses/instructor/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          shortDescription,
          fullDescription,
          category,
          level,
          language,
          coverPreset,
          learningObjectives,
          prerequisites,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update course');

      setCourse(data.course);
      setSuccessMsg('Course details updated successfully.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingOverview(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/courses/instructor/${courseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update course status');

      setCourse(data.course);
      setSuccessMsg(`Course status updated to ${newStatus}.`);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteDraft = async () => {
    setErrorMsg('');
    try {
      const res = await fetch(`/api/courses/instructor/${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete course');

      navigate('/instructor/dashboard');
    } catch (err) {
      setErrorMsg(err.message);
      setShowDeleteConfirm(false);
    }
  };

  // =========================================================================
  // TAB 2: CURRICULUM ACTIONS (Modules & Lessons)
  // =========================================================================
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await fetch(`/api/curriculum/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newModuleTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourse({ ...course, modules: data.modules });
        setNewModuleTitle('');
      } else {
        setErrorMsg(data.error || 'Failed to add module');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRenameModule = async (moduleId) => {
    if (!editingModuleTitle.trim()) return;
    try {
      const res = await fetch(`/api/curriculum/${courseId}/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editingModuleTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourse({ ...course, modules: data.modules });
        setEditingModuleId(null);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      const res = await fetch(`/api/curriculum/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCourse({ ...course, modules: data.modules });
      } else {
        setErrorMsg(data.error || 'Failed to delete module');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleMoveModule = async (idx, direction) => {
    const modules = [...course.modules];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= modules.length) return;

    const temp = modules[idx];
    modules[idx] = modules[targetIdx];
    modules[targetIdx] = temp;

    const moduleIds = modules.map((m) => m._id);
    try {
      const res = await fetch(`/api/curriculum/${courseId}/modules/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ moduleIds }),
      });
      const data = await res.json();
      if (res.ok) setCourse({ ...course, modules: data.modules });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveLesson = async (mod, lesIdx, direction) => {
    const lessons = [...mod.lessons];
    const targetIdx = direction === 'up' ? lesIdx - 1 : lesIdx + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;

    const temp = lessons[lesIdx];
    lessons[lesIdx] = lessons[targetIdx];
    lessons[targetIdx] = temp;

    const lessonIds = lessons.map((l) => l._id);
    try {
      const res = await fetch(`/api/curriculum/${courseId}/modules/${mod._id}/lessons/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonIds }),
      });
      const data = await res.json();
      if (res.ok) setCourse({ ...course, modules: data.modules });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const res = await fetch(`/api/curriculum/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCourse({ ...course, modules: data.modules });
      } else {
        setErrorMsg(data.error || 'Failed to delete lesson');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // =========================================================================
  // TAB 3: STUDENT ROSTER ACTIONS (Click student to open progress drawer)
  // =========================================================================
  const handleOpenStudentDetail = async (studentId) => {
    try {
      const res = await fetch(`/api/enrollments/instructor/${courseId}/student/${studentId}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedStudentDetail(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================================
  // TAB 4: ASSIGNMENTS & SUBMISSIONS GRADING
  // =========================================================================
  const handleOpenSubmissions = async (asgn) => {
    try {
      const res = await fetch(`/api/assignments/${asgn._id}/submissions`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setViewSubmissionsModal(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGradeModal = (sub) => {
    setGradingSubmission(sub);
    setMarksInput(sub.marksAwarded !== null ? String(sub.marksAwarded) : '');
    setFeedbackInput(sub.feedback || '');
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      const res = await fetch(`/api/assignments/submissions/${gradingSubmission._id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          marksAwarded: Number(marksInput),
          feedback: feedbackInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record grade');

      // Refresh submissions in modal
      if (viewSubmissionsModal) {
        handleOpenSubmissions(viewSubmissionsModal.assignment);
      }
      setGradingSubmission(null);
      fetchAssignments();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // =========================================================================
  // TAB 5: QUIZZES ACTIONS
  // =========================================================================
  const handleOpenQuizAttempts = async (qz) => {
    try {
      const res = await fetch(`/api/quizzes/${qz._id}/attempts`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setViewAttemptsModal(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================================
  // TAB 7: ANNOUNCEMENTS ACTIONS
  // =========================================================================
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    try {
      const res = await fetch(`/api/announcements/course/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: annTitle.trim(),
          content: annContent.trim(),
          status: 'published',
        }),
      });

      if (res.ok) {
        setAnnTitle('');
        setAnnContent('');
        setAnnouncementModal(false);
        fetchAnnouncements();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await fetch(`/api/announcements/${annId}`, { method: 'DELETE', credentials: 'include' });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-zinc-500 font-mono text-sm">Opening course management workspace...</div>
      </div>
    );
  }

  if (errorMsg && !course) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-xl mx-auto text-center">
        <div className="p-8 rounded-3xl glass-panel border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-headline text-2xl text-white mb-2">Access Blocked</h2>
          <p className="text-zinc-400 text-sm mb-6">{errorMsg}</p>
          <Link
            to="/instructor/dashboard"
            className="px-6 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
          >
            Back to Instructor Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-28 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 text-xs font-mono text-zinc-400">
          <Link
            to="/instructor/dashboard"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 link-hover-emerald"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Instructor Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Lifecycle Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] tech-label border ${
              course.status === 'published'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : course.status === 'draft'
                ? 'bg-zinc-800 border-white/10 text-zinc-400'
                : course.status === 'closed'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-zinc-900 border-white/5 text-zinc-500'
            }`}>
              {course.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 tech-label text-[10px] mb-2">
              WORKSPACE // {course.category.toUpperCase()}
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl text-white font-normal">
              {course.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/courses/${course._id}`}
              target="_blank"
              className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Preview</span>
            </Link>
          </div>
        </div>

        {/* Notification alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* =========================================================================
            7 WORKSPACE TABS:
            Overview | Curriculum | Students | Assignments | Quizzes | Gradebook | Announcements
           ========================================================================= */}
        <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-8 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'curriculum', label: 'Curriculum', icon: Layers },
            { id: 'students', label: 'Students (Roster)', icon: Users },
            { id: 'assignments', label: 'Assignments', icon: FileCheck },
            { id: 'quizzes', label: 'Quizzes', icon: CheckCircle2 },
            { id: 'gradebook', label: 'Gradebook', icon: Award },
            { id: 'announcements', label: 'Announcements', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW & LIFECYCLE
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 cols: Form */}
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08]">
              <h2 className="font-headline text-2xl text-white font-medium mb-6">Course Metadata</h2>
              <form onSubmit={handleSaveOverview} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
                    TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
                    SHORT DESCRIPTION
                  </label>
                  <input
                    type="text"
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
                    FULL DESCRIPTION & SCOPE
                  </label>
                  <textarea
                    rows={4}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50 font-sans"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">CATEGORY</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">LEVEL</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl} className="bg-[#111]">{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">LANGUAGE</label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200"
                    />
                  </div>
                </div>

                {/* Preset Cover artwork picker */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
                    COVER ARTWORK PRESET
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {COVER_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setCoverPreset(preset.id)}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                          coverPreset === preset.id
                            ? 'border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <CourseCoverImage presetId={preset.id} className="w-full h-12" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingOverview}
                    className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-lg shadow-emerald-500/20"
                  >
                    {savingOverview ? 'Saving Changes...' : 'Save Course Details'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right 4 cols: Course Lifecycle Actions */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
                <h3 className="font-headline text-xl text-white font-medium mb-4">Course Lifecycle</h3>
                
                <div className="space-y-3">
                  {/* Publish */}
                  {course.status !== 'published' && (
                    <button
                      onClick={() => handleChangeStatus('published')}
                      className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publish Course</span>
                    </button>
                  )}

                  {/* Save as Draft */}
                  {course.status !== 'draft' && (
                    <button
                      onClick={() => handleChangeStatus('draft')}
                      className="w-full py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300"
                    >
                      Revert to Draft
                    </button>
                  )}

                  {/* Close Registration */}
                  {course.status === 'published' && (
                    <button
                      onClick={() => handleChangeStatus('closed')}
                      className="w-full py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                    >
                      Close Registration
                    </button>
                  )}

                  {/* Reopen Registration */}
                  {course.status === 'closed' && (
                    <button
                      onClick={() => handleChangeStatus('published')}
                      className="w-full py-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                    >
                      Reopen Registration
                    </button>
                  )}

                  {/* Archive */}
                  {course.status !== 'archived' && (
                    <button
                      onClick={() => handleChangeStatus('archived')}
                      className="w-full py-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Archive Course
                    </button>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed font-sans">
                  <strong>Publication Requirements:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 font-mono text-[10px] text-zinc-500">
                    <li>Course title & description</li>
                    <li>At least 1 module with a readable lesson</li>
                  </ul>
                </div>
              </div>

              {/* Danger Zone: Delete Empty Draft */}
              <div className="p-6 rounded-3xl glass-panel border border-red-500/20">
                <h4 className="tech-label text-red-400 mb-2">DANGER ZONE</h4>
                <p className="text-xs text-zinc-400 font-sans mb-4">
                  Deleting a course is only permitted if it is an empty draft with no active student learning records.
                </p>

                {showDeleteConfirm ? (
                  <div className="space-y-2">
                    <p className="text-xs text-red-300 font-mono">Confirm permanent deletion?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteDraft}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold text-xs"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-xl bg-white/[0.05] text-xs text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20"
                  >
                    Delete Empty Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: CURRICULUM BUILDER
           ========================================================================= */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/[0.08]">
              <div>
                <h2 className="font-headline text-2xl text-white font-medium">Curriculum Structure</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Organize modules, arrange lessons with move up/down controls, and embed technical resources.
                </p>
              </div>

              {/* Add Module Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New Module Title..."
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={handleAddModule}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
              </div>
            </div>

            {/* Modules List */}
            {course.modules?.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/[0.08]">
                <Layers className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <h3 className="font-headline text-xl text-white mb-1">No Modules Created</h3>
                <p className="text-zinc-400 text-xs">Add your first module using the control above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {course.modules?.map((mod, modIdx) => (
                  <div key={mod._id} className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden p-6">
                    {/* Module Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[10px] font-mono text-zinc-400">
                          MOD {modIdx + 1}
                        </span>

                        {editingModuleId === mod._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingModuleTitle}
                              onChange={(e) => setEditingModuleTitle(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-white/[0.05] border border-emerald-500/50 text-xs text-white"
                            />
                            <button
                              onClick={() => handleRenameModule(mod._id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingModuleId(null)}
                              className="px-2 py-1 text-xs text-zinc-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-headline text-xl text-white font-medium flex items-center gap-2">
                            <span>{mod.title}</span>
                            <button
                              onClick={() => {
                                setEditingModuleId(mod._id);
                                setEditingModuleTitle(mod.title);
                              }}
                              className="text-zinc-500 hover:text-white p-1"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </h3>
                        )}
                      </div>

                      {/* Controls: Reorder Module, Add Lesson, Delete Module */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveModule(modIdx, 'up')}
                          disabled={modIdx === 0}
                          title="Move module up"
                          className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveModule(modIdx, 'down')}
                          disabled={modIdx === course.modules.length - 1}
                          title="Move module down"
                          className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setActiveLessonModal({ mode: 'create', moduleId: mod._id, lesson: null })}
                          className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Lesson</span>
                        </button>

                        <button
                          onClick={() => handleDeleteModule(mod._id)}
                          title="Delete module"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    <div className="space-y-2">
                      {mod.lessons?.length === 0 ? (
                        <div className="text-xs text-zinc-500 font-mono py-3 text-center">
                          No lessons in this module. Click "Add Lesson" above.
                        </div>
                      ) : (
                        mod.lessons?.map((les, lesIdx) => (
                          <div
                            key={les._id}
                            className="p-3.5 rounded-2xl bg-white/[0.015] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-zinc-500 font-mono text-xs w-6">
                                {modIdx + 1}.{lesIdx + 1}
                              </span>
                              <div>
                                <span className="text-sm font-medium text-white">{les.title}</span>
                                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-3 mt-0.5">
                                  <span>{les.text?.length || 0} characters</span>
                                  {les.videoUrl && <span>• Video attached</span>}
                                  {les.resourceLinks?.length > 0 && <span>• {les.resourceLinks.length} resources</span>}
                                </div>
                              </div>
                            </div>

                            {/* Lesson Controls */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                onClick={() => handleMoveLesson(mod, lesIdx, 'up')}
                                disabled={lesIdx === 0}
                                title="Move lesson up"
                                className="p-1 text-zinc-500 hover:text-white disabled:opacity-20"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveLesson(mod, lesIdx, 'down')}
                                disabled={lesIdx === mod.lessons.length - 1}
                                title="Move lesson down"
                                className="p-1 text-zinc-500 hover:text-white disabled:opacity-20"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setPreviewLessonModal(les)}
                                title="Preview as student"
                                className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[11px] text-zinc-300 hover:text-white flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>

                              <button
                                onClick={() => setActiveLessonModal({ mode: 'edit', moduleId: mod._id, lesson: les })}
                                title="Edit lesson"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteLesson(mod._id, les._id)}
                                title="Delete lesson"
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: STUDENTS ROSTER (THE CORE FLOW FEATURE)
           ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 tech-label text-[10px] mb-2">
                  LIVE COURSE ROSTER // MONGO ENROLLMENTS
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl text-white font-medium">
                  Enrolled Students ({roster.length})
                </h2>
                <p className="text-zinc-400 text-xs mt-1">
                  Persisted registration records. Reloaded automatically on window focus and live refresh.
                </p>
              </div>

              {/* Search & Refresh Button */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <button
                  onClick={fetchRoster}
                  disabled={rosterLoading}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rosterLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Roster Table */}
            <div className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">STUDENT</th>
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">REGISTRATION DATE</th>
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">LESSONS COMPLETED</th>
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">PROGRESS</th>
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">LAST LEARNING ACTIVITY</th>
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold text-right">INSPECT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {rosterLoading ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-zinc-500 font-mono text-xs">
                          Reloading registered students from MongoDB...
                        </td>
                      </tr>
                    ) : roster.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-zinc-500 font-mono text-xs">
                          No students registered in this course yet.
                        </td>
                      </tr>
                    ) : (
                      roster.map((row) => (
                        <tr
                          key={row.enrollmentId}
                          onClick={() => handleOpenStudentDetail(row.student?._id)}
                          className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                        >
                          {/* Student name & email */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                {row.student?.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                                  {row.student?.name}
                                </div>
                                <div className="text-[11px] font-mono text-zinc-400">{row.student?.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Registration Date */}
                          <td className="py-4 px-6 text-xs font-mono text-zinc-300">
                            {new Date(row.registeredAt).toLocaleDateString()}
                          </td>

                          {/* Lessons Completed */}
                          <td className="py-4 px-6 text-xs font-mono text-zinc-300">
                            <strong className="text-emerald-400">{row.completedLessonsCount}</strong> of <strong>{row.totalLessonsCount}</strong>
                          </td>

                          {/* Progress Percentage */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-mono font-semibold text-white w-8">
                                {row.progressPercentage}%
                              </span>
                              <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${row.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Last Learning Activity ("Not started" for newly registered) */}
                          <td className="py-4 px-6 text-xs font-mono">
                            {row.lastActivityAt ? (
                              <span className="text-zinc-300">
                                {new Date(row.lastActivityAt).toLocaleString()}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 text-[10px]">
                                Not started
                              </span>
                            )}
                          </td>

                          {/* Inspect Action */}
                          <td className="py-4 px-6 text-right">
                            <span className="text-xs text-emerald-400 font-mono underline group-hover:text-emerald-300">
                              View Work
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student Detail Drawer */}
            {selectedStudentDetail && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end">
                <div className="w-full max-w-xl bg-[#0a0a0a] border-l border-white/10 h-full p-8 overflow-y-auto flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                      <span className="tech-label text-emerald-400">STUDENT AUDIT // COURSE WORK</span>
                      <button
                        onClick={() => setSelectedStudentDetail(null)}
                        className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Student profile */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
                        {selectedStudentDetail.student?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-headline text-xl text-white font-medium">
                          {selectedStudentDetail.student?.name}
                        </h3>
                        <p className="text-xs font-mono text-zinc-400">{selectedStudentDetail.student?.email}</p>
                      </div>
                    </div>

                    {/* Telemetry metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-8 text-xs font-mono">
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-zinc-500 block text-[10px]">LESSON PROGRESS</span>
                        <strong className="text-emerald-400 text-sm">
                          {selectedStudentDetail.enrollment?.completedCount} / {selectedStudentDetail.enrollment?.totalLessons} ({selectedStudentDetail.enrollment?.progressPercentage}%)
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-zinc-500 block text-[10px]">LAST ACTIVE</span>
                        <span className="text-zinc-200">
                          {selectedStudentDetail.enrollment?.lastActivityAt
                            ? new Date(selectedStudentDetail.enrollment.lastActivityAt).toLocaleDateString()
                            : 'Not started'}
                        </span>
                      </div>
                    </div>

                    {/* Assignment Submissions */}
                    <div className="mb-8">
                      <h4 className="tech-label text-zinc-400 mb-3">ASSIGNMENT SUBMISSIONS</h4>
                      {selectedStudentDetail.assignments?.length === 0 ? (
                        <div className="text-xs text-zinc-500 font-mono">No assignments in this course.</div>
                      ) : (
                        <div className="space-y-3">
                          {selectedStudentDetail.assignments?.map((asgn, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-white">{asgn.title}</span>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                  asgn.status === 'graded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.05] text-zinc-400'
                                }`}>
                                  {asgn.status.toUpperCase()}
                                </span>
                              </div>

                              {asgn.hasSubmission ? (
                                <div className="mt-2 text-xs space-y-1.5 font-mono">
                                  <div className="text-zinc-300">
                                    Score: <strong className="text-emerald-400">{asgn.marksAwarded ?? 'Ungraded'}</strong> / {asgn.maxMarks}
                                  </div>
                                  {asgn.feedback && (
                                    <div className="p-2 rounded-xl bg-emerald-500/5 text-emerald-300 text-[11px] font-sans">
                                      {asgn.feedback}
                                    </div>
                                  )}
                                  {asgn.textResponse && (
                                    <div className="p-2 rounded-xl bg-black/60 text-zinc-400 text-[11px] truncate">
                                      Response: {asgn.textResponse}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[11px] text-zinc-500 font-mono mt-1">No submission recorded</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quiz Attempts */}
                    <div>
                      <h4 className="tech-label text-zinc-400 mb-3">QUIZ ATTEMPTS</h4>
                      {selectedStudentDetail.quizzes?.length === 0 ? (
                        <div className="text-xs text-zinc-500 font-mono">No quizzes in this course.</div>
                      ) : (
                        <div className="space-y-3">
                          {selectedStudentDetail.quizzes?.map((qz, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex justify-between items-center">
                              <div>
                                <div className="text-xs font-medium text-white">{qz.title}</div>
                                <div className="text-[10px] font-mono text-zinc-500">
                                  {qz.hasAttempt ? `Submitted ${new Date(qz.submittedAt).toLocaleDateString()}` : 'No attempt'}
                                </div>
                              </div>
                              <div>
                                {qz.hasAttempt ? (
                                  <span className="text-xs font-mono font-bold text-emerald-400">
                                    {qz.marksEarned} / {qz.maxMarks} ({qz.percentage}%)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-zinc-500">Unattempted</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  <button
                    onClick={() => setSelectedStudentDetail(null)}
                    className="w-full mt-6 py-2.5 rounded-full bg-white/[0.05] text-xs text-zinc-400 hover:text-white"
                  >
                    Close Drawer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: ASSIGNMENTS
           ========================================================================= */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-3xl glass-panel border border-white/[0.08]">
              <div>
                <h2 className="font-headline text-2xl text-white font-medium">Assignments</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Publish assignments with timezone-aware deadlines and evaluate student responses.
                </p>
              </div>

              <button
                onClick={() => setCreateAsgnModal(true)}
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Assignment</span>
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/[0.08]">
                <FileCheck className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <h3 className="font-headline text-xl text-white mb-1">No Assignments Published</h3>
                <p className="text-zinc-400 text-xs">Create your first assignment using the button above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((asgn) => (
                  <div
                    key={asgn._id}
                    className="p-6 rounded-3xl glass-panel border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] tech-label text-emerald-400">{asgn.status.toUpperCase()}</span>
                        <span className="text-xs font-mono text-zinc-500">• Due: {new Date(asgn.deadline).toLocaleString()}</span>
                      </div>
                      <h3 className="font-headline text-xl text-white font-medium mb-1">{asgn.title}</h3>
                      <p className="text-xs text-zinc-400 font-sans line-clamp-2 max-w-2xl">{asgn.instructions}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right font-mono text-xs">
                        <div className="text-white font-semibold">{asgn.submissionCount || 0} Submissions</div>
                        <div className={`text-[11px] ${asgn.pendingCount > 0 ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}>
                          {asgn.pendingCount || 0} Waiting Review
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenSubmissions(asgn)}
                        className="px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all"
                      >
                        Submissions ({asgn.submissionCount || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submissions Modal */}
            {viewSubmissionsModal && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                    <div>
                      <span className="text-[10px] tech-label text-emerald-400">SUBMISSIONS REVIEW</span>
                      <h3 className="font-headline text-2xl text-white font-medium">{viewSubmissionsModal.assignment?.title}</h3>
                    </div>
                    <button
                      onClick={() => setViewSubmissionsModal(null)}
                      className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {viewSubmissionsModal.submissions?.length === 0 ? (
                    <div className="py-12 text-center text-xs font-mono text-zinc-500">
                      No submissions received for this assignment yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {viewSubmissionsModal.submissions?.map((sub) => (
                        <div
                          key={sub._id}
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{sub.student?.name}</span>
                              <span className="text-xs text-zinc-500 font-mono">({sub.student?.email})</span>
                            </div>
                            <div className="text-xs text-zinc-400 font-mono mb-2">
                              Submitted: {new Date(sub.submittedAt).toLocaleString()}
                            </div>

                            {sub.textResponse && (
                              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-xs text-zinc-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto mb-2">
                                {sub.textResponse}
                              </div>
                            )}

                            {sub.projectUrl && (
                              <a
                                href={sub.projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-mono"
                              >
                                <span>Project Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            {sub.status === 'graded' && sub.marksAwarded !== null ? (
                              <div className="mb-2">
                                <div className="text-base font-bold text-emerald-400 font-mono">
                                  {sub.marksAwarded} / {viewSubmissionsModal.assignment?.maxMarks} pts
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono">Graded</div>
                              </div>
                            ) : (
                              <div className="mb-2 text-amber-400 font-mono text-xs">Waiting for grade</div>
                            )}

                            <button
                              onClick={() => handleOpenGradeModal(sub)}
                              className="px-4 py-1.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
                            >
                              {sub.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grade Submission Modal */}
            {gradingSubmission && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                    <div>
                      <span className="text-[10px] tech-label text-emerald-400">EVALUATION & FEEDBACK</span>
                      <h3 className="font-headline text-xl text-white font-medium">Grade {gradingSubmission.student?.name}</h3>
                    </div>
                    <button
                      onClick={() => setGradingSubmission(null)}
                      className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitGrade} className="space-y-4">
                    <div>
                      <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">
                        MARKS AWARDED (0 TO {viewSubmissionsModal?.assignment?.maxMarks}) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={viewSubmissionsModal?.assignment?.maxMarks || 100}
                        required
                        value={marksInput}
                        onChange={(e) => setMarksInput(e.target.value)}
                        placeholder="e.g. 95"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">
                        INSTRUCTOR FEEDBACK & CRITIQUE
                      </label>
                      <textarea
                        rows={4}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Write detailed pedagogical feedback for the student..."
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-sans"
                      ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setGradingSubmission(null)}
                        className="px-5 py-2 rounded-full bg-white/[0.05] text-xs text-zinc-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold"
                      >
                        Return Grade
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: QUIZZES
           ========================================================================= */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-3xl glass-panel border border-white/[0.08]">
              <div>
                <h2 className="font-headline text-2xl text-white font-medium">Quizzes</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Single-answer multiple-choice quizzes scored on Express with single-attempt enforcement.
                </p>
              </div>

              <button
                onClick={() => setCreateQuizModal(true)}
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Quiz</span>
              </button>
            </div>

            {quizzes.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/[0.08]">
                <CheckCircle2 className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <h3 className="font-headline text-xl text-white mb-1">No Quizzes Created</h3>
                <p className="text-zinc-400 text-xs">Build a single-answer quiz using the button above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((qz) => (
                  <div
                    key={qz._id}
                    className="p-6 rounded-3xl glass-panel border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] tech-label text-emerald-400">{qz.status.toUpperCase()}</span>
                        <span className="text-xs font-mono text-zinc-500">• {qz.questionCount} Questions</span>
                        <span className="text-xs font-mono text-zinc-500">• {qz.totalPoints} Total Points</span>
                      </div>
                      <h3 className="font-headline text-xl text-white font-medium">{qz.title}</h3>
                      {qz.description && <p className="text-xs text-zinc-400 font-sans mt-0.5">{qz.description}</p>}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs font-mono text-zinc-300">
                        {qz.attemptCount || 0} Student Attempts
                      </span>
                      <button
                        onClick={() => handleOpenQuizAttempts(qz)}
                        className="px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all"
                      >
                        Inspect Attempts
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quiz Attempts Modal */}
            {viewAttemptsModal && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                    <div>
                      <span className="text-[10px] tech-label text-emerald-400">STUDENT ATTEMPTS RECORD</span>
                      <h3 className="font-headline text-2xl text-white font-medium">{viewAttemptsModal.quiz?.title}</h3>
                    </div>
                    <button
                      onClick={() => setViewAttemptsModal(null)}
                      className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {viewAttemptsModal.attempts?.length === 0 ? (
                    <div className="py-12 text-center text-xs font-mono text-zinc-500">
                      No student attempts recorded for this quiz yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {viewAttemptsModal.attempts?.map((att) => (
                        <div
                          key={att._id}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium text-white">{att.student?.name}</div>
                            <div className="text-xs text-zinc-500 font-mono">
                              {att.student?.email} • {new Date(att.submittedAt).toLocaleString()}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-mono font-bold text-emerald-400">
                              {att.marksEarned} / {att.maxMarks} ({att.percentage}%)
                            </span>
                            <div className="text-[10px] text-zinc-500 font-mono">FINAL EVALUATION</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 6: GRADEBOOK
           ========================================================================= */}
        {activeTab === 'gradebook' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] flex items-center justify-between">
              <div>
                <h2 className="font-headline text-2xl text-white font-medium">Course Gradebook</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Full student matrix across all published assignments and quizzes.
                </p>
              </div>

              <button
                onClick={fetchGradebook}
                className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Matrix</span>
              </button>
            </div>

            <div className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold">STUDENT</th>
                      {gradebookData?.assignments?.map((a) => (
                        <th key={a._id} className="py-4 px-4 tech-label text-zinc-400 font-semibold truncate max-w-[120px]">
                          {a.title} ({a.maxMarks})
                        </th>
                      ))}
                      {gradebookData?.quizzes?.map((q) => (
                        <th key={q._id} className="py-4 px-4 tech-label text-zinc-400 font-semibold truncate max-w-[120px]">
                          {q.title} ({q.maxMarks})
                        </th>
                      ))}
                      <th className="py-4 px-6 tech-label text-zinc-400 font-semibold text-right">WEIGHTED AVG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] font-mono">
                    {!gradebookData || gradebookData.students?.length === 0 ? (
                      <tr>
                        <td colSpan={2 + (gradebookData?.assignments?.length || 0) + (gradebookData?.quizzes?.length || 0)} className="py-12 text-center text-zinc-500 text-xs">
                          No enrolled students in this course gradebook yet.
                        </td>
                      </tr>
                    ) : (
                      gradebookData.students?.map((s) => (
                        <tr key={s.student._id} className="hover:bg-white/[0.02]">
                          <td className="py-4 px-6 font-sans">
                            <div className="font-medium text-white">{s.student.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{s.student.email}</div>
                          </td>

                          {s.assignmentGrades?.map((ag, idx) => (
                            <td key={idx} className="py-4 px-4">
                              {ag.marksAwarded !== null ? (
                                <span className="text-emerald-400 font-semibold">{ag.marksAwarded}</span>
                              ) : ag.status === 'submitted' ? (
                                <span className="text-amber-400 text-[10px]">Ungraded</span>
                              ) : (
                                <span className="text-zinc-600">-</span>
                              )}
                            </td>
                          ))}

                          {s.quizGrades?.map((qg, idx) => (
                            <td key={idx} className="py-4 px-4">
                              {qg.hasAttempt ? (
                                <span className="text-emerald-400 font-semibold">{qg.marksEarned}</span>
                              ) : (
                                <span className="text-zinc-600">-</span>
                              )}
                            </td>
                          ))}

                          <td className="py-4 px-6 text-right font-bold text-sm">
                            {s.averagePercentage !== null ? (
                              <span className="text-emerald-400">{s.averagePercentage}%</span>
                            ) : (
                              <span className="text-zinc-500 text-xs font-normal">No graded work yet</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: ANNOUNCEMENTS
           ========================================================================= */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-3xl glass-panel border border-white/[0.08]">
              <div>
                <h2 className="font-headline text-2xl text-white font-medium">Course Announcements</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Published updates appear immediately on registered students' dashboards.
                </p>
              </div>

              <button
                onClick={() => setAnnouncementModal(true)}
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Announcement</span>
              </button>
            </div>

            {announcements.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/[0.08]">
                <Bell className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <h3 className="font-headline text-xl text-white mb-1">No Announcements Yet</h3>
                <p className="text-zinc-400 text-xs">Broadcast your first message to enrolled students.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className="p-6 rounded-3xl glass-panel border border-white/[0.08] flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-mono text-zinc-500 mb-1">
                        Posted {new Date(ann.createdAt).toLocaleString()}
                      </div>
                      <h3 className="font-headline text-xl text-white font-medium mb-2">{ann.title}</h3>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="text-zinc-500 hover:text-red-400 p-2"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Announcement Create Modal */}
            {announcementModal && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                    <h3 className="font-headline text-xl text-white font-medium">Create Course Announcement</h3>
                    <button onClick={() => setAnnouncementModal(false)} className="text-zinc-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">TITLE *</label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="e.g. Schedule for Raft Protocol Workshop"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">CONTENT *</label>
                      <textarea
                        rows={4}
                        required
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="Detailed announcement text..."
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-sans"
                      ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setAnnouncementModal(false)}
                        className="px-5 py-2 rounded-full bg-white/[0.05] text-xs text-zinc-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
                      >
                        Publish Announcement
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Lesson Edit / Create Modal */}
      {activeLessonModal && (
        <LessonEditorModal
          courseId={courseId}
          moduleId={activeLessonModal.moduleId}
          initialLesson={activeLessonModal.lesson}
          onClose={() => setActiveLessonModal(null)}
          onSaved={(updatedModules) => {
            setCourse({ ...course, modules: updatedModules });
            setActiveLessonModal(null);
          }}
        />
      )}

      {/* Student Lesson Preview Modal */}
      {previewLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <span className="text-[10px] tech-label text-emerald-400">STUDENT VIEW PREVIEW</span>
              <button onClick={() => setPreviewLessonModal(null)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-headline text-3xl text-white mb-6">{previewLessonModal.title}</h3>
            <div className="prose prose-invert text-zinc-300 font-sans text-sm leading-relaxed whitespace-pre-line mb-6">
              {previewLessonModal.text}
            </div>
            {previewLessonModal.resourceLinks?.length > 0 && (
              <div className="pt-4 border-t border-white/[0.08]">
                <div className="text-[10px] tech-label text-zinc-400 mb-2">RESOURCES</div>
                <div className="space-y-1 text-xs">
                  {previewLessonModal.resourceLinks.map((r, i) => (
                    <div key={i} className="text-emerald-400">{r.title} - {r.url}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {createAsgnModal && (
        <CreateAssignmentModal
          courseId={courseId}
          onClose={() => setCreateAsgnModal(false)}
          onCreated={(newAsgn) => {
            setAssignments([...assignments, newAsgn]);
            setCreateAsgnModal(false);
          }}
        />
      )}

      {/* Create Quiz Modal */}
      {createQuizModal && (
        <CreateQuizModal
          courseId={courseId}
          onClose={() => setCreateQuizModal(false)}
          onCreated={(newQz) => {
            setQuizzes([...quizzes, newQz]);
            setCreateQuizModal(false);
          }}
        />
      )}

    </div>
  );
}

/**
 * Sub-Component: Lesson Editor Modal (Handles Title, Text, Video URL, Resource Links)
 */
function LessonEditorModal({ courseId, moduleId, initialLesson, onClose, onSaved }) {
  const isEditing = !!initialLesson;
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [text, setText] = useState(initialLesson?.text || '');
  const [videoUrl, setVideoUrl] = useState(initialLesson?.videoUrl || '');
  const [resources, setResources] = useState(initialLesson?.resourceLinks || [{ title: '', url: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddResource = () => setResources([...resources, { title: '', url: '' }]);
  const handleRemoveResource = (idx) => setResources(resources.filter((_, i) => i !== idx));
  const handleResourceChange = (idx, field, val) => {
    const updated = [...resources];
    updated[idx][field] = val;
    setResources(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      setError('Lesson title and readable text content are required.');
      return;
    }

    setLoading(true);
    setError('');

    const validResources = resources.filter((r) => r.title.trim() && r.url.trim());

    const url = isEditing
      ? `/api/curriculum/${courseId}/modules/${moduleId}/lessons/${initialLesson._id}`
      : `/api/curriculum/${courseId}/modules/${moduleId}/lessons`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          text,
          videoUrl: videoUrl.trim(),
          resourceLinks: validResources,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save lesson');

      onSaved(data.modules);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <span className="text-[10px] tech-label text-emerald-400">
            {isEditing ? 'EDIT LESSON' : 'CREATE NEW LESSON'}
          </span>
          <button onClick={onClose} className="text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">LESSON TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Byzantine Fault Tolerance Protocols"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">LESSON CONTENT / TEXT *</label>
            <textarea
              rows={8}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Detailed lesson explanation, architectural trade-offs, and examples..."
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-sans"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">VIDEO URL (OPTIONAL)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tech-label text-zinc-400">NAMED RESOURCE LINKS (HTTP/HTTPS)</label>
              <button
                type="button"
                onClick={handleAddResource}
                className="text-[10px] text-emerald-400 font-mono flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Resource</span>
              </button>
            </div>

            <div className="space-y-2">
              {resources.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={r.title}
                    onChange={(e) => handleResourceChange(i, 'title', e.target.value)}
                    placeholder="Resource Title (e.g. Paper Spec)"
                    className="w-1/3 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="url"
                    value={r.url}
                    onChange={(e) => handleResourceChange(i, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white font-mono"
                  />
                  {resources.length > 1 && (
                    <button type="button" onClick={() => handleRemoveResource(i)} className="p-1.5 text-zinc-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white/[0.05] text-xs text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold"
            >
              {loading ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Sub-Component: Create Assignment Modal
 */
function CreateAssignmentModal({ courseId, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [deadline, setDeadline] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim() || !deadline) {
      setError('Title, instructions, and deadline date are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/assignments/course/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          instructions: instructions.trim(),
          maxMarks: Number(maxMarks),
          deadline,
          timezone,
          status: 'published',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create assignment');

      onCreated(data.assignment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <span className="text-[10px] tech-label text-emerald-400">PUBLISH ASSIGNMENT</span>
          <button onClick={onClose} className="text-zinc-400"><X className="w-4 h-4" /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Raft Consensus"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">INSTRUCTIONS *</label>
            <textarea
              rows={4}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Clear prompt and deliverables required from students..."
              className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-sans"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">MAX MARKS *</label>
              <input
                type="number"
                min="1"
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">TIMEZONE</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">DEADLINE DATE & TIME *</label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white font-mono"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full bg-white/[0.05] text-xs text-zinc-400">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold">
              {loading ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Sub-Component: Create Quiz Builder Modal
 */
function CreateQuizModal({ courseId, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    {
      prompt: '',
      options: ['', ''],
      correctOptionIndex: 0,
      points: 10,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { prompt: '', options: ['', ''], correctOptionIndex: 0, points: 10 },
    ]);
  };

  const handleQuestionChange = (qIdx, field, val) => {
    const updated = [...questions];
    updated[qIdx][field] = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push('');
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/quizzes/course/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          questions,
          status: 'published',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create quiz');

      onCreated(data.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <span className="text-[10px] tech-label text-emerald-400">QUIZ BUILDER (1-ATTEMPT ENFORCED)</span>
          <button onClick={onClose} className="text-zinc-400"><X className="w-4 h-4" /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">QUIZ TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Consensus Protocols Mastery Quiz"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">DESCRIPTION</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief instructions for the student..."
              className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
            />
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 tech-label">QUESTIONS ({questions.length})</span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs text-emerald-400 font-mono flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">QUESTION {qIdx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Points:</span>
                    <input
                      type="number"
                      min="1"
                      value={q.points}
                      onChange={(e) => handleQuestionChange(qIdx, 'points', Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white text-center"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={q.prompt}
                  onChange={(e) => handleQuestionChange(qIdx, 'prompt', e.target.value)}
                  placeholder="Question prompt..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
                />

                <div className="space-y-1.5">
                  <span className="text-[10px] tech-label text-zinc-500">OPTIONS (SELECT CORRECT RADIO KEY)</span>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctOptionIndex === optIdx}
                        onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', optIdx)}
                        className="text-emerald-500"
                        title="Mark as correct answer key"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIdx)}
                    className="text-[10px] text-zinc-400 hover:text-white font-mono"
                  >
                    + Add option
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full bg-white/[0.05] text-xs text-zinc-400">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold">
              {loading ? 'Creating...' : 'Publish Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
