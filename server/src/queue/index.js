const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL);

const submissionQueue = new Queue('submissions', { connection });

module.exports = { submissionQueue }; 