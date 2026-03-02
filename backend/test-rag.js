// Quick RAG + Pinecone test script
// Run with: node test-rag.js
// Tests: embedding generation → Pinecone upsert → Pinecone search → cleanup

require('dotenv').config();
const { HfInference } = require('@huggingface/inference');
const { Pinecone } = require('@pinecone-database/pinecone');

const HF_API_KEY = process.env.HF_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'job-tracker';

const pass = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg, err) => console.log(`  ❌ ${msg}: ${err}`);

async function runTests() {
  console.log('\n══════════════════════════════════════');
  console.log('   JobTracker RAG + Pinecone Test');
  console.log('══════════════════════════════════════\n');

  // ── Check 1: env vars ──────────────────
  console.log('1. Checking environment variables...');
  if (HF_API_KEY) pass('HF_API_KEY found');
  else { fail('HF_API_KEY missing', 'add it to .env'); process.exit(1); }

  if (PINECONE_API_KEY) pass('PINECONE_API_KEY found');
  else { fail('PINECONE_API_KEY missing', 'add it to .env'); process.exit(1); }

  // ── Check 2: generate an embedding ────
  console.log('\n2. Testing Hugging Face embedding...');
  let embedding;
  try {
    const hf = new HfInference(HF_API_KEY);
    const output = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: 'Software Engineer with React and Node.js experience'
    });
    embedding = Array.isArray(output[0]) ? output[0] : Array.from(output);
    pass(`Embedding generated — ${embedding.length} dimensions`);
    if (embedding.length !== 384) {
      fail('Unexpected dimension count', `got ${embedding.length}, expected 384`);
    }
  } catch (err) {
    fail('HF embedding failed', err.message);
    process.exit(1);
  }

  // ── Check 3: Describe the Pinecone index ──
  console.log('\n3. Checking Pinecone index configuration...');
  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  let indexDimension;
  try {
    const info = await pc.describeIndex(INDEX_NAME);
    indexDimension = info.dimension;
    console.log(`  Index name   : ${INDEX_NAME}`);
    console.log(`  Index dim    : ${indexDimension}`);
    console.log(`  Index metric : ${info.metric}`);
    if (indexDimension === 384) {
      pass('Index dimension matches embedding model (384)');
    } else {
      fail(`Dimension mismatch`, `index has ${indexDimension} dimensions but model outputs 384 — you need to delete and recreate the index with dimension=384`);
      process.exit(1);
    }
  } catch (err) {
    fail(`Could not describe index "${INDEX_NAME}"`, err.message);
    console.log('\n  💡 Common causes:');
    console.log(`     - Index is named something other than "${INDEX_NAME}"`);
    console.log('     - Wrong API key');
    console.log('     - Index not yet ready (wait 30 seconds and retry)\n');
    process.exit(1);
  }

  // ── Check 4: Pinecone upsert ───────────
  console.log('\n4. Testing Pinecone upsert...');
  const index = pc.index(INDEX_NAME);
  const testId = 'test_rag_verification_vector';

  // Ensure values are plain numbers (not TypedArray)
  const safeEmbedding = Array.from(embedding).map(Number);

  try {
    // Pinecone SDK v7 upsert format: { records: [...] }
    await index.upsert({
      records: [{
        id: testId,
        values: safeEmbedding,
        metadata: { userId: 'test', company: 'TestCorp', position: 'Software Engineer' }
      }]
    });
    pass('Vector upserted to Pinecone');
  } catch (err) {
    fail('Pinecone upsert failed', err.message);
    process.exit(1);
  }

  // ── Check 5: Pinecone query ───────────
  console.log('\n5. Testing Pinecone semantic search...');
  try {
    // Wait a moment — Pinecone needs ~1s to index the new vector
    await new Promise(r => setTimeout(r, 1500));

    const results = await index.query({
      vector: safeEmbedding,
      topK: 1,
      filter: { userId: { $eq: 'test' } },
      includeMetadata: true
    });

    if (results.matches && results.matches.length > 0) {
      const top = results.matches[0];
      pass(`Search returned a match — score: ${top.score.toFixed(4)}, company: ${top.metadata.company}`);
    } else {
      fail('Search returned no matches', 'vector may not have indexed yet — try again in a few seconds');
    }
  } catch (err) {
    fail('Pinecone query failed', err.message);
  }

  // ── Cleanup: delete test vector ───────
  console.log('\n6. Cleaning up test vector...');
  try {
    await index.deleteOne({ id: testId });
    pass('Test vector deleted');
  } catch (err) {
    fail('Cleanup failed (not critical)', err.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('   All tests passed! RAG is working.');
  console.log('══════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('\nUnexpected error:', err.message);
  process.exit(1);
});
