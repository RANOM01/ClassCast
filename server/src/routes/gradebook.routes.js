import express from 'express';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { requireAuth, requireInstructor, requireStudent, requireCourseOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Instructor Gradebook for a Course
 * Lists all enrolled students and their assignment and quiz results for this course.
 */
router.get('/instructor/:courseId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;

    const assignments = await Assignment.find({ course: course._id, status: 'published' }).sort({ deadline: 1 });
    const quizzes = await Quiz.find({ course: course._id, status: 'published' }).sort({ createdAt: 1 });

    const enrollments = await Enrollment.find({ course: course._id })
      .populate('student', 'name email avatarPreset')
      .sort({ registeredAt: 1 });

    const studentRows = await Promise.all(
      enrollments.map(async (enr) => {
        const student = enr.student;
        if (!student) return null;

        let totalEarned = 0;
        let totalPossible = 0;
        let gradedItemsCount = 0;

        // Assignments
        const assignmentGrades = await Promise.all(
          assignments.map(async (asgn) => {
            const sub = await Submission.findOne({ assignment: asgn._id, student: student._id });
            const isGraded = sub && sub.status === 'graded' && sub.marksAwarded !== null;
            if (isGraded) {
              totalEarned += sub.marksAwarded;
              totalPossible += asgn.maxMarks;
              gradedItemsCount++;
            }

            return {
              assignmentId: asgn._id,
              title: asgn.title,
              maxMarks: asgn.maxMarks,
              status: sub ? sub.status : 'missing',
              marksAwarded: sub ? sub.marksAwarded : null,
              feedback: sub ? sub.feedback : '',
              submittedAt: sub ? sub.submittedAt : null,
            };
          })
        );

        // Quizzes
        const quizGrades = await Promise.all(
          quizzes.map(async (qz) => {
            const attempt = await QuizAttempt.findOne({ quiz: qz._id, student: student._id });
            if (attempt) {
              totalEarned += attempt.marksEarned;
              totalPossible += attempt.maxMarks;
              gradedItemsCount++;
            }

            return {
              quizId: qz._id,
              title: qz.title,
              maxMarks: attempt ? attempt.maxMarks : qz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0,
              marksEarned: attempt ? attempt.marksEarned : null,
              percentage: attempt ? attempt.percentage : null,
              hasAttempt: !!attempt,
              submittedAt: attempt ? attempt.submittedAt : null,
            };
          })
        );

        const averagePercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : null;

        return {
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            avatarPreset: student.avatarPreset,
          },
          registeredAt: enr.registeredAt,
          assignmentGrades,
          quizGrades,
          totalEarned,
          totalPossible,
          gradedItemsCount,
          averagePercentage, // null if 0 possible points
        };
      })
    );

    return res.json({
      course: {
        _id: course._id,
        title: course.title,
      },
      assignments: assignments.map((a) => ({ _id: a._id, title: a.title, maxMarks: a.maxMarks })),
      quizzes: quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        maxMarks: q.questions?.reduce((sum, item) => sum + (item.points || 0), 0) || 0,
      })),
      students: studentRows.filter(Boolean),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load gradebook.', details: err.message });
  }
});

/**
 * Student Personal Grades
 * Shows ONLY the authenticated student's results across enrolled courses.
 * Calculates earned points / possible points for graded items.
 * Returns "No graded work yet" when the denominator is zero.
 */
router.get('/student/my-grades', requireStudent, async (req, res) => {
  try {
    const studentId = req.session.userId;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'title category level coverPreset');

    const courseGrades = await Promise.all(
      enrollments.map(async (enr) => {
        const course = enr.course;
        if (!course) return null;

        const assignments = await Assignment.find({ course: course._id, status: 'published' }).sort({ deadline: 1 });
        const quizzes = await Quiz.find({ course: course._id, status: 'published' }).sort({ createdAt: 1 });

        let earnedPoints = 0;
        let possiblePoints = 0;
        let gradedCount = 0;

        const assignmentResults = await Promise.all(
          assignments.map(async (asgn) => {
            const sub = await Submission.findOne({ assignment: asgn._id, student: studentId });
            const isGraded = sub && sub.status === 'graded' && sub.marksAwarded !== null;
            if (isGraded) {
              earnedPoints += sub.marksAwarded;
              possiblePoints += asgn.maxMarks;
              gradedCount++;
            }

            return {
              _id: asgn._id,
              title: asgn.title,
              maxMarks: asgn.maxMarks,
              deadline: asgn.deadline,
              status: sub ? sub.status : 'missing',
              marksAwarded: sub ? sub.marksAwarded : null,
              feedback: sub ? sub.feedback : '',
              submittedAt: sub ? sub.submittedAt : null,
              gradedAt: sub ? sub.gradedAt : null,
            };
          })
        );

        const quizResults = await Promise.all(
          quizzes.map(async (qz) => {
            const attempt = await QuizAttempt.findOne({ quiz: qz._id, student: studentId });
            if (attempt) {
              earnedPoints += attempt.marksEarned;
              possiblePoints += attempt.maxMarks;
              gradedCount++;
            }

            const totalQzPoints = qz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

            return {
              _id: qz._id,
              title: qz.title,
              maxMarks: attempt ? attempt.maxMarks : totalQzPoints,
              marksEarned: attempt ? attempt.marksEarned : null,
              percentage: attempt ? attempt.percentage : null,
              hasAttempt: !!attempt,
              submittedAt: attempt ? attempt.submittedAt : null,
            };
          })
        );

        const hasGradedWork = possiblePoints > 0;
        const average = hasGradedWork ? Math.round((earnedPoints / possiblePoints) * 100) : null;

        return {
          course: {
            _id: course._id,
            title: course.title,
            category: course.category,
            level: course.level,
            coverPreset: course.coverPreset,
          },
          assignments: assignmentResults,
          quizzes: quizResults,
          earnedPoints,
          possiblePoints,
          gradedCount,
          averagePercentage: average,
          averageDisplay: hasGradedWork ? `${average}%` : 'No graded work yet',
        };
      })
    );

    return res.json({ courses: courseGrades.filter(Boolean) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch student grades.', details: err.message });
  }
});

export default router;
