const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview Scheduled', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'Applied'
  },
  dateApplied: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  jobUrl: {
    type: String,
    default: ''
  },
  salary: {
    type: String,
    default: ''
  },
  // Sprint 4 (RAG): This field stores the raw job description text.
  // In Sprint 4, we will generate a vector embedding from this text
  // and store it in Pinecone for semantic search.
  jobDescription: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
