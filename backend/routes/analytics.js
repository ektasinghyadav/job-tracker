// Analytics routes — exposes the analytics service via REST API
// These endpoints power the dashboard health scores, pipeline velocity, and insights

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const analyticsService = require('../services/analytics.service');
const Job = require('../models/Job');

// All analytics routes require authentication
router.use(authMiddleware);

// GET /api/analytics/health/:jobId
// Returns health score (0-100) and recommendation for a single job application
router.get('/health/:jobId', asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, userId: req.userId });

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const health = analyticsService.calculateApplicationHealth(job);
  res.json(health);
}));

// GET /api/analytics/velocity
// Returns pipeline velocity metrics: conversion rates, response times, stale count
router.get('/velocity', asyncHandler(async (req, res) => {
  const jobs = await Job.find({ userId: req.userId });
  const velocity = analyticsService.calculatePipelineVelocity(jobs);
  res.json(velocity);
}));

// GET /api/analytics/insights
// Returns actionable insights: priorities, strengths, improvements, next actions
router.get('/insights', asyncHandler(async (req, res) => {
  const jobs = await Job.find({ userId: req.userId });
  const insights = analyticsService.generateInsights(jobs);
  res.json(insights);
}));

// GET /api/analytics/predict/:jobId
// Returns offer probability (0-100) for a specific job based on historical patterns
router.get('/predict/:jobId', asyncHandler(async (req, res) => {
  const jobs = await Job.find({ userId: req.userId });
  const targetJob = jobs.find(j => j._id.toString() === req.params.jobId);

  if (!targetJob) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const probability = analyticsService.predictOfferProbability(jobs, targetJob);
  res.json({
    jobId: req.params.jobId,
    company: targetJob.company,
    position: targetJob.position,
    offerProbability: probability
  });
}));

module.exports = router;
