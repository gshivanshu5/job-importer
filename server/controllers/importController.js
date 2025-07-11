const { fetchJobsFromFeeds } = require('../services/fetchJobs');
const jobQueue = require('../jobs/jobQueue');

const startImport = async (req, res) => {
  try {
    const jobs = await fetchJobsFromFeeds();

    console.log(`Fetched ${jobs.length} jobs`);

    // 🚀 Queue all jobs in parallel
    const jobPromises = jobs.map((job) =>
      jobQueue.add('import', job)
    );
    await Promise.all(jobPromises);

    return res.status(200).json({ message: `Queued ${jobs.length} jobs for processing` });
  } catch (err) {
    console.error('❌ Import failed:', err);
    return res.status(500).json({ error: 'Import failed', details: err.message });
  }
};

module.exports = { startImport };