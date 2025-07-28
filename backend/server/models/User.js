const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
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

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'stats.problemsSolved': -1 });

// Virtual for user's rank
userSchema.virtual('rank').get(function() {
  // This would be calculated based on problems solved
  return this.stats.problemsSolved;
});

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