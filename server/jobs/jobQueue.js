const { Queue } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // 🔧 required for Redis Cloud
});

const jobQueue = new Queue('job-import-queue', { connection });

module.exports = jobQueue;