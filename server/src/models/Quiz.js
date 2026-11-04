import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    type: String,
    required: true,
    trim: true,
  }],
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    default: 10,
  },
});

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Quiz = mongoose.model('Quiz', quizSchema);
