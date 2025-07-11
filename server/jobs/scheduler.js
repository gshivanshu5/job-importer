const cron = require('node-cron');
const { fetchJobsFromFeeds } = require('../services/fetchJobs');
const jobQueue = require('./jobQueue');

const scheduleJobImport = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running hourly job import...');
    try {
      const jobs = await fetchJobsFromFeeds();
      for (const job of jobs) {
        await jobQueue.add('import', job);
      }
      console.log(`📥 Queued ${jobs.length} jobs`);
    } catch (err) {
      console.error('❌ Error in scheduled job import:', err.message);
    }
  });
};

module.exports = scheduleJobImport;