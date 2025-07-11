const express = require('express');
const router = express.Router();
const { startImport } = require('../controllers/importController');
const ImportLog = require('../models/ImportLog');
const Job = require('../models/Job');

// @desc    Get latest import logs
// @route   GET /api/import-logs
router.get('/import-logs', async (req, res) => {
  try {
    const logs = await ImportLog.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(logs);
  } catch (err) {
    console.error('❌ Failed to fetch logs:', err.message);
    res.status(500).json({ error: 'Failed to fetch import logs' });
  }
});

// @desc    Trigger a job import
// @route   POST /api/import-jobs
router.post('/import-jobs', async (req, res) => {
  try {
    await startImport(req, res); // ✅ call controller and handle response there
  } catch (err) {
    console.error('❌ Import trigger failed:', err.message);
    res.status(500).json({ error: 'Failed to trigger import' });
  }
});

// GET /api/jobs?page=1&limit=10
router.get('/jobs', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const total = await Job.countDocuments();
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      jobs,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error('❌ Failed to fetch paginated jobs:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;