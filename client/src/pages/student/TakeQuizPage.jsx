import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Award,
  HelpCircle,
  Clock,
} from 'lucide-react';

export function TakeQuizPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/quizzes/${quizId}/take`, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load quiz');
        }
        setQuiz(data.quiz);
      })
      .catch((err) => {
        setErrorMsg(err.message);
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitAttempt = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setErrorMsg('');

    try {
      const answersArray = quiz.questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1,
      }));

      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: answersArray }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setQuizResult(data.result);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-zinc-500 font-mono text-sm">Preparing sanitized quiz environment...</div>
      </div>
    );
  }

  if (errorMsg && !quizResult) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-xl mx-auto text-center">
        <div className="p-8 rounded-3xl glass-panel border border-red-500/20 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-headline text-2xl text-white mb-2">Quiz Inaccessible</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{errorMsg}</p>
          <Link
            to="/student/dashboard"
            className="px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-white hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If Quiz submitted successfully, render Results Review
  if (quizResult) {
    return (
      <div className="min-h-screen pt-28 pb-24 px-6 max-w-3xl mx-auto">
        <div className="rounded-3xl glass-panel border border-white/[0.1] p-8 sm:p-12 shadow-2xl">
          
          <div className="text-center pb-8 border-b border-white/[0.08] mb-8">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-[10px] tech-label text-emerald-400">ATTEMPT EVALUATION RECORD</span>
            <h1 className="font-headline text-3xl text-white font-medium mt-1 mb-2">
              {quizResult.quizTitle}
            </h1>
            <p className="text-zinc-400 text-xs font-mono">
              Completed on {new Date(quizResult.submittedAt).toLocaleString()}
            </p>

            {/* Score pill */}
            <div className="mt-6 inline-flex items-center gap-6 px-8 py-4 rounded-3xl bg-white/[0.02] border border-white/[0.08]">
              <div>
                <div className="text-[10px] tech-label text-zinc-400">MARKS EARNED</div>
                <div className="text-3xl font-headline text-emerald-400 font-bold">
                  {quizResult.marksEarned} / {quizResult.maxMarks}
                </div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <div className="text-[10px] tech-label text-zinc-400">ACCURACY</div>
                <div className="text-3xl font-headline text-white font-bold">
                  {quizResult.percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="space-y-6 mb-10">
            <h3 className="font-headline text-xl text-white">Question Review</h3>
            {quizResult.review?.map((q, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${
                  q.isCorrect ? 'bg-emerald-500/[0.03] border-emerald-500/30' : 'bg-red-500/[0.03] border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-400">Question {idx + 1} ({q.points} pts)</span>
                  <span className={q.isCorrect ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {q.isCorrect ? '+ ' + q.points + ' PTS (CORRECT)' : '0 PTS (INCORRECT)'}
                  </span>
                </div>

                <div className="text-sm font-medium text-white mb-4">{q.prompt}</div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.selectedOptionIndex === optIdx;
                    const isCorrect = q.correctOptionIndex === optIdx;

                    let rowStyle = 'bg-white/[0.02] border-white/[0.05] text-zinc-400';
                    if (isCorrect) {
                      rowStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      rowStyle = 'bg-red-500/10 border-red-500/40 text-red-300';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${rowStyle}`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <span className="text-[10px] font-mono text-emerald-400">✓ CORRECT KEY</span>}
                        {isSelected && !isCorrect && (
                          <span className="text-[10px] font-mono text-red-400">✗ YOUR ANSWER</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/student/dashboard"
              className="px-8 py-3 rounded-full bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Return to Student Dashboard
            </Link>
          </div>

        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quiz?.questions?.length || 0;

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 max-w-3xl mx-auto">
      <div className="rounded-3xl glass-panel border border-white/[0.1] p-6 sm:p-10 shadow-2xl">
        
        {/* Header */}
        <div className="pb-6 mb-8 border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tech-label text-emerald-400">ONLINE EVALUATION</span>
            <span className="text-xs font-mono text-zinc-400">
              {totalQuestions} Questions • {quiz.totalPoints} Total Points
            </span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl text-white font-normal">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-zinc-400 text-xs font-sans mt-2">{quiz.description}</p>
          )}

          {/* Single Attempt Warning Banner */}
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-400 font-mono mb-0.5">EXACTLY ONE FINAL ATTEMPT ALLOWED</strong>
              You may take this quiz only once. Once submitted, your answers are scored permanently in the database and cannot be modified or retaken.
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-8 mb-10">
          {quiz.questions.map((question, qIdx) => (
            <div key={question._id} className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
                <span>QUESTION {qIdx + 1} OF {totalQuestions}</span>
                <span className="text-emerald-400">{question.points} POINTS</span>
              </div>

              <div className="text-sm sm:text-base font-medium text-white mb-4">
                {question.prompt}
              </div>

              <div className="space-y-2.5">
                {question.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[question._id] === optIdx;

                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(question._id, optIdx)}
                      className={`p-3.5 rounded-xl border text-xs flex items-center gap-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${question._id}`}
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
          <div className="text-xs font-mono text-zinc-400">
            Answered <strong className="text-white">{answeredCount}</strong> of <strong className="text-white">{totalQuestions}</strong>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            Submit Final Attempt
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/[0.15] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="font-headline text-2xl text-white mb-2">Confirm Final Submission?</h3>
            <p className="text-zinc-400 text-xs mb-4 font-sans leading-relaxed">
              You have answered {answeredCount} of {totalQuestions} questions. You cannot change your answers after submission.
            </p>
            {answeredCount < totalQuestions && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-6 font-mono">
                Warning: You have {totalQuestions - answeredCount} unanswered question(s).
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-zinc-300 hover:bg-white/10"
              >
                Keep Reviewing
              </button>
              <button
                onClick={handleSubmitAttempt}
                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-lg shadow-emerald-500/20"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
