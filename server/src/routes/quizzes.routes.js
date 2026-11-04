import express from 'express';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { requireAuth, requireInstructor, requireStudent, requireCourseOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get quizzes for a course
 */
router.get('/course/:courseId', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.session.userId;
    const isInstructor = req.session.role === 'Instructor';

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    let filter = { course: courseId };
    if (!isInstructor || course.instructor.toString() !== userId) {
      filter.status = 'published';
      const isEnrolled = await Enrollment.findOne({ course: courseId, student: userId });
      if (!isEnrolled) {
        return res.status(403).json({ error: 'You must be enrolled in this course to view quizzes.' });
      }
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    const results = await Promise.all(
      quizzes.map(async (qz) => {
        let totalPoints = 0;
        qz.questions?.forEach((q) => {
          totalPoints += q.points || 0;
        });

        if (req.session.role === 'Student') {
          const attempt = await QuizAttempt.findOne({ quiz: qz._id, student: userId });
          return {
            _id: qz._id,
            title: qz.title,
            description: qz.description,
            questionCount: qz.questions?.length || 0,
            totalPoints,
            status: qz.status,
            createdAt: qz.createdAt,
            hasAttempted: !!attempt,
            myAttempt: attempt ? {
              marksEarned: attempt.marksEarned,
              maxMarks: attempt.maxMarks,
              percentage: attempt.percentage,
              submittedAt: attempt.submittedAt,
            } : null,
          };
        } else {
          // Instructor view
          const attemptCount = await QuizAttempt.countDocuments({ quiz: qz._id });
          return {
            ...qz.toObject(),
            questionCount: qz.questions?.length || 0,
            totalPoints,
            attemptCount,
          };
        }
      })
    );

    return res.json({ quizzes: results });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch quizzes.', details: err.message });
  }
});

/**
 * Student: Fetch quiz to take
 * CRITICAL: NEVER INCLUDE correctOptionIndex IN PRE-SUBMISSION API RESPONSE!
 */
router.get('/:quizId/take', requireStudent, async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.session.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== 'published') {
      return res.status(404).json({ error: 'Published quiz not found.' });
    }

    // Verify enrollment
    const isEnrolled = await Enrollment.findOne({ course: quiz.course, student: studentId });
    if (!isEnrolled) {
      return res.status(403).json({ error: 'You are not enrolled in this course.' });
    }

    // Verify student has not already attempted
    const existingAttempt = await QuizAttempt.findOne({ quiz: quizId, student: studentId });
    if (existingAttempt) {
      return res.status(400).json({
        error: 'You have already completed your single allowed attempt for this quiz.',
        myAttempt: existingAttempt,
      });
    }

    // Sanitize questions: strip correctOptionIndex completely
    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      prompt: q.prompt,
      options: q.options,
      points: q.points,
    }));

    let totalPoints = 0;
    quiz.questions.forEach((q) => {
      totalPoints += q.points;
    });

    return res.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalPoints,
        questions: sanitizedQuestions,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to prepare quiz.', details: err.message });
  }
});

/**
 * Student: Submit quiz attempt
 * Express evaluates answers. Enforces strictly 1 attempt per student per quiz.
 */
router.post('/:quizId/submit', requireStudent, async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.session.userId;
    const { answers } = req.body; // Array of { questionId, selectedOptionIndex }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== 'published') {
      return res.status(404).json({ error: 'Quiz not found or not published.' });
    }

    const isEnrolled = await Enrollment.findOne({ course: quiz.course, student: studentId });
    if (!isEnrolled) {
      return res.status(403).json({ error: 'You are not enrolled in this course.' });
    }

    // Check existing attempt
    const existingAttempt = await QuizAttempt.findOne({ quiz: quizId, student: studentId });
    if (existingAttempt) {
      return res.status(400).json({
        error: 'Only one attempt is permitted per student for this quiz. Submission rejected.',
        attempt: existingAttempt,
      });
    }

    // Score answers in Express
    let marksEarned = 0;
    let maxMarks = 0;
    const gradedAnswers = [];

    const answerMap = new Map();
    if (Array.isArray(answers)) {
      answers.forEach((a) => {
        if (a.questionId !== undefined) {
          answerMap.set(a.questionId.toString(), Number(a.selectedOptionIndex));
        }
      });
    }

    quiz.questions.forEach((q) => {
      maxMarks += q.points;
      const selectedIndex = answerMap.get(q._id.toString());
      const isCorrect = selectedIndex !== undefined && selectedIndex === q.correctOptionIndex;
      const pointsEarned = isCorrect ? q.points : 0;

      marksEarned += pointsEarned;
      gradedAnswers.push({
        questionId: q._id,
        selectedOptionIndex: selectedIndex !== undefined ? selectedIndex : -1,
        isCorrect,
        pointsEarned,
      });
    });

    const percentage = maxMarks > 0 ? Math.round((marksEarned / maxMarks) * 100) : 0;

    let attempt;
    try {
      attempt = new QuizAttempt({
        quiz: quiz._id,
        course: quiz.course,
        student: studentId,
        answers: gradedAnswers,
        marksEarned,
        maxMarks,
        percentage,
        submittedAt: new Date(),
      });
      await attempt.save();
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        return res.status(400).json({
          error: 'An attempt for this quiz has already been recorded.',
        });
      }
      throw saveErr;
    }

    // Update student's lastActivityAt in enrollment
    await Enrollment.findOneAndUpdate(
      { course: quiz.course, student: studentId },
      { $set: { lastActivityAt: new Date() } }
    );

    return res.status(201).json({
      message: 'Quiz submitted and evaluated successfully!',
      result: {
        attemptId: attempt._id,
        quizTitle: quiz.title,
        marksEarned,
        maxMarks,
        percentage,
        submittedAt: attempt.submittedAt,
        // Include review with questions & correct options now that it's submitted
        review: quiz.questions.map((q) => {
          const selected = answerMap.get(q._id.toString());
          return {
            prompt: q.prompt,
            options: q.options,
            points: q.points,
            selectedOptionIndex: selected !== undefined ? selected : -1,
            correctOptionIndex: q.correctOptionIndex,
            isCorrect: selected === q.correctOptionIndex,
          };
        }),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process quiz submission.', details: err.message });
  }
});

/**
 * Instructor: Create quiz
 */
router.post('/course/:courseId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { title, description, questions, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Quiz title is required.' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'At least one multiple-choice question is required.' });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt || !q.options || q.options.length < 2) {
        return res.status(400).json({ error: `Question ${i + 1} must have a prompt and at least 2 options.` });
      }
      if (q.correctOptionIndex === undefined || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        return res.status(400).json({ error: `Question ${i + 1} must specify a valid correct option index.` });
      }
      if (!q.points || q.points <= 0) {
        return res.status(400).json({ error: `Question ${i + 1} must have a positive point value.` });
      }
    }

    const quiz = new Quiz({
      course: course._id,
      instructor: req.session.userId,
      title: title.trim(),
      description: description || '',
      questions,
      status: status === 'draft' ? 'draft' : 'published',
    });

    await quiz.save();
    return res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create quiz.', details: err.message });
  }
});

/**
 * Instructor: Update quiz
 * "Prevent changes to scored questions or point values after a student has attempted the quiz."
 */
router.put('/:quizId', requireInstructor, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    if (quiz.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this quiz.' });
    }

    const { title, description, questions, status } = req.body;

    const attemptsCount = await QuizAttempt.countDocuments({ quiz: quizId });

    if (attemptsCount > 0 && questions !== undefined) {
      return res.status(400).json({
        error: 'Cannot modify quiz questions or point values: Students have already completed attempts on this quiz. Only title and description can be updated.',
      });
    }

    if (title) quiz.title = title.trim();
    if (description !== undefined) quiz.description = description;
    if (status) quiz.status = status;
    if (questions && attemptsCount === 0) quiz.questions = questions;

    await quiz.save();
    return res.json({ message: 'Quiz updated successfully', quiz });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update quiz.', details: err.message });
  }
});

/**
 * Instructor: View all student attempts for a quiz
 */
router.get('/:quizId/attempts', requireInstructor, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    if (quiz.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this quiz.' });
    }

    const attempts = await QuizAttempt.find({ quiz: quizId })
      .populate('student', 'name email avatarPreset')
      .sort({ submittedAt: -1 });

    return res.json({
      quiz,
      attempts,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch quiz attempts.', details: err.message });
  }
});

export default router;
