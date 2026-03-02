// AI routes — Sprint 3: Hugging Face Inference API endpoints
// All routes are protected by JWT auth and rate-limited to avoid abuse

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const aiService = require('../services/ai.service');
const ragService = require('../services/rag.service');
const Job = require('../models/Job');

// All AI routes require authentication
router.use(authMiddleware);

// Rate limiter specific to AI endpoints
// HF free tier is generous but we still want to prevent accidental flooding
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute window
  max: 15,               // 15 AI requests per minute per IP
  message: { error: 'Too many AI requests. Please wait a minute and try again.' }
});
router.use(aiLimiter);

// ─────────────────────────────────────────────
// POST /api/ai/resume-bullets
// Body: { jobDescription: string, userExperience?: string }
// Returns: string[] — 5 tailored resume bullet points
// ─────────────────────────────────────────────
router.post('/resume-bullets', asyncHandler(async (req, res) => {
  const { jobDescription, userExperience = '' } = req.body;

  if (!jobDescription || jobDescription.trim().length < 10) {
    return res.status(400).json({ error: 'jobDescription is required (minimum 10 characters)' });
  }

  const bullets = await aiService.generateResumeBullets(jobDescription, userExperience);
  res.json({ bullets });
}));

// ─────────────────────────────────────────────
// POST /api/ai/interview-prep
// Body: { jobDescription: string, company: string }
// Returns: { technicalTopics, behavioralTopics, companyResearch, keyTakeaways }
// ─────────────────────────────────────────────
router.post('/interview-prep', asyncHandler(async (req, res) => {
  const { jobDescription, company } = req.body;

  if (!jobDescription || jobDescription.trim().length < 10) {
    return res.status(400).json({ error: 'jobDescription is required (minimum 10 characters)' });
  }
  if (!company || company.trim().length < 1) {
    return res.status(400).json({ error: 'company name is required' });
  }

  const prep = await aiService.generateInterviewPrep(jobDescription, company);
  res.json({ prep });
}));

// ─────────────────────────────────────────────
// POST /api/ai/questions
// Body: { company: string, position: string }
// Returns: string[] — 8 predicted interview questions
// ─────────────────────────────────────────────
router.post('/questions', asyncHandler(async (req, res) => {
  const { company, position } = req.body;

  if (!company || company.trim().length < 1) {
    return res.status(400).json({ error: 'company is required' });
  }
  if (!position || position.trim().length < 1) {
    return res.status(400).json({ error: 'position is required' });
  }

  const questions = await aiService.predictInterviewQuestions(company, position);
  res.json({ questions });
}));

// ─────────────────────────────────────────────
// POST /api/ai/advice
// Body: { jobId: string }
// Fetches the job from DB and returns personalized next-step advice
// Returns: { advice: string }
// ─────────────────────────────────────────────
router.post('/advice', asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: 'jobId is required' });
  }

  // Fetch the job — enforce user ownership so users can only get advice for their own jobs
  const job = await Job.findOne({ _id: jobId, userId: req.userId });
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const advice = await aiService.generateApplicationAdvice(job);
  res.json({ advice });
}));

// ─────────────────────────────────────────────
// POST /api/ai/search
// Body: { query: string, limit?: number }
// Returns: matching job objects ranked by semantic similarity
// Uses Pinecone vector search when configured, MongoDB text search otherwise
// ─────────────────────────────────────────────
router.post('/search', asyncHandler(async (req, res) => {
  const { query, limit = 5 } = req.body;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'query is required (minimum 2 characters)' });
  }

  const topK = Math.min(Number(limit) || 5, 20);   // Cap at 20 results
  const results = await ragService.semanticSearch(query, req.userId, topK);

  res.json({
    query,
    count: results.length,
    mode: ragService.isFullyEnabled ? 'vector' : 'text',
    results
  });
}));

module.exports = router;
