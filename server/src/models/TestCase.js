const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: false }
});

module.exports = mongoose.model('TestCase', TestCaseSchema); 