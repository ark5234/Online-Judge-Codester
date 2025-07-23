const mongoose = require('mongoose');
const ProblemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  tags: [String],
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' }]
});
module.exports = mongoose.model('Problem', ProblemSchema); 