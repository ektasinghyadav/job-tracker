const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ── Security headers (Sprint 7) ───────────────────────────
// helmet sets ~14 HTTP headers that block common web attacks:
// X-Frame-Options (clickjacking), X-Content-Type-Options (MIME sniffing),
// Strict-Transport-Security (force HTTPS), etc.
app.use(helmet());

// ── Gzip compression (Sprint 7) ──────────────────────────
// Compresses JSON responses before sending — reduces bandwidth 60-80%
app.use(compression());

// ── HTTP request logging ──────────────────────────────────
// 'combined' format in production (Apache-style, good for log aggregators)
// 'dev' format in development (colorized, concise)
app.use(morgan(config.server.nodeEnv === 'production' ? 'combined' : 'dev'));

// ── CORS — only allow requests from the configured frontend URL ──
app.use(cors({ origin: config.cors.origin, credentials: true }));

// ── Parse JSON bodies with a 10kb limit (Sprint 7) ───────
// The default is 100kb — 10kb is more than enough for our API payloads.
// This prevents attackers from sending huge JSON bodies to exhaust memory.
app.use(express.json({ limit: '10kb' }));

// ── Rate limiters ─────────────────────────────────────────

// Auth limiter: strict — 20 req/15min — prevents brute-force on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// General API limiter (Sprint 7): 200 req/15min — prevents API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please slow down.' }
});

// ── MongoDB ───────────────────────────────────────────────
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// ── Health check ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'JobTracker AI API is running!', version: '4.0' });
});

// ── Routes ────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const jobRoutes       = require('./routes/jobs');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes        = require('./routes/ai');

app.use('/api/auth',      authLimiter, authRoutes);   // Strict limit
app.use('/api/jobs',      apiLimiter,  jobRoutes);    // General limit
app.use('/api/analytics', apiLimiter,  analyticsRoutes);
app.use('/api/ai',        aiRoutes);                  // AI routes have their own limiter

// ── Error handlers (must be last) ────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
});
