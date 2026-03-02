// AI Service — Sprint 3: Real Hugging Face Inference API calls
// Uses mistralai/Mistral-7B-Instruct-v0.2 via the @huggingface/inference SDK
// Falls back to mock responses if the API fails (keeps the app working always)

const { HfInference } = require('@huggingface/inference');
const config = require('../config/config');

class AIService {
  constructor() {
    this.isHFEnabled = config.ai.huggingface.enabled;

    if (this.isHFEnabled) {
      this.hf = new HfInference(config.ai.huggingface.apiKey);
      this.model = 'mistralai/Mistral-7B-Instruct-v0.2';
      console.log(`🤖 AI Service initialized — Hugging Face LIVE (model: ${this.model})`);
    } else {
      console.log('🤖 AI Service initialized — MOCK mode (add HF_API_KEY to .env to enable real AI)');
    }
  }

  // ============================================
  // PUBLIC METHODS — called by routes
  // ============================================

  // Generate 5 resume bullet points tailored to a job description
  async generateResumeBullets(jobDescription, userExperience = '') {
    if (this.isHFEnabled) {
      try {
        return await this._hfResumeBullets(jobDescription, userExperience);
      } catch (err) {
        console.error('⚠️  HF resume bullets failed, using mock:', err.message);
      }
    }
    return this._mockBullets(jobDescription);
  }

  // Generate an interview preparation guide (topics, behavioral Qs, company research)
  async generateInterviewPrep(jobDescription, company) {
    if (this.isHFEnabled) {
      try {
        return await this._hfInterviewPrep(jobDescription, company);
      } catch (err) {
        console.error('⚠️  HF interview prep failed, using mock:', err.message);
      }
    }
    return this._mockInterviewPrep(jobDescription, company);
  }

  // Predict 8 likely interview questions for a specific company and role
  async predictInterviewQuestions(company, position) {
    if (this.isHFEnabled) {
      try {
        return await this._hfInterviewQuestions(company, position);
      } catch (err) {
        console.error('⚠️  HF interview questions failed, using mock:', err.message);
      }
    }
    return this._mockQuestions(company, position);
  }

  // Generate personalized next-step advice based on current application status
  async generateApplicationAdvice(jobData) {
    if (this.isHFEnabled) {
      try {
        return await this._hfApplicationAdvice(jobData);
      } catch (err) {
        console.error('⚠️  HF application advice failed, using mock:', err.message);
      }
    }
    return this._mockAdvice(jobData);
  }

  // ============================================
  // PRIVATE: Hugging Face API callers
  // ============================================

  // Wraps every HF call — sets common parameters and extracts generated_text
  async _callHF(prompt, maxTokens = 512) {
    const response = await this.hf.textGeneration({
      model: this.model,
      // Mistral instruct format: <s>[INST] instruction [/INST]
      inputs: `<s>[INST] ${prompt} [/INST]`,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false   // Only return the newly generated part
      }
    });
    return response.generated_text.trim();
  }

  async _hfResumeBullets(jobDescription, userExperience) {
    const prompt = `You are a professional resume writer helping a software engineering student.

Job Description:
${jobDescription.slice(0, 800)}

${userExperience ? `Candidate's Experience:\n${userExperience.slice(0, 400)}\n` : ''}

Generate exactly 5 resume bullet points tailored to this job. Each bullet point must:
- Start with a strong action verb (Led, Built, Implemented, Designed, Optimized, etc.)
- Include a measurable result or specific technology
- Be one clear sentence

Return only the 5 bullet points, each on a new line starting with a hyphen (-). No extra text.`;

    const raw = await this._callHF(prompt, 400);
    return this._parseBullets(raw);
  }

  async _hfInterviewPrep(jobDescription, company) {
    const prompt = `You are an expert interview coach. Create a structured interview preparation guide.

Company: ${company}
Job Description: ${jobDescription.slice(0, 600)}

Return a JSON object with exactly these keys:
- technicalTopics: array of 5 technical topics to study
- behavioralTopics: array of 4 behavioral questions to prepare
- companyResearch: array of 3 research areas for ${company}
- keyTakeaways: one sentence of the most important advice

Return only valid JSON, no extra text.`;

    const raw = await this._callHF(prompt, 600);
    return this._parseInterviewPrepJSON(raw, company);
  }

  async _hfInterviewQuestions(company, position) {
    const prompt = `You are a hiring manager at ${company} conducting an interview for the ${position} role.

Generate 8 realistic interview questions you would ask this candidate. Mix technical and behavioral questions.

Return only the 8 questions, each on a new line starting with a number and period (1. 2. etc.). No extra text.`;

    const raw = await this._callHF(prompt, 400);
    return this._parseQuestions(raw);
  }

  async _hfApplicationAdvice(jobData) {
    const { status, dateApplied, company, position } = jobData;
    const daysSince = Math.floor((Date.now() - new Date(dateApplied)) / (1000 * 60 * 60 * 24));

    const prompt = `You are a supportive job search coach. Give practical advice in 2-3 sentences.

Situation: A student applied to ${company} for the ${position} role ${daysSince} days ago.
Current status: ${status}

Be encouraging but specific. Focus on the most important next action they should take right now.`;

    const raw = await this._callHF(prompt, 200);
    // Strip any intro phrases the model might add
    return raw.replace(/^(Here'?s?|Sure[,.]|Of course[,.]|Advice:|Tip:)\s*/i, '').trim();
  }

  // ============================================
  // PRIVATE: Response parsers
  // ============================================

  // Parses bullet list from LLM output — handles -, •, *, or numbered formats
  _parseBullets(text) {
    const lines = text
      .split('\n')
      .map(l => l.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter(l => l.length > 20);   // Filter out empty or very short lines

    // If we got good lines, return up to 5
    if (lines.length >= 3) {
      return lines.slice(0, 5);
    }

    // If parsing failed, split on sentence boundaries and take first 5
    const sentences = text.match(/[A-Z][^.!?]*[.!?]/g) || [];
    if (sentences.length >= 3) {
      return sentences.slice(0, 5);
    }

    // Last resort — wrap the whole response
    return [text];
  }

  // Parses JSON from LLM output — the model sometimes wraps JSON in code blocks
  _parseInterviewPrepJSON(text, company) {
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Find the first { and last } to extract the JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start !== -1 && end !== -1) {
      try {
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        // Validate the required keys exist
        if (parsed.technicalTopics && parsed.behavioralTopics) {
          return parsed;
        }
      } catch {
        // JSON was malformed — fall through to mock
      }
    }

    // If JSON parsing failed, return mock rather than crashing
    console.error('⚠️  Could not parse HF JSON response, using mock interview prep');
    return this._mockInterviewPrep('', company);
  }

  // Parses a numbered or bulleted list of questions
  _parseQuestions(text) {
    const lines = text
      .split('\n')
      .map(l => l.replace(/^[\d.)\-•*\s]+/, '').trim())
      .filter(l => l.length > 10 && l.includes('?'));

    if (lines.length >= 4) {
      return lines.slice(0, 8);
    }

    // Fallback: split by question marks
    const questions = text.match(/[^.!?\n][^?]*\?/g) || [];
    if (questions.length >= 4) {
      return questions.slice(0, 8).map(q => q.trim());
    }

    return [text];
  }

  // ============================================
  // PRIVATE: Mock implementations (fallback)
  // ============================================

  _mockBullets(jobDescription) {
    return Promise.resolve([
      'Led development of full-stack web application using MERN stack, improving user engagement by 40%',
      'Implemented RESTful APIs with Node.js and Express.js, handling 10,000+ daily requests',
      'Designed and optimized MongoDB database schemas, reducing query time by 35%',
      'Collaborated with cross-functional team using Git and Agile methodologies',
      'Built responsive React.js interfaces with modern hooks and state management'
    ]);
  }

  _mockInterviewPrep(jobDescription, company) {
    return Promise.resolve({
      technicalTopics: [
        'JavaScript ES6+ features and async/await patterns',
        'React.js component lifecycle and hooks (useState, useEffect, useContext)',
        'RESTful API design principles and HTTP methods',
        'MongoDB schema design and aggregation pipelines',
        'JWT authentication and secure session management'
      ],
      behavioralTopics: [
        'Tell me about a challenging project you worked on',
        'How do you handle tight deadlines and competing priorities?',
        'Describe a time you learned a new technology quickly',
        'How do you approach debugging complex issues?'
      ],
      companyResearch: [
        `Research ${company}'s recent products, tech stack, and engineering blog`,
        `Understand ${company}'s mission, values, and recent news`,
        `Prepare thoughtful questions about team structure and growth opportunities`
      ],
      keyTakeaways: `Showcase your MERN stack depth and problem-solving process — ${company} values engineers who think clearly under pressure.`
    });
  }

  _mockQuestions(company, position) {
    return Promise.resolve([
      `Why do you want to work at ${company}?`,
      `Walk me through your experience with ${position.toLowerCase().includes('backend') ? 'Node.js and databases' : 'React and frontend development'}`,
      'How do you stay updated with new technologies?',
      'Describe your approach to testing and code quality',
      `What interests you most about the ${position} role at ${company}?`,
      'Tell me about a time you optimized performance in a web application',
      'How do you handle disagreements with teammates during code reviews?',
      `What do you know about ${company}'s products or services?`
    ]);
  }

  _mockAdvice(jobData) {
    const { status, dateApplied, company } = jobData;
    const days = Math.floor((Date.now() - new Date(dateApplied)) / (1000 * 60 * 60 * 24));
    let advice = '';

    if (status === 'Applied' && days > 7) {
      advice = `It has been ${days} days since you applied to ${company}. Consider sending a brief, polite follow-up email to the recruiter. Keep it short and express your continued interest.`;
    } else if (status === 'Interview Scheduled') {
      advice = `You have an interview coming up at ${company}! Research the company's recent projects, prepare STAR-format answers for behavioral questions, and review core technical concepts from the job description.`;
    } else if (status === 'Applied') {
      advice = `Your application to ${company} is fresh. Use this waiting period to research the company deeply and practice common interview questions so you are ready if they reach out.`;
    } else if (status === 'Rejected') {
      advice = `The ${company} rejection is a data point, not a verdict. Review the job requirements, identify any skill gaps, and add those skills to your learning plan. Every rejection sharpens your search.`;
    } else if (status === 'Offer') {
      advice = `Congratulations on the offer from ${company}! Take time to review the full compensation package, ask about growth opportunities, and do not be afraid to negotiate — it is expected and professional.`;
    } else {
      advice = `Keep your ${company} application organized and stay proactive. Set a calendar reminder to follow up in a few days if you have not heard back.`;
    }

    return Promise.resolve(advice);
  }
}

module.exports = new AIService();
