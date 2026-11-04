import express from 'express';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { requireAuth, requireInstructor, requireStudent, requireCourseOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get assignments for a course
 * Enrolled students see their own submission status
 * Instructor sees overview
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
      // Students only see published assignments
      filter.status = 'published';
      // Verify enrollment
      const isEnrolled = await Enrollment.findOne({ course: courseId, student: userId });
      if (!isEnrolled) {
        return res.status(403).json({ error: 'You must be enrolled in this course to view assignments.' });
      }
    }

    const assignments = await Assignment.find(filter).sort({ deadline: 1 });

    const results = await Promise.all(
      assignments.map(async (asgn) => {
        const item = asgn.toObject();

        if (req.session.role === 'Student') {
          const submission = await Submission.findOne({
            assignment: asgn._id,
            student: userId,
          });
          item.mySubmission = submission ? {
            _id: submission._id,
            status: submission.status,
            textResponse: submission.textResponse,
            projectUrl: submission.projectUrl,
            marksAwarded: submission.marksAwarded,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt,
            gradedAt: submission.gradedAt,
          } : null;
        } else if (isInstructor && course.instructor.toString() === userId) {
          const submissionCount = await Submission.countDocuments({
            assignment: asgn._id,
            status: { $in: ['submitted', 'graded'] },
          });
          const gradedCount = await Submission.countDocuments({
            assignment: asgn._id,
            status: 'graded',
            marksAwarded: { $ne: null },
          });
          item.submissionCount = submissionCount;
          item.gradedCount = gradedCount;
          item.pendingCount = submissionCount - gradedCount;
        }

        return item;
      })
    );

    return res.json({ assignments: results });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch assignments.', details: err.message });
  }
});

/**
 * Instructor: Create assignment
 */
router.post('/course/:courseId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { title, instructions, maxMarks, deadline, timezone, status } = req.body;

    if (!title || !instructions || !deadline) {
      return res.status(400).json({ error: 'Title, instructions, and deadline are required.' });
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ error: 'Invalid deadline date format.' });
    }

    const marks = Number(maxMarks) || 100;
    if (marks <= 0) {
      return res.status(400).json({ error: 'Maximum marks must be greater than zero.' });
    }

    const assignment = new Assignment({
      course: course._id,
      instructor: req.session.userId,
      title: title.trim(),
      instructions: instructions.trim(),
      maxMarks: marks,
      deadline: parsedDeadline,
      timezone: timezone || 'UTC',
      status: status === 'draft' ? 'draft' : 'published',
    });

    await assignment.save();
    return res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create assignment.', details: err.message });
  }
});

/**
 * Instructor: Update assignment
 */
router.put('/:assignmentId', requireInstructor, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (assignment.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this assignment.' });
    }

    const { title, instructions, maxMarks, deadline, timezone, status } = req.body;
    if (title) assignment.title = title.trim();
    if (instructions) assignment.instructions = instructions.trim();
    if (maxMarks) assignment.maxMarks = Math.max(1, Number(maxMarks));
    if (deadline) assignment.deadline = new Date(deadline);
    if (timezone) assignment.timezone = timezone;
    if (status) assignment.status = status;

    await assignment.save();
    return res.json({ message: 'Assignment updated successfully', assignment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update assignment.', details: err.message });
  }
});

/**
 * Student: Submit or revise assignment
 * Server validates deadline. Allows revisions before deadline while ungraded.
 * Preserves last submission if an update fails.
 */
router.post('/:assignmentId/submit', requireStudent, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.session.userId;
    const { textResponse, projectUrl, isDraft } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // Verify enrollment
    const isEnrolled = await Enrollment.findOne({ course: assignment.course, student: studentId });
    if (!isEnrolled) {
      return res.status(403).json({ error: 'You are not enrolled in this course.' });
    }

    // Server-side deadline check for final submissions
    const now = new Date();
    if (!isDraft && now > assignment.deadline) {
      return res.status(400).json({
        error: `Submission rejected: The deadline (${assignment.deadline.toLocaleString()}) has passed.`,
      });
    }

    // Check existing submission
    let submission = await Submission.findOne({ assignment: assignmentId, student: studentId });

    if (submission && submission.status === 'graded') {
      return res.status(400).json({
        error: 'This assignment has already been evaluated and graded by the instructor. Revisions are no longer accepted.',
      });
    }

    if (!submission) {
      submission = new Submission({
        assignment: assignmentId,
        course: assignment.course,
        student: studentId,
        textResponse: textResponse || '',
        projectUrl: projectUrl ? projectUrl.trim() : '',
        status: isDraft ? 'draft' : 'submitted',
        submittedAt: isDraft ? null : new Date(),
        marksAwarded: null,
        feedback: '',
      });
    } else {
      // Updating submission
      submission.textResponse = textResponse !== undefined ? textResponse : submission.textResponse;
      submission.projectUrl = projectUrl !== undefined ? projectUrl.trim() : submission.projectUrl;
      if (!isDraft) {
        submission.status = 'submitted';
        submission.submittedAt = new Date();
      }
    }

    await submission.save();

    // Update student's lastActivityAt in enrollment
    await Enrollment.findOneAndUpdate(
      { course: assignment.course, student: studentId },
      { $set: { lastActivityAt: new Date() } }
    );

    return res.json({
      message: isDraft ? 'Draft saved successfully' : 'Assignment submitted successfully!',
      submissionReceipt: {
        receiptId: submission._id,
        assignmentTitle: assignment.title,
        status: submission.status,
        submittedAt: submission.submittedAt,
        maxMarks: assignment.maxMarks,
        textResponse: submission.textResponse,
        projectUrl: submission.projectUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process submission.', details: err.message });
  }
});

/**
 * Instructor: View all submissions for an assignment
 */
router.get('/:assignmentId/submissions', requireInstructor, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (assignment.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this assignment.' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email avatarPreset')
      .sort({ submittedAt: -1 });

    return res.json({
      assignment,
      submissions,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch submissions.', details: err.message });
  }
});

/**
 * Instructor: Review and grade submission
 * Awards marks from zero to maxMarks, writes feedback, returns grade
 */
router.post('/submissions/:submissionId/grade', requireInstructor, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marksAwarded, feedback } = req.body;

    const submission = await Submission.findById(submissionId).populate('assignment');
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const assignment = submission.assignment;
    if (assignment.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this assignment.' });
    }

    const numericMarks = Number(marksAwarded);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > assignment.maxMarks) {
      return res.status(400).json({
        error: `Marks awarded must be a valid number between 0 and the maximum of ${assignment.maxMarks}.`,
      });
    }

    submission.marksAwarded = numericMarks;
    submission.feedback = feedback ? feedback.trim() : '';
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await submission.save();

    return res.json({
      message: 'Grade and feedback returned successfully.',
      submission,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record grade.', details: err.message });
  }
});

export default router;
