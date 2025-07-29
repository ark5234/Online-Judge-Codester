const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  stats: {
    problemsSolved: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'javascript'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance (removed duplicate email index)
userSchema.index({ 'stats.problemsSolved': -1 });

// Virtual for user's rank
userSchema.virtual('rank').get(function() {
  // This would be calculated based on problems solved
  return this.stats.problemsSolved;
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to update stats
userSchema.methods.updateStats = function(submissionResult) {
  this.stats.totalSubmissions += 1;
  
  if (submissionResult.status === 'Accepted') {
    this.stats.problemsSolved += 1;
  }
  
  // Calculate accuracy
  const accuracy = (this.stats.problemsSolved / this.stats.totalSubmissions) * 100;
  this.stats.accuracy = Math.round(accuracy * 100) / 100;
  
  return this.save();
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastLogin = this.lastLogin;
  
  // If last login was yesterday, increment streak
  const oneDay = 24 * 60 * 60 * 1000;
  if (now - lastLogin <= oneDay) {
    this.stats.currentStreak += 1;
  } else {
    this.stats.currentStreak = 1;
  }
  
  this.lastLogin = now;
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 