const { Worker } = require('bullmq');
const Redis = require('ioredis');
const axios = require('axios');
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
require('dotenv').config();

const connection = new Redis(process.env.REDIS_URL);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const worker = new Worker('submissions', async job => {
  const { submissionId, code, language, testCases, userId, problemId } = job.data;
  try {
    // Call Python evaluator microservice
    const response = await axios.post(process.env.EVALUATOR_URL || 'http://localhost:8000/evaluate', {
      code,
      language,
      testCases,
      submissionId,
      userId,
      problemId
    });
    const { verdict, stdout, stderr } = response.data;
    // Update submission in MongoDB
    await Submission.findByIdAndUpdate(submissionId, {
      verdict,
      stdout,
      stderr
    });
  } catch (err) {
    await Submission.findByIdAndUpdate(submissionId, {
      verdict: 'RE',
      stderr: err.message
    });
  }
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
}); 