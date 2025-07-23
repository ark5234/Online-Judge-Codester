const Problem = require('../../models/Problem');
const TestCase = require('../../models/TestCase');

exports.listProblems = async (req, res) => {
  const { tags, difficulty } = req.query;
  const filter = {};
  if (tags) filter.tags = { $in: tags.split(',') };
  if (difficulty) filter.difficulty = difficulty;
  const problems = await Problem.find(filter);
  res.json(problems);
};

exports.getProblem = async (req, res) => {
  const problem = await Problem.findById(req.params.id).populate('testCases');
  res.json(problem);
};

exports.createProblem = async (req, res) => {
  const problem = new Problem(req.body);
  await problem.save();
  res.status(201).json(problem);
};

exports.updateProblem = async (req, res) => {
  const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(problem);
};

exports.deleteProblem = async (req, res) => {
  await Problem.findByIdAndDelete(req.params.id);
  res.status(204).end();
}; 