const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
    default: 'pending'
  },
  executionTime: {
    type: Number,
    default: 0
  },
  memoryUsed: {
    type: Number,
    default: 0
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  evaluatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
submissionSchema.index({ user: 1, submittedAt: -1 });
submissionSchema.index({ problem: 1, status: 1 });
submissionSchema.index({ status: 1, submittedAt: -1 });

// Virtual for submission result
submissionSchema.virtual('isAccepted').get(function() {
  return this.status === 'accepted';
});

// Method to update submission status
submissionSchema.methods.updateStatus = function(newStatus, executionTime = 0, memoryUsed = 0, testCasesPassed = 0, totalTestCases = 0, errorMessage = '') {
  this.status = newStatus;
  this.executionTime = executionTime;
  this.memoryUsed = memoryUsed;
  this.testCasesPassed = testCasesPassed;
  this.totalTestCases = totalTestCases;
  this.errorMessage = errorMessage;
  this.evaluatedAt = new Date();
  return this.save();
};

// Static method to get user's submission stats
submissionSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        acceptedSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
        averageExecutionTime: { $avg: '$executionTime' },
        averageMemoryUsed: { $avg: '$memoryUsed' }
      }
    }
  ]);
};

// Static method to get problem submission stats
submissionSchema.statics.getProblemStats = function(problemId) {
  return this.aggregate([
    { $match: { problem: mongoose.Types.ObjectId(problemId) } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        acceptedSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
        averageExecutionTime: { $avg: '$executionTime' },
        averageMemoryUsed: { $avg: '$memoryUsed' }
      }
    }
  ]);
};

module.exports = mongoose.model('Submission', submissionSchema); 