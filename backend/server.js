const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// HTTP request logging (shows every request in terminal)
app.use(morgan(config.server.nodeEnv === 'production' ? 'combined' : 'dev'));

// CORS — only allow requests from your frontend URL
app.use(cors({ origin: config.cors.origin, credentials: true }));

// Parse JSON request bodies
app.use(express.json());

// Rate limiting on auth routes — max 20 requests per 15 minutes per IP
// This prevents brute-force password attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'JobTracker AI API is running!', version: '2.0' });
});

// Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authLimiter, authRoutes);   // Rate limited
app.use('/api/jobs', jobRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handlers (must come AFTER all routes)
app.use(notFound);
app.use(errorHandler);

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
});
