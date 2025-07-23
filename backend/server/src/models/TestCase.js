const mongoose = require('mongoose');
const TestCaseSchema = new mongoose.Schema({
  input: String,
  output: String,
  isSample: { type: Boolean, default: false }
});
module.exports = mongoose.model('TestCase', TestCaseSchema); 