import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';

export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireInstructor(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  if (req.session.role !== 'Instructor') {
    return res.status(403).json({ error: 'Access denied. Instructor role required.' });
  }
  next();
}

export function requireStudent(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  if (req.session.role !== 'Student') {
    return res.status(403).json({ error: 'Access denied. Student role required.' });
  }
  next();
}

/**
 * Middleware: Verify that the authenticated instructor owns the course specified by req.params.courseId
 * Strictly blocks one instructor from accessing or tampering with another instructor's course records.
 */
export async function requireCourseOwner(req, res, next) {
  const { courseId } = req.params;
  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required.' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (course.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this course.' });
    }

    req.course = course;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Error validating course ownership.', details: err.message });
  }
}

/**
 * Middleware: Verify that the authenticated student is enrolled in the course specified by req.params.courseId
 */
export async function requireCourseEnrolled(req, res, next) {
  const { courseId } = req.params;
  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required.' });
  }

  try {
    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.session.userId,
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Access denied. You must be enrolled in this course to access this content.' });
    }

    req.enrollment = enrollment;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Error validating enrollment.', details: err.message });
  }
}
