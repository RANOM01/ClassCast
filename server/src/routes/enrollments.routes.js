import express from 'express';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Announcement } from '../models/Announcement.js';
import { requireAuth, requireStudent, requireInstructor, requireCourseOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper to count total lessons in a course
 */
function getTotalLessonsCount(course) {
  let count = 0;
  if (course.modules) {
    for (const mod of course.modules) {
      count += mod.lessons ? mod.lessons.length : 0;
    }
  }
  return count;
}

/**
 * Register for a course (Student)
 * Enforces unique compound index on student and course. Double clicks or retries do not duplicate.
 */
router.post('/register', requireStudent, async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.session.userId;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (course.status !== 'published') {
      if (course.status === 'closed') {
        return res.status(400).json({ error: 'Registration is currently closed for this course.' });
      }
      return res.status(400).json({ error: 'This course is not open for registration.' });
    }

    // Check if already registered
    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (enrollment) {
      return res.json({
        message: 'Already registered for this course.',
        enrollment,
        isNew: false,
      });
    }

    // Pick first lesson ID as initial lastViewedLessonId if available
    let initialLessonId = null;
    if (course.modules?.[0]?.lessons?.[0]?._id) {
      initialLessonId = course.modules[0].lessons[0]._id;
    }

    try {
      enrollment = new Enrollment({
        student: studentId,
        course: courseId,
        registeredAt: new Date(),
        completedLessonIds: [],
        lastViewedLessonId: initialLessonId,
        lastActivityAt: null, // "Not started" initially
      });

      await enrollment.save();
    } catch (saveErr) {
      // Gracefully handle race condition duplicate key error (code 11000)
      if (saveErr.code === 11000) {
        enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        return res.json({
          message: 'Already registered for this course.',
          enrollment,
          isNew: false,
        });
      }
      throw saveErr;
    }

    return res.status(201).json({
      message: 'Registration successful! Welcome to the course.',
      enrollment,
      isNew: true,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register for course.', details: err.message });
  }
});

/**
 * Student Dashboard Data:
 * My Learning, Continue Learning, Upcoming deadlines, Course announcements, Recently returned grades
 */
router.get('/my-learning', requireStudent, async (req, res) => {
  try {
    const studentId = req.session.userId;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        select: 'title shortDescription category level coverPreset status modules instructor',
        populate: {
          path: 'instructor',
          select: 'name headline avatarPreset',
        },
      })
      .sort({ lastActivityAt: -1, registeredAt: -1 });

    const enrolledCourseIds = [];
    const coursesProgress = enrollments.map((enr) => {
      const course = enr.course;
      if (!course) return null;

      enrolledCourseIds.push(course._id);
      const totalLessons = getTotalLessonsCount(course);
      const completedCount = enr.completedLessonIds ? enr.completedLessonIds.length : 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return {
        enrollmentId: enr._id,
        registeredAt: enr.registeredAt,
        lastActivityAt: enr.lastActivityAt,
        lastViewedLessonId: enr.lastViewedLessonId,
        completedLessonIds: enr.completedLessonIds,
        completedLessonsCount: completedCount,
        totalLessonsCount: totalLessons,
        progressPercentage,
        course: {
          _id: course._id,
          title: course.title,
          shortDescription: course.shortDescription,
          category: course.category,
          level: course.level,
          coverPreset: course.coverPreset,
          status: course.status,
          instructor: course.instructor,
        },
      };
    }).filter(Boolean);

    // Identify Continue Learning course (the one with most recent activity or first registered)
    const continueLearning = coursesProgress.length > 0 ? coursesProgress[0] : null;

    // Upcoming assignments across enrolled courses
    const upcomingAssignments = await Assignment.find({
      course: { $in: enrolledCourseIds },
      status: 'published',
      deadline: { $gte: new Date() },
    })
      .populate('course', 'title')
      .sort({ deadline: 1 })
      .limit(6);

    // Attach student submission status to each upcoming assignment
    const upcomingWithStatus = await Promise.all(
      upcomingAssignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment: assignment._id,
          student: studentId,
        });
        return {
          ...assignment.toObject(),
          isSubmitted: !!submission && submission.status !== 'draft',
          marksAwarded: submission?.marksAwarded ?? null,
        };
      })
    );

    // Recent announcements across enrolled courses
    const announcements = await Announcement.find({
      course: { $in: enrolledCourseIds },
      status: 'published',
    })
      .populate('course', 'title')
      .populate('instructor', 'name avatarPreset')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recently returned grades (submissions with marksAwarded !== null)
    const recentGrades = await Submission.find({
      student: studentId,
      status: 'graded',
      marksAwarded: { $ne: null },
    })
      .populate('assignment', 'title maxMarks deadline')
      .populate('course', 'title')
      .sort({ gradedAt: -1 })
      .limit(5);

    return res.json({
      myLearning: coursesProgress,
      continueLearning,
      upcomingAssignments: upcomingWithStatus,
      announcements,
      recentGrades,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch student learning data.', details: err.message });
  }
});

/**
 * Get student enrollment for a specific course (For Lesson Player)
 */
router.get('/course/:courseId', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.session.userId;

    const enrollment = await Enrollment.findOne({ course: courseId, student: studentId });
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const course = await Course.findById(courseId).populate('instructor', 'name headline avatarPreset');
    const totalLessons = getTotalLessonsCount(course);
    const completedCount = enrollment.completedLessonIds ? enrollment.completedLessonIds.length : 0;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return res.json({
      enrollment,
      course,
      totalLessons,
      completedCount,
      progressPercentage,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load course player data.', details: err.message });
  }
});

/**
 * Record lesson view (resumes lesson on return, updates last activity timestamp)
 */
router.post('/course/:courseId/lesson-viewed', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body;
    const studentId = req.session.userId;

    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required.' });
    }

    const enrollment = await Enrollment.findOne({ course: courseId, student: studentId });
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    enrollment.lastViewedLessonId = lessonId;
    enrollment.lastActivityAt = new Date();
    await enrollment.save();

    return res.json({ message: 'Progress updated', enrollment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update lesson view.', details: err.message });
  }
});

/**
 * Mark a lesson complete
 * Uses $addToSet so marking same lesson twice never increases count
 */
router.post('/course/:courseId/lesson-complete', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body;
    const studentId = req.session.userId;

    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required.' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { course: courseId, student: studentId },
      {
        $addToSet: { completedLessonIds: lessonId },
        $set: {
          lastViewedLessonId: lessonId,
          lastActivityAt: new Date(),
        },
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const course = await Course.findById(courseId);
    const totalLessons = getTotalLessonsCount(course);
    const completedCount = enrollment.completedLessonIds ? enrollment.completedLessonIds.length : 0;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return res.json({
      message: 'Lesson marked as complete',
      enrollment,
      completedCount,
      totalLessons,
      progressPercentage,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark lesson complete.', details: err.message });
  }
});

/**
 * Instructor: Course Roster (Students Tab)
 * Lists students registered for the selected course with:
 * name, email, registration date, lessons completed out of total, progress percentage, last learning activity.
 * Displays "Not started" for newly registered students.
 * Search by name or email.
 */
router.get('/instructor/:courseId/roster', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { search } = req.query;

    const totalLessons = getTotalLessonsCount(course);

    let enrollments = await Enrollment.find({ course: course._id })
      .populate('student', 'name email avatarPreset createdAt')
      .sort({ registeredAt: -1 });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      enrollments = enrollments.filter((enr) => {
        const nameMatch = enr.student?.name?.toLowerCase().includes(q);
        const emailMatch = enr.student?.email?.toLowerCase().includes(q);
        return nameMatch || emailMatch;
      });
    }

    const roster = enrollments.map((enr) => {
      const completedCount = enr.completedLessonIds ? enr.completedLessonIds.length : 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return {
        enrollmentId: enr._id,
        student: {
          _id: enr.student?._id,
          name: enr.student?.name || 'Unknown Student',
          email: enr.student?.email || '',
          avatarPreset: enr.student?.avatarPreset || 'emerald-orb',
        },
        registeredAt: enr.registeredAt,
        lastActivityAt: enr.lastActivityAt,
        activityLabel: enr.lastActivityAt ? enr.lastActivityAt.toISOString() : 'Not started',
        completedLessonsCount: completedCount,
        totalLessonsCount: totalLessons,
        progressPercentage,
      };
    });

    return res.json({
      roster,
      totalCount: roster.length,
      totalLessons,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch course roster.', details: err.message });
  }
});

/**
 * Instructor: View single student's complete coursework & progress for this course
 * Returns: progress, assignment submissions, quiz attempts, and returned feedback
 */
router.get('/instructor/:courseId/student/:studentId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { studentId } = req.params;

    const enrollment = await Enrollment.findOne({ course: course._id, student: studentId })
      .populate('student', 'name email avatarPreset createdAt');

    if (!enrollment) {
      return res.status(404).json({ error: 'Student enrollment not found in this course.' });
    }

    const totalLessons = getTotalLessonsCount(course);
    const completedCount = enrollment.completedLessonIds ? enrollment.completedLessonIds.length : 0;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Student assignments for this course
    const assignments = await Assignment.find({ course: course._id, status: 'published' }).sort({ deadline: 1 });
    const assignmentResults = await Promise.all(
      assignments.map(async (asgn) => {
        const sub = await Submission.findOne({ assignment: asgn._id, student: studentId });
        return {
          assignmentId: asgn._id,
          title: asgn.title,
          maxMarks: asgn.maxMarks,
          deadline: asgn.deadline,
          hasSubmission: !!sub,
          status: sub ? sub.status : 'missing',
          marksAwarded: sub ? sub.marksAwarded : null,
          feedback: sub ? sub.feedback : '',
          submittedAt: sub ? sub.submittedAt : null,
          textResponse: sub ? sub.textResponse : '',
          projectUrl: sub ? sub.projectUrl : '',
        };
      })
    );

    // Student quiz attempts for this course
    const quizzes = await Quiz.find({ course: course._id, status: 'published' });
    const quizResults = await Promise.all(
      quizzes.map(async (qz) => {
        const attempt = await QuizAttempt.findOne({ quiz: qz._id, student: studentId });
        return {
          quizId: qz._id,
          title: qz.title,
          hasAttempt: !!attempt,
          marksEarned: attempt ? attempt.marksEarned : null,
          maxMarks: attempt ? attempt.maxMarks : null,
          percentage: attempt ? attempt.percentage : null,
          submittedAt: attempt ? attempt.submittedAt : null,
        };
      })
    );

    return res.json({
      student: enrollment.student,
      enrollment: {
        registeredAt: enrollment.registeredAt,
        lastActivityAt: enrollment.lastActivityAt,
        completedCount,
        totalLessons,
        progressPercentage,
      },
      assignments: assignmentResults,
      quizzes: quizResults,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load student progress details.', details: err.message });
  }
});

export default router;
