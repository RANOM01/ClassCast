import mongoose from 'mongoose';

const answerSelectionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOptionIndex: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  pointsEarned: {
    type: Number,
    required: true,
  },
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [answerSelectionSchema],
  marksEarned: {
    type: Number,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Exactly one final attempt per student per quiz
quizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
