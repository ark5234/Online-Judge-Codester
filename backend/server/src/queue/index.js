const Queue = require('bullmq').Queue;
const queue = new Queue('submissions', { connection: { host: 'redis', port: 6379 } });
module.exports = queue; 