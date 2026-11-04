import express from 'express';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { requireInstructor, requireCourseOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Add a new module to a course
 */
router.post('/:courseId/modules', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Module title is required.' });
    }

    const order = course.modules.length;
    course.modules.push({
      title: title.trim(),
      order,
      lessons: [],
    });

    await course.save();
    return res.status(201).json({ message: 'Module added', modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add module.', details: err.message });
  }
});

/**
 * Rename or update module
 */
router.patch('/:courseId/modules/:moduleId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { moduleId } = req.params;
    const { title } = req.body;

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    if (title && title.trim()) {
      mod.title = title.trim();
    }

    await course.save();
    return res.json({ message: 'Module updated', module: mod, modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update module.', details: err.message });
  }
});

/**
 * Reorder modules (e.g. Move Up / Move Down)
 */
router.post('/:courseId/modules/reorder', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { moduleIds } = req.body; // Array of module IDs in new order

    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({ error: 'moduleIds array is required.' });
    }

    const newModules = [];
    moduleIds.forEach((id, index) => {
      const mod = course.modules.id(id);
      if (mod) {
        mod.order = index;
        newModules.push(mod);
      }
    });

    // Append any modules not specified
    course.modules.forEach((mod) => {
      if (!moduleIds.includes(mod._id.toString())) {
        mod.order = newModules.length;
        newModules.push(mod);
      }
    });

    course.modules = newModules;
    await course.save();

    return res.json({ message: 'Modules reordered', modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reorder modules.', details: err.message });
  }
});

/**
 * Delete module
 */
router.delete('/:courseId/modules/:moduleId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { moduleId } = req.params;

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    // Check if any lesson inside has student activity
    const lessonIds = mod.lessons.map((l) => l._id);
    if (lessonIds.length > 0) {
      const activeEnrollment = await Enrollment.findOne({
        course: course._id,
        $or: [
          { completedLessonIds: { $in: lessonIds } },
          { lastViewedLessonId: { $in: lessonIds } },
        ],
      });

      if (activeEnrollment) {
        return res.status(400).json({
          error: 'Cannot delete module: Students have already engaged with lessons inside this module.',
        });
      }
    }

    course.modules.pull(moduleId);
    // Recalculate order
    course.modules.forEach((m, idx) => {
      m.order = idx;
    });

    await course.save();
    return res.json({ message: 'Module deleted', modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete module.', details: err.message });
  }
});

/**
 * Add a lesson to a module
 */
router.post('/:courseId/modules/:moduleId/lessons', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { moduleId } = req.params;
    const { title, text, videoUrl, resourceLinks } = req.body;

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Lesson title is required.' });
    }

    // Validate resource links if any
    const validLinks = [];
    if (Array.isArray(resourceLinks)) {
      for (const link of resourceLinks) {
        if (link.title && link.url) {
          if (!/^https?:\/\/.+/i.test(link.url.trim())) {
            return res.status(400).json({ error: `Invalid URL format for resource '${link.title}'. Must start with http:// or https://` });
          }
          validLinks.push({
            title: link.title.trim(),
            url: link.url.trim(),
          });
        }
      }
    }

    const order = mod.lessons.length;
    mod.lessons.push({
      title: title.trim(),
      text: text || '',
      videoUrl: videoUrl ? videoUrl.trim() : '',
      resourceLinks: validLinks,
      order,
    });

    await course.save();
    return res.status(201).json({ message: 'Lesson added', modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add lesson.', details: err.message });
  }
});

/**
 * Edit a lesson
 */
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { moduleId, lessonId } = req.params;
    const { title, text, videoUrl, resourceLinks } = req.body;

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    const lesson = mod.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    if (title && title.trim()) lesson.title = title.trim();
    if (text !== undefined) lesson.text = text;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl.trim();

    if (Array.isArray(resourceLinks)) {
      const validLinks = [];
      for (const link of resourceLinks) {
        if (link.title && link.url) {
          if (!/^https?:\/\/.+/i.test(link.url.trim())) {
            return res.status(400).json({ error: `Invalid URL format for resource '${link.title}'. Must start with http:// or https://` });
          }
          validLinks.push({
            title: link.title.trim(),
            url: link.url.trim(),
          });
        }
      }
      lesson.resourceLinks = validLinks;
    }

    await course.save();
    return res.json({ message: 'Lesson updated', lesson, modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update lesson.', details: err.message });
  }
});

/**
 * Reorder lessons inside a module (Move Up / Move Down)
 */
router.post('/:courseId/modules/:moduleId/lessons/reorder', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { moduleId } = req.params;
    const { lessonIds } = req.body;

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ error: 'lessonIds array is required.' });
    }

    const newLessons = [];
    lessonIds.forEach((id, index) => {
      const les = mod.lessons.id(id);
      if (les) {
        les.order = index;
        newLessons.push(les);
      }
    });

    mod.lessons.forEach((les) => {
      if (!lessonIds.includes(les._id.toString())) {
        les.order = newLessons.length;
        newLessons.push(les);
      }
    });

    mod.lessons = newLessons;
    await course.save();

    return res.json({ message: 'Lessons reordered', modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reorder lessons.', details: err.message });
  }
});

/**
 * Delete a lesson
 * "Protect lessons that already have student activity from destructive deletion."
 */
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', requireInstructor, requireCourseOwner, async (req, res) => {
  try {
    const course = req.course;
    const { moduleId, lessonId } = req.params;

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    const lesson = mod.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    // Check if any student has completed or viewed this lesson
    const hasActivity = await Enrollment.findOne({
      course: course._id,
      $or: [
        { completedLessonIds: lesson._id },
        { lastViewedLessonId: lesson._id },
      ],
    });

    if (hasActivity) {
      return res.status(400).json({
        error: 'Cannot delete lesson: Enrolled students have already engaged with or completed this lesson. You may edit its content instead.',
      });
    }

    mod.lessons.pull(lessonId);
    mod.lessons.forEach((l, idx) => {
      l.order = idx;
    });

    await course.save();
    return res.json({ message: 'Lesson deleted', modules: course.modules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete lesson.', details: err.message });
  }
});

export default router;
