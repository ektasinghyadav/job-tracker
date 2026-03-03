// RAG Service — Sprint 4: Embeddings + Semantic Search
//
// What is RAG?
// RAG stands for Retrieval-Augmented Generation. The idea is:
//   1. Convert text (job descriptions) into vectors called "embeddings"
//   2. Store those vectors in a special database (Pinecone)
//   3. When a user searches, convert their query into a vector too
//   4. Find stored vectors that are "close" to the query vector (= similar meaning)
//
// Embedding model: sentence-transformers/all-MiniLM-L6-v2 (via HF Inference API)
//   - Converts any text into a 384-dimensional vector
//   - Free tier, fast, great for semantic similarity
//
// Vector store: Pinecone (free tier)
//   - Stores and queries vectors at scale
//   - We filter by userId so users only search their own jobs
//
// Fallback: MongoDB text search (when Pinecone is not configured)
//   - Uses MongoDB's built-in $text operator on company/position/jobDescription fields

const { HfInference } = require('@huggingface/inference');
const { Pinecone } = require('@pinecone-database/pinecone');
const config = require('../config/config');
const Job = require('../models/Job');

class RAGService {
  constructor() {
    // We need BOTH HF (for embeddings) AND Pinecone (for vector storage)
    this.embeddingEnabled = config.ai.huggingface.enabled;
    this.pineconeEnabled = config.ai.pinecone.enabled;
    this.isFullyEnabled = this.embeddingEnabled && this.pineconeEnabled;

    if (this.embeddingEnabled) {
      this.hf = new HfInference(config.ai.huggingface.apiKey);
      this.embeddingModel = 'sentence-transformers/all-MiniLM-L6-v2';
    }

    if (this.pineconeEnabled) {
      this.pc = new Pinecone({ apiKey: config.ai.pinecone.apiKey });
      this.indexName = config.ai.pinecone.indexName;
      // Lazy init: get the index reference (doesn't connect yet)
      this.index = this.pc.index(this.indexName);
    }

    if (this.isFullyEnabled) {
      console.log(`🔍 RAG Service initialized — Pinecone LIVE (index: ${this.indexName})`);
    } else if (this.embeddingEnabled) {
      console.log('🔍 RAG Service initialized — embeddings only, Pinecone disabled (add PINECONE_API_KEY to enable vector search)');
    } else {
      console.log('🔍 RAG Service initialized — FALLBACK mode (MongoDB text search)');
    }
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC: Store a job's embedding in Pinecone
  // Called (fire-and-forget) after a job is created or updated
  // ─────────────────────────────────────────────────────────
  async upsertJobEmbedding(job) {
    if (!this.isFullyEnabled) return;

    // Only embed if there is a description to embed
    const text = this._buildEmbedText(job);
    if (!text) return;

    try {
      const embedding = await this.embedText(text);

      // Pinecone SDK v7 upsert format: { records: [...] }
      await this.index.upsert({
        records: [{
          id: `job_${job._id.toString()}`,
          values: embedding,
          // Metadata stored alongside the vector — used for display and filtering
          metadata: {
            userId: job.userId.toString(),
            company: job.company,
            position: job.position,
            status: job.status,
            jobId: job._id.toString()
          }
        }]
      });

      console.log(`✅ RAG: embedding stored for job ${job._id} (${job.company})`);
    } catch (err) {
      // Never crash the main request — embeddings are supplementary
      console.error(`⚠️  RAG upsert failed for job ${job._id}:`, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC: Remove a job's embedding when the job is deleted
  // ─────────────────────────────────────────────────────────
  async deleteJobEmbedding(jobId) {
    if (!this.isFullyEnabled) return;

    try {
      await this.index.deleteOne({ id: `job_${jobId.toString()}` });
      console.log(`🗑️  RAG: embedding deleted for job ${jobId}`);
    } catch (err) {
      console.error(`⚠️  RAG delete failed for job ${jobId}:`, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC: Find jobs semantically similar to a query string
  // Returns an array of job objects from MongoDB
  // ─────────────────────────────────────────────────────────
  async semanticSearch(queryText, userId, topK = 5) {
    // Step 1: exact match on company + position (fast, no false positives)
    const exactMatches = await this._mongoTextSearch(queryText, userId, topK);
    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // Step 2: no exact match — try Pinecone for semantic similarity
    if (this.isFullyEnabled) {
      try {
        const vectorResults = await this._pineconeSearch(queryText, userId, topK);
        if (vectorResults.length > 0) return vectorResults;
      } catch (err) {
        console.error('⚠️  Pinecone search failed:', err.message);
      }
    }

    // Step 3: Pinecone unavailable/failed — search inside job descriptions too
    return this._mongoDescriptionSearch(queryText, userId, topK);
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC: Convert any text string into a 384-dim vector
  // Used internally and exposed for Sprint 5 analytics if needed
  // ─────────────────────────────────────────────────────────
  async embedText(text) {
    if (!this.embeddingEnabled) {
      throw new Error('HF API key not configured — cannot generate embeddings');
    }

    const output = await this.hf.featureExtraction({
      model: this.embeddingModel,
      inputs: text.slice(0, 512)   // Limit input length to avoid token overflow
    });

    // HF returns either [0.1, 0.2, ...] or [[0.1, 0.2, ...]] depending on the call
    // We always want a flat 1D array of 384 floats
    const embedding = Array.isArray(output[0]) ? output[0] : output;
    return Array.from(embedding);  // Ensure it's a plain array, not a Float32Array
  }

  // ─────────────────────────────────────────────────────────
  // PRIVATE: Pinecone vector search
  // ─────────────────────────────────────────────────────────
  async _pineconeSearch(queryText, userId, topK) {
    // 1. Embed the search query
    const queryEmbedding = await this.embedText(queryText);

    // 2. Query Pinecone — filter by userId so users only see their own jobs
    const results = await this.index.query({
      vector: queryEmbedding,
      topK,
      filter: { userId: { $eq: userId.toString() } },
      includeMetadata: true
    });

    if (!results.matches || results.matches.length === 0) {
      return [];
    }

    // Filter out low-confidence matches — below 0.80 means the result is
    // only loosely related (e.g. a different company in the same industry)
    const SIMILARITY_THRESHOLD = 0.70;
    const relevantMatches = results.matches.filter(m => m.score >= SIMILARITY_THRESHOLD);

    if (relevantMatches.length === 0) {
      return [];
    }

    // 3. Fetch full job documents from MongoDB using the IDs from Pinecone
    const jobIds = relevantMatches.map(m => m.metadata.jobId);
    const jobs = await Job.find({ _id: { $in: jobIds }, userId });

    // 4. Re-order jobs to match Pinecone's relevance ranking
    const idToScore = {};
    relevantMatches.forEach(m => { idToScore[m.metadata.jobId] = m.score; });

    return jobs
      .map(job => ({ ...job.toObject(), similarityScore: idToScore[job._id.toString()] }))
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }

  // ─────────────────────────────────────────────────────────
  // PRIVATE: Exact match on company + position only
  // Used as the first pass — precise, no false positives
  // ─────────────────────────────────────────────────────────
  async _mongoTextSearch(queryText, userId, topK) {
    const regex = new RegExp(queryText.trim(), 'i');

    const jobs = await Job.find({
      userId,
      $or: [
        { company: regex },
        { position: regex }
      ]
    }).limit(topK);

    return jobs.map(job => ({ ...job.toObject(), similarityScore: null }));
  }

  // ─────────────────────────────────────────────────────────
  // PRIVATE: Broader keyword search including job description
  // Used as last resort when Pinecone is unavailable
  // ─────────────────────────────────────────────────────────
  async _mongoDescriptionSearch(queryText, userId, topK) {
    const regex = new RegExp(queryText.trim(), 'i');

    const jobs = await Job.find({
      userId,
      $or: [
        { company: regex },
        { position: regex },
        { jobDescription: regex }
      ]
    }).limit(topK);

    return jobs.map(job => ({ ...job.toObject(), similarityScore: null }));
  }

  // ─────────────────────────────────────────────────────────
  // PRIVATE: Build the text we will embed for a job
  // Combines company + position + description for richer embeddings
  // ─────────────────────────────────────────────────────────
  _buildEmbedText(job) {
    const parts = [
      job.company,
      job.position,
      job.jobDescription
    ].filter(Boolean);

    return parts.join(' — ').trim();
  }
}

module.exports = new RAGService();
