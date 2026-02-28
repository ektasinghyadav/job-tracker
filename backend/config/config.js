// Configuration management - centralized env variables
// This file loads and validates all environment variables

require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Authentication configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },

  // CORS - which frontend origins are allowed to connect
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // AI Services
  ai: {
    // Hugging Face Inference API (free tier)
    huggingface: {
      apiKey: process.env.HF_API_KEY || null,
      enabled: !!process.env.HF_API_KEY
    },
    // Pinecone vector database (for RAG pipeline in Sprint 4)
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || null,
      environment: process.env.PINECONE_ENVIRONMENT || null,
      indexName: process.env.PINECONE_INDEX_NAME || 'job-tracker',
      enabled: !!process.env.PINECONE_API_KEY
    }
  }
};

// Validation - make sure critical env vars exist
const validateConfig = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file!');
    process.exit(1);
  }

  console.log('✅ Configuration validated successfully');
  console.log(`   - Environment: ${config.server.nodeEnv}`);
  console.log(`   - Port: ${config.server.port}`);
  console.log(`   - CORS origin: ${config.cors.origin}`);
  console.log(`   - Hugging Face: ${config.ai.huggingface.enabled ? 'Enabled' : 'Mock Mode (add HF_API_KEY to enable)'}`);
  console.log(`   - Pinecone: ${config.ai.pinecone.enabled ? 'Enabled' : 'Disabled (add PINECONE_API_KEY to enable)'}`);
};

validateConfig();

module.exports = config;
