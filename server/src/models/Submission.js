import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
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
  textResponse: {
    type: String,
    default: '',
  },
  projectUrl: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/i.test(v);
      },
      message: 'Project link must be a valid HTTP or HTTPS URL',
    },
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded'],
    default: 'submitted',
  },
  marksAwarded: {
    type: Number,
    default: null, // Note: null means ungraded; 0 is a graded zero
  },
  feedback: {
    type: String,
    default: '',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: {
    type: Date,
    default: null,
  },
});

// A student has at most one submission document per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
