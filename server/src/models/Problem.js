const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags: [String],
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' }],
}, { timestamps: true });

module.exports = mongoose.model('Problem', ProblemSchema); 