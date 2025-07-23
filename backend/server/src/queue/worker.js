const { Worker } = require('bullmq');
const Submission = require('../models/Submission');
const axios = require('axios');

const worker = new Worker('submissions', async job => {
  const { submissionId } = job.data;
  const submission = await Submission.findById(submissionId).populate('problem');
  // Send to Python evaluator
  const response = await axios.post('http://compiler:8000/evaluate', {
    code: submission.code,
    language: submission.language,
    input: submission.problem.testCases[0].input // Simplified: use all test cases in real impl
  });
  submission.verdict = response.data.verdict;
  submission.stdout = response.data.stdout;
  submission.stderr = response.data.stderr;
  await submission.save();
});

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
}); 