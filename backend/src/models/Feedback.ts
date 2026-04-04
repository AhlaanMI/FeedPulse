import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  category: {
    type: String,
    enum: ['Bug', 'Feature Request', 'Improvement', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['New', 'In Review', 'Resolved'],
    default: 'New'
  },
  submitterName: {
    type: String,
    default: null
  },
  submitterEmail: {
    type: String,
    default: null,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // email is optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  // AI fields
  ai_category: {
    type: String,
    default: null
  },
  ai_sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative', null],
    default: null
  },
  ai_priority: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  ai_summary: {
    type: String,
    default: null
  },
  ai_tags: {
    type: [String],
    default: []
  },
  ai_processed: {
    type: Boolean,
    default: false
  },
  submitterIp: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  indexes: [
    { fields: { status: 1 } },
    { fields: { category: 1 } },
    { fields: { ai_priority: 1 } },
    { fields: { createdAt: 1 } }
  ]
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
