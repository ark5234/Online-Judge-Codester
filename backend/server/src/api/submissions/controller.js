const Submission = require('../../models/Submission');
const Queue = require('../../queue');
const Problem = require('../../models/Problem');

exports.submit = async (req, res) => {
  const { problemId, code, language } = req.body;
  const submission = new Submission({
    user: req.user.id,
    problem: problemId,
    code,
    language,
    verdict: 'Pending'
  });
  await submission.save();
  // Add to queue for evaluation
  await Queue.add('evaluate', { submissionId: submission._id });
  res.status(201).json(submission);
};

exports.getUserSubmissions = async (req, res) => {
  const submissions = await Submission.find({ user: req.params.id });
  res.json(submissions);
};

exports.getProblemSubmissions = async (req, res) => {
  const submissions = await Submission.find({ problem: req.params.id });
  res.json(submissions);
}; 