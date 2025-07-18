const Submission = require('../../models/Submission');
const Problem = require('../../models/Problem');
const { submissionQueue } = require('../../queue');

exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) return res.status(400).json({ message: 'All fields required' });
    const problem = await Problem.findById(problemId).populate('testCases');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      verdict: 'Pending',
    });
    // Enqueue job for code evaluation
    await submissionQueue.add('evaluate', {
      submissionId: submission._id,
      code,
      language,
      testCases: problem.testCases,
      userId: req.user._id,
      problemId,
    });
    res.status(201).json({ message: 'Submission received', submissionId: submission._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit solution', error: err.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const submissions = await Submission.find({ user: userId }).populate('problem').sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch submissions', error: err.message });
  }
}; 