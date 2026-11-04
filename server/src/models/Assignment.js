import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
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
  instructions: {
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1,
    default: 100,
  },
  deadline: {
    type: Date,
    required: true,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
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

export const Assignment = mongoose.model('Assignment', assignmentSchema);
