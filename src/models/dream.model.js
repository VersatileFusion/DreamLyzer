const mongoose = require('mongoose');

const dreamSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Dream title is required'],
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: [true, 'Dream content is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: {
    type: [String],
    default: []
  },
  // Analysis results
  keywords: {
    type: [String],
    default: []
  },
  emotions: {
    type: Object,
    default: {
      primary: '',
      score: 0,
      breakdown: {}
    }
  },
  symbols: {
    type: [Object],
    default: []
  },
  // User custom notes
  notes: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for searching
dreamSchema.index({ content: 'text', title: 'text', tags: 'text' });

const Dream = mongoose.model('Dream', dreamSchema);

module.exports = Dream; 