const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [
    {
      jobId: String,
      reason: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('ImportLog', importLogSchema);