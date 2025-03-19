const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // New profile fields
  profile: {
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  // User preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    defaultDreamPrivacy: {
      type: Boolean,
      default: true
    },
    dreamReminders: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'none'],
        default: 'none'
      },
      time: {
        type: String,
        default: '08:00'
      }
    },
    preferredDreamCategories: {
      type: [String],
      default: []
    }
  },
  // Stats about user's dream journal
  stats: {
    totalDreams: {
      type: Number,
      default: 0
    },
    lastDreamDate: {
      type: Date,
      default: null
    },
    dreamStreak: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update dream stats
userSchema.methods.updateDreamStats = async function(isNewDream = true, dreamDate = new Date()) {
  // Update total dreams count
  if (isNewDream) {
    this.stats.totalDreams += 1;
  }
  
  // Update last dream date
  if (!this.stats.lastDreamDate || dreamDate > this.stats.lastDreamDate) {
    this.stats.lastDreamDate = dreamDate;
    
    // Calculate streak - if the dream is from yesterday or today, increment streak
    const lastDreamDay = this.stats.lastDreamDate ? new Date(this.stats.lastDreamDate) : null;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (
      lastDreamDay && 
      (lastDreamDay.toDateString() === today.toDateString() || 
       lastDreamDay.toDateString() === yesterday.toDateString())
    ) {
      this.stats.dreamStreak += 1;
    } else {
      // Reset streak if not consecutive
      this.stats.dreamStreak = 1;
    }
  }
  
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 