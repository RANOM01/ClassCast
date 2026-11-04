import express from 'express';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { requireAuth, requireInstructor, requireCourseOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public: Browse published courses in the catalog
 * Supports search (by course title or instructor name) and category/level filtering
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, level } = req.query;
    const filter = { status: 'published' };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (level && level !== 'All') {
      filter.level = level;
    }

    let courses = await Course.find(filter)
      .populate('instructor', 'name headline avatarPreset email')
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      courses = courses.filter((c) => {
        const titleMatch = c.title?.toLowerCase().includes(q);
        const descMatch = c.shortDescription?.toLowerCase().includes(q);
        const instructorMatch = c.instructor?.name?.toLowerCase().includes(q);
        return titleMatch || descMatch || instructorMatch;
      });
    }

    // Attach module count, lesson count, and student count to each course
    const results = await Promise.all(
      courses.map(async (course) => {
        const studentCount = await Enrollment.countDocuments({ course: course._id });
        let lessonCount = 0;
        const moduleCount = course.modules?.length || 0;
        if (course.modules) {
          course.modules.forEach((m) => {
            lessonCount += m.lessons?.length || 0;
          });
        }

        return {
          _id: course._id,
          title: course.title,
          shortDescription: course.shortDescription,
          category: course.category,
          level: course.level,
          language: course.language,
          coverPreset: course.coverPreset,
          instructor: course.instructor,
          status: course.status,
          moduleCount,
          lessonCount,
          studentCount,
          createdAt: course.createdAt,
        };
      })
    );

    return res.json({ courses: results });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch catalog courses.', details: err.message });
  }
});

/**
 * Instructor Dashboard: Overall summary metrics, owned courses, recent registrations, pending grading
 */
router.get('/instructor-stats', requireInstructor, async (req, res) => {
  try {
    const instructorId = req.session.userId;
    const ownedCourses = await Course.find({ instructor: instructorId }).sort({ createdAt: -1 });
    const courseIds = ownedCourses.map((c) => c._id);

    // Total active registrations across instructor's courses
    const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });

    // Recent registrations (latest 8)
    const recentRegistrations = await Enrollment.find({ course: { $in: courseIds } })
      .populate('student', 'name email avatarPreset')
      .populate('course', 'title')
      .sort({ registeredAt: -1 })
      .limit(8);

    // Assignments waiting for grading
    const pendingSubmissions = await Submission.find({
      course: { $in: courseIds },
      status: 'submitted',
      marksAwarded: null, // strictly null means ungraded
    })
      .populate('assignment', 'title maxMarks deadline')
      .populate('student', 'name email avatarPreset')
      .populate('course', 'title')
      .sort({ submittedAt: -1 });

    return res.json({
      totalCourses: ownedCourses.length,
      totalEnrollments,
      pendingGradingCount: pendingSubmissions.length,
      recentRegistrations,
      pendingSubmissions,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load instructor stats.', details: err.message });
  }
});

/**
 * Instructor: Get all courses owned by current instructor with counts
 */
router.get('/instructor/owned', requireInstructor, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.session.userId }).sort({ createdAt: -1 });

    const coursesWithMeta = await Promise.all(
      courses.map(async (course) => {
        const studentCount = await Enrollment.countDocuments({ course: course._id });
        let lessonCount = 0;
        course.modules?.forEach((m) => {
          lessonCount += m.lessons?.length || 0;
        });

        const pendingGrading = await Submission.countDocuments({
          course: course._id,
          status: 'submitted',
          marksAwarded: null,
        });

        return {
          ...course.toObject(),
          studentCount,
          lessonCount,
          pendingGrading,
        };
      })
    );

    return res.json({ courses: coursesWithMeta });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch owned courses.', details: err.message });
  }
});

/**
 * Instructor: Create a new course
 */
router.post('/', requireInstructor, async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      fullDescription,
      category,
      level,
      language,
      coverPreset,
      learningObjectives,
      prerequisites,
    } = req.body;

    if (!title || !shortDescription) {
      return res.status(400).json({ error: 'Title and short description are required.' });
    }

    const course = new Course({
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription || shortDescription,
      category: category || 'Computer Science',
      level: level || 'Beginner',
      language: language || 'English',
      coverPreset: coverPreset || 'preset-cyber-grid',
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives.filter(Boolean) : [],
      prerequisites: Array.isArray(prerequisites) ? prerequisites.filter(Boolean) : [],
      instructor: req.session.userId,
      status: 'draft',
      modules: [
        {
          title: 'Module 1: Foundations',
          order: 0,
          lessons: [
            {
              title: 'Introduction & Architecture Overview',
              text: 'Welcome to this course. In this lesson, we will explore core architectural patterns and foundations.',
              videoUrl: '',
              resourceLinks: [],
              order: 0,
            },
          ],
        },
      ],
    });

    await course.save();
    return res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create course.', details: err.message });
  }
});

/**
 * Public or Student: Get Course Details (with syllabus preview)
 */
router.get('/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('instructor', 'name headline avatarPreset email');
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Check if user is logged in and if enrolled
    let isEnrolled = false;
    let enrollment = null;
    let isOwner = false;

    if (req.session && req.session.userId) {
      if (course.instructor._id.toString() === req.session.userId) {
        isOwner = true;
      }
      enrollment = await Enrollment.findOne({
        course: course._id,
        student: req.session.userId,
      });
      isEnrolled = !!enrollment;
    }

    // If draft, only the instructor who owns it can view it
    if (course.status === 'draft' && !isOwner) {
      return res.status(403).json({ error: 'This course draft is only accessible by its instructor.' });
    }

    const studentCount = await Enrollment.countDocuments({ course: course._id });

    // Build syllabus outline (if not enrolled, omit private lesson texts)
    const modulesOutline = course.modules.map((m) => ({
      _id: m._id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => ({
        _id: l._id,
        title: l.title,
        order: l.order,
        hasVideo: !!l.videoUrl,
        resourceCount: l.resourceLinks?.length || 0,
        // Only include full text if enrolled or owner
        text: (isEnrolled || isOwner) ? l.text : undefined,
        videoUrl: (isEnrolled || isOwner) ? l.videoUrl : undefined,
        resourceLinks: (isEnrolled || isOwner) ? l.resourceLinks : undefined,
      })),
    }));

    return res.json({
      course: {
        _id: course._id,
        title: course.title,
        shortDescription: course.shortDescription,
        fullDescription: course.fullDescription,
        category: course.category,
        level: course.level,
        language: course.language,
        coverPreset: course.coverPreset,
        learningObjectives: course.learningObjectives,
        prerequisites: course.prerequisites,
        status: course.status,
        instructor: course.instructor,
        modules: modulesOutline,
        studentCount,
        createdAt: course.createdAt,
      },
      isEnrolled,
      isOwner,
      enrollment: isEnrolled ? enrollment : null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve course.', details: err.message });
  }
});

/**
 * Instructor: Get complete course workspace data
 */
router.get('/instructor/workspace/:courseId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const studentCount = await Enrollment.countDocuments({ course: course._id });
    const assignmentCount = await Assignment.countDocuments({ course: course._id });

    return res.json({
      course,
      studentCount,
      assignmentCount,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve course workspace.', details: err.message });
  }
});

/**
 * Instructor: Update course details
 */
router.put('/instructor/:courseId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const {
      title,
      shortDescription,
      fullDescription,
      category,
      level,
      language,
      coverPreset,
      learningObjectives,
      prerequisites,
    } = req.body;

    if (title) course.title = title.trim();
    if (shortDescription) course.shortDescription = shortDescription.trim();
    if (fullDescription) course.fullDescription = fullDescription;
    if (category) course.category = category;
    if (level) course.level = level;
    if (language) course.language = language;
    if (coverPreset) course.coverPreset = coverPreset;
    if (Array.isArray(learningObjectives)) course.learningObjectives = learningObjectives.filter(Boolean);
    if (Array.isArray(prerequisites)) course.prerequisites = prerequisites.filter(Boolean);

    await course.save();
    return res.json({ message: 'Course updated successfully', course });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update course.', details: err.message });
  }
});

/**
 * Instructor: Change course lifecycle status
 * Draft -> Published -> Closed -> Archived
 * Enforces requirement: "Require at least a title, description, and one module containing a readable lesson before publication."
 */
router.patch('/instructor/:courseId/status', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { status } = req.body;

    if (!['draft', 'published', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    if (status === 'published') {
      if (!course.title || !course.shortDescription) {
        return res.status(400).json({ error: 'Course title and description are required before publishing.' });
      }

      const hasValidModule = course.modules && course.modules.length > 0;
      let hasReadableLesson = false;

      if (hasValidModule) {
        for (const mod of course.modules) {
          if (mod.lessons && mod.lessons.length > 0) {
            for (const les of mod.lessons) {
              if (les.title && les.text && les.text.trim().length > 0) {
                hasReadableLesson = true;
                break;
              }
            }
          }
          if (hasReadableLesson) break;
        }
      }

      if (!hasReadableLesson) {
        return res.status(400).json({
          error: 'Publication requirements not met: At least one module containing a readable lesson with content is required.',
        });
      }
    }

    course.status = status;
    await course.save();

    return res.json({ message: `Course status changed to ${status}`, course });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to change course status.', details: err.message });
  }
});

/**
 * Instructor: Delete empty draft course
 * "Allow deletion of an empty draft after confirmation. Preserve learning records once students have joined."
 */
router.delete('/instructor/:courseId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;

    // Check if students have enrolled
    const studentCount = await Enrollment.countDocuments({ course: course._id });
    if (studentCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete course: Learning records exist for enrolled students. You may archive the course instead.',
      });
    }

    // Only allow deletion if in draft state or if 0 students
    await Course.findByIdAndDelete(course._id);
    return res.json({ message: 'Course draft successfully deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete course draft.', details: err.message });
  }
});

export default router;
