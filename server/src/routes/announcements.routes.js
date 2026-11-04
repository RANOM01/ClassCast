import express from 'express';
import { Announcement } from '../models/Announcement.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { requireAuth, requireInstructor, requireCourseOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get announcements for a course
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
        return res.status(403).json({ error: 'You must be enrolled in this course to view announcements.' });
      }
    }

    const announcements = await Announcement.find(filter)
      .populate('instructor', 'name avatarPreset')
      .sort({ createdAt: -1 });

    return res.json({ announcements });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch announcements.', details: err.message });
  }
});

/**
 * Instructor: Create course announcement
 */
router.post('/course/:courseId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { title, content, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Announcement title and content are required.' });
    }

    const announcement = new Announcement({
      course: course._id,
      instructor: req.session.userId,
      title: title.trim(),
      content: content.trim(),
      status: status === 'draft' ? 'draft' : 'published',
    });

    await announcement.save();
    return res.status(201).json({ message: 'Announcement created successfully', announcement });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create announcement.', details: err.message });
  }
});

/**
 * Instructor: Update announcement
 */
router.put('/:announcementId', requireInstructor, async (req, res) => {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    if (announcement.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this announcement.' });
    }

    const { title, content, status } = req.body;
    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (status) announcement.status = status;

    await announcement.save();
    return res.json({ message: 'Announcement updated successfully', announcement });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update announcement.', details: err.message });
  }
});

/**
 * Instructor: Delete announcement
 */
router.delete('/:announcementId', requireInstructor, async (req, res) => {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    if (announcement.instructor.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this announcement.' });
    }

    await Announcement.findByIdAndDelete(announcementId);
    return res.json({ message: 'Announcement deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete announcement.', details: err.message });
  }
});

export default router;
