const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  code: String,
  language: String,
  verdict: { type: String, enum: ['AC', 'WA', 'CE', 'TLE', 'RE', 'Pending'], default: 'Pending' },
  stdout: String,
  stderr: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema); 