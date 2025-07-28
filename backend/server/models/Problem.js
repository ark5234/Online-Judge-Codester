const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  constraints: [{
    type: String
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [testCaseSchema],
  timeLimit: {
    type: Number,
    default: 1000, // milliseconds
    min: 100,
    max: 10000
  },
  memoryLimit: {
    type: Number,
    default: 256, // MB
    min: 16,
    max: 1024
  },
  acceptanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  solution: {
    type: String,
    default: ''
  },
  hints: [{
    type: String
  }],
  relatedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance (removed duplicate title index)
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ isActive: 1 });

// Method to update acceptance rate
problemSchema.methods.updateAcceptanceRate = function() {
  if (this.totalSubmissions > 0) {
    const newAcceptanceRate = Math.round((this.successfulSubmissions / this.totalSubmissions) * 100);
    
    // Use findOneAndUpdate to avoid parallel save conflicts
    return this.constructor.findOneAndUpdate(
      { _id: this._id },
      { acceptanceRate: newAcceptanceRate },
      { new: true }
    );
  }
  return Promise.resolve(this);
};

// Method to add submission result
problemSchema.methods.addSubmission = function(isSuccessful) {
  this.totalSubmissions += 1;
  if (isSuccessful) {
    this.successfulSubmissions += 1;
  }
  
  // Use findOneAndUpdate to avoid parallel save conflicts
  return this.constructor.findOneAndUpdate(
    { _id: this._id },
    {
      $inc: { 
        totalSubmissions: 1,
        ...(isSuccessful && { successfulSubmissions: 1 })
      }
    },
    { new: true }
  ).then(updatedProblem => {
    if (updatedProblem) {
      return updatedProblem.updateAcceptanceRate();
    }
    return this;
  });
};

// Static method to get problems by difficulty
problemSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true }).sort({ createdAt: -1 });
};

// Static method to search problems
problemSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Problem', problemSchema); 