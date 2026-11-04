import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  completedLessonIds: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  lastViewedLessonId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  lastActivityAt: {
    type: Date,
    default: null,
  },
});

// Unique compound index: A student can only enroll in a course once
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
