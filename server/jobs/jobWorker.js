const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const Job = require('../models/Job');
const ImportLog = require('../models/ImportLog');
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Worker connected to MongoDB');
}).catch((err) => {
  console.error('❌ Worker MongoDB connection failed:', err.message);
});

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

let importStats = {
  totalFetched: 0,
  newJobs: 0,
  updatedJobs: 0,
  failedJobs: [],
};

const io = global.io || null; // 👈 This will be available if worker is run within the server context

const worker = new Worker(
  'job-import-queue',
  async (job) => {
    importStats.totalFetched++;

    const jobData = job.data;

    const rawGuid = jobData.guid || jobData.link;
    const jobId = typeof rawGuid === 'object' ? rawGuid._ : rawGuid;

    try {
      const existing = await Job.findOne({ jobId });

      if (existing) {
        await Job.updateOne({ jobId }, { $set: { ...jobData, jobId } });
        importStats.updatedJobs++;
        console.log('🔄 Updated job:', jobId);

        // Emit update event
        io?.emit('jobUpdate', { jobId, status: 'updated' });

      } else {
        await Job.create({ ...jobData, jobId });
        importStats.newJobs++;
        console.log('🆕 Created job:', jobId);

        // Emit new job event
        io?.emit('jobUpdate', { jobId, status: 'new' });
      }

    } catch (err) {
      console.error('❌ Job failed:', jobId, err.message);
      importStats.failedJobs.push({ jobId: jobId || 'unknown', reason: err.message });

      // Emit error
      io?.emit('jobUpdate', { jobId, status: 'failed', error: err.message });
    }
  },
  { connection }
);

// Queue drained
worker.on('drained', async () => {
  try {
    await ImportLog.create(importStats);
    console.log('✅ Import stats saved');

    // Emit summary
    io?.emit('importComplete', importStats);
  } catch (err) {
    console.error('❌ Failed to save ImportLog:', err.message);
  }

  importStats = {
    totalFetched: 0,
    newJobs: 0,
    updatedJobs: 0,
    failedJobs: [],
  };
});

worker.on('failed', (job, err) => {
  const rawGuid = job?.data?.guid || job?.data?.link;
  const jobId = typeof rawGuid === 'object' ? rawGuid._ : rawGuid;
  importStats.failedJobs.push({ jobId: jobId || 'unknown', reason: err.message });

  // Emit failed job
  io?.emit('jobUpdate', { jobId, status: 'failed', error: err.message });
});