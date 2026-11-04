import mongoose from 'mongoose';

const resourceLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/i.test(v);
      },
      message: 'Resource link must be a valid HTTP or HTTPS URL',
    },
  },
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    default: '',
  },
  videoUrl: {
    type: String,
    default: '',
    trim: true,
  },
  resourceLinks: [resourceLinkSchema],
  order: {
    type: Number,
    default: 0,
  },
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
  },
  fullDescription: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'Computer Science',
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'Beginner',
  },
  language: {
    type: String,
    default: 'English',
  },
  coverPreset: {
    type: String,
    required: true,
    default: 'preset-cyber-grid',
  },
  learningObjectives: [{
    type: String,
    trim: true,
  }],
  prerequisites: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'archived'],
    default: 'draft',
    index: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  modules: [moduleSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

courseSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Course = mongoose.model('Course', courseSchema);
