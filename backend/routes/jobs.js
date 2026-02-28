const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const authMiddleware = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// All routes require authentication
router.use(authMiddleware);

// Get all jobs for the logged-in user
router.get('/', asyncHandler(async (req, res) => {
  const jobs = await Job.find({ userId: req.userId }).sort({ dateApplied: -1 });
  res.json(jobs);
}));

// IMPORTANT: /stats/summary MUST come before /:id
// If placed after /:id, Express would treat "stats" as the :id parameter
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const jobs = await Job.find({ userId: req.userId });

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interviews: jobs.filter(j => j.status === 'Interview Scheduled').length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
    withdrawn: jobs.filter(j => j.status === 'Withdrawn').length
  };

  res.json(stats);
}));

// Get single job by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, userId: req.userId });

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
}));

// Create new job application
router.post('/', asyncHandler(async (req, res) => {
  const { company, position, location, status, dateApplied, notes, jobUrl, salary, jobDescription } = req.body;

  if (!company || !position) {
    return res.status(400).json({ error: 'Company and position are required' });
  }

  const job = new Job({
    userId: req.userId,
    company,
    position,
    location,
    status,
    dateApplied,
    notes,
    jobUrl,
    salary,
    jobDescription
  });

  await job.save();
  res.status(201).json(job);
}));

// Update job application
router.put('/:id', asyncHandler(async (req, res) => {
  const { company, position, location, status, dateApplied, notes, jobUrl, salary, jobDescription } = req.body;

  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { company, position, location, status, dateApplied, notes, jobUrl, salary, jobDescription },
    { new: true, runValidators: true }
  );

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
}));

// Delete job application
router.delete('/:id', asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.userId });

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({ message: 'Job deleted successfully' });
}));

module.exports = router;
