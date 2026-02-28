// AI Service — Business logic for AI features
// Sprint 2: Config updated to Hugging Face. Still using MOCK responses.
// Sprint 3: Real Hugging Face Inference API calls will replace the mocks below.

const config = require('../config/config');

class AIService {
  constructor() {
    this.isHFEnabled = config.ai.huggingface.enabled;
    console.log(`🤖 AI Service initialized in ${this.isHFEnabled ? 'Hugging Face' : 'MOCK'} mode`);
  }

  // Generate resume bullet points based on job description
  async generateResumeBullets(jobDescription, userExperience = '') {
    if (this.isHFEnabled) {
      // TODO Sprint 3: implement with Hugging Face Inference API
      console.log('⚠️ HF key found but real implementation is Sprint 3 — using mock');
    }
    return this._generateMockBullets(jobDescription);
  }

  // Generate interview preparation guide
  async generateInterviewPrep(jobDescription, company) {
    if (this.isHFEnabled) {
      // TODO Sprint 3: implement with Hugging Face Inference API
      console.log('⚠️ HF key found but real implementation is Sprint 3 — using mock');
    }
    return this._generateMockInterviewPrep(jobDescription, company);
  }

  // Predict company-specific interview questions
  async predictInterviewQuestions(company, position) {
    if (this.isHFEnabled) {
      // TODO Sprint 3: implement with Hugging Face Inference API
      console.log('⚠️ HF key found but real implementation is Sprint 3 — using mock');
    }
    return this._generateMockQuestions(company, position);
  }

  // Generate personalized application advice based on current status
  async generateApplicationAdvice(jobData) {
    if (this.isHFEnabled) {
      // TODO Sprint 3: implement with Hugging Face Inference API
      console.log('⚠️ HF key found but real implementation is Sprint 3 — using mock');
    }
    return this._generateMockAdvice(jobData);
  }

  // ============================================
  // MOCK IMPLEMENTATIONS (used until Sprint 3)
  // ============================================

  _generateMockBullets(jobDescription) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          'Led development of full-stack web application using MERN stack, improving user engagement by 40%',
          'Implemented RESTful APIs with Node.js and Express.js, handling 10,000+ daily requests',
          'Designed and optimized MongoDB database schemas, reducing query time by 35%',
          'Collaborated with cross-functional team using Git and Agile methodologies',
          'Built responsive React.js interfaces with modern hooks and state management'
        ]);
      }, 500);
    });
  }

  _generateMockInterviewPrep(jobDescription, company) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          technicalTopics: [
            'JavaScript ES6+ features and async programming',
            'React.js component lifecycle and hooks',
            'RESTful API design principles',
            'Database design and optimization',
            'Authentication and security best practices'
          ],
          behavioralTopics: [
            'Tell me about a challenging project you worked on',
            'How do you handle tight deadlines?',
            'Describe a time you learned a new technology quickly',
            'How do you approach debugging complex issues?'
          ],
          companyResearch: [
            `Research ${company}'s recent projects and tech stack`,
            `Understand ${company}'s mission and values`,
            `Prepare questions about team structure and culture`,
            `Review ${company}'s engineering blog or GitHub repos`
          ],
          keyTakeaways: `Focus on showcasing your MERN stack experience and problem-solving approach. ${company} values innovation and teamwork.`
        });
      }, 800);
    });
  }

  _generateMockQuestions(company, position) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          `Why do you want to work at ${company}?`,
          `Walk me through your experience with ${position.includes('Backend') ? 'Node.js and databases' : 'React and frontend development'}`,
          'How do you stay updated with new technologies?',
          'Describe your approach to testing and code quality',
          `What interests you most about the ${position} role?`,
          'Tell me about a time you optimized performance in an application',
          'How do you handle disagreements in code reviews?',
          `What do you know about ${company}'s products/services?`
        ]);
      }, 600);
    });
  }

  _generateMockAdvice(jobData) {
    const { status, dateApplied, company } = jobData;
    const daysSinceApplied = Math.floor((Date.now() - new Date(dateApplied)) / (1000 * 60 * 60 * 24));
    let advice = '';

    if (status === 'Applied' && daysSinceApplied > 7) {
      advice = `It's been ${daysSinceApplied} days since you applied to ${company}. Consider sending a polite follow-up email.`;
    } else if (status === 'Interview Scheduled') {
      advice = `Interview coming up at ${company}! Review your resume, research the company, and prepare STAR method answers.`;
    } else if (status === 'Applied') {
      advice = `Application recently submitted to ${company}. Use this time to research the company and prepare for interviews.`;
    } else if (status === 'Rejected') {
      advice = `Don't be discouraged by the ${company} rejection. Review requirements, identify skill gaps, and apply learnings.`;
    } else if (status === 'Offer') {
      advice = `Congratulations on the offer from ${company}! Review terms carefully and negotiate if appropriate.`;
    } else {
      advice = `Keep tracking your progress with ${company}. Stay proactive and organized in your job search.`;
    }

    return Promise.resolve(advice);
  }
}

module.exports = new AIService();
