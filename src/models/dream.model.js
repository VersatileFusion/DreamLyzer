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
  // New field for categorizing dreams
  category: {
    type: String,
    enum: ['lucid', 'nightmare', 'recurring', 'prophetic', 'healing', 'adventure', 'fantasy', 'uncategorized'],
    default: 'uncategorized'
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
  },
  // New field for saving sharing information
  sharing: {
    isShared: {
      type: Boolean,
      default: false
    },
    sharedAt: {
      type: Date,
      default: null
    },
    viewCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create index for searching
dreamSchema.index({ content: 'text', title: 'text', tags: 'text' });

// Method to generate a shareable link
dreamSchema.methods.generateShareableLink = function(baseUrl) {
  return `${baseUrl}/api/dreams/shared/${this._id}`;
};

// Pre-save hook to set sharing.isShared based on isPrivate
dreamSchema.pre('save', function(next) {
  if (this.isModified('isPrivate') && this.isPrivate === false) {
    this.sharing.isShared = true;
    this.sharing.sharedAt = new Date();
  }
  next();
});

const Dream = mongoose.model('Dream', dreamSchema);

module.exports = Dream; 