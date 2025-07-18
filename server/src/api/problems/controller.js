const Problem = require('../../models/Problem');
const TestCase = require('../../models/TestCase');

exports.getProblems = async (req, res) => {
  try {
    const { tag, difficulty } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (difficulty) filter.difficulty = difficulty;
    const problems = await Problem.find(filter).select('-testCases');
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch problems', error: err.message });
  }
};

exports.getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate('testCases');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch problem', error: err.message });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, tags, testCases } = req.body;
    const createdTestCases = await TestCase.insertMany(testCases || []);
    const problem = await Problem.create({
      title, description, difficulty, tags, testCases: createdTestCases.map(tc => tc._id)
    });
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create problem', error: err.message });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const { title, description, difficulty, tags, testCases } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    if (testCases) {
      // Remove old test cases
      await TestCase.deleteMany({ _id: { $in: problem.testCases } });
      const createdTestCases = await TestCase.insertMany(testCases);
      problem.testCases = createdTestCases.map(tc => tc._id);
    }
    if (title) problem.title = title;
    if (description) problem.description = description;
    if (difficulty) problem.difficulty = difficulty;
    if (tags) problem.tags = tags;
    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update problem', error: err.message });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    await TestCase.deleteMany({ _id: { $in: problem.testCases } });
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete problem', error: err.message });
  }
}; 