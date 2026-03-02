// AIPanel — Sprint 6: AI tools panel for a single job
// Shows 4 AI features: Next Step Advice, Resume Bullets, Interview Prep, Likely Questions
// Each feature makes a real Hugging Face API call via the backend

import React, { useState } from 'react';
import { aiAPI } from '../services/api';

// The 4 AI features available for each job
const FEATURES = [
  {
    id: 'advice',
    label: 'Next Step Advice',
    needsDescription: false,
    hint: 'Personalized advice based on your current application status'
  },
  {
    id: 'questions',
    label: 'Likely Questions',
    needsDescription: false,
    hint: 'Predicted interview questions for this company and role'
  },
  {
    id: 'bullets',
    label: 'Resume Bullets',
    needsDescription: true,
    hint: 'AI-generated resume bullet points tailored to the job description'
  },
  {
    id: 'prep',
    label: 'Interview Prep',
    needsDescription: true,
    hint: 'Full interview preparation guide: topics, questions, company research'
  }
];

function AIPanel({ job }) {
  const [activeFeature, setActiveFeature] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);   // { type, content }
  const [error, setError]                 = useState('');

  const hasDescription = job.jobDescription && job.jobDescription.trim().length > 10;

  const handleFeature = async (featureId) => {
    // Clicking the same active tab closes it
    if (activeFeature === featureId && !loading) {
      setActiveFeature(null);
      setResult(null);
      setError('');
      return;
    }

    setActiveFeature(featureId);
    setLoading(true);
    setResult(null);
    setError('');

    try {
      let data;
      switch (featureId) {
        case 'advice':
          data = await aiAPI.getAdvice(job._id);
          setResult({ type: 'advice', content: data.advice });
          break;

        case 'bullets':
          data = await aiAPI.getResumeBullets(job.jobDescription, '');
          setResult({ type: 'bullets', content: data.bullets });
          break;

        case 'prep':
          data = await aiAPI.getInterviewPrep(job.jobDescription, job.company);
          setResult({ type: 'prep', content: data.prep });
          break;

        case 'questions':
          data = await aiAPI.getQuestions(job.company, job.position);
          setResult({ type: 'questions', content: data.questions });
          break;

        default:
          break;
      }
    } catch (err) {
      setError(err.error || 'AI request failed. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  // ── Result renderers ───────────────────────────────────────

  const renderAdvice = (text) => (
    <p className="ai-advice-text">{text}</p>
  );

  const renderBullets = (bullets) => (
    <ol className="ai-bullet-list">
      {bullets.map((b, i) => (
        <li key={i} className="ai-bullet-item">{b}</li>
      ))}
    </ol>
  );

  const renderQuestions = (questions) => (
    <ol className="ai-bullet-list">
      {questions.map((q, i) => (
        <li key={i} className="ai-bullet-item">{q}</li>
      ))}
    </ol>
  );

  const renderPrep = (prep) => (
    <div className="ai-prep-grid">
      <div className="ai-prep-section">
        <h4 className="ai-prep-heading">Technical Topics</h4>
        <ul className="ai-prep-list">
          {prep.technicalTopics?.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
      <div className="ai-prep-section">
        <h4 className="ai-prep-heading">Behavioral Questions</h4>
        <ul className="ai-prep-list">
          {prep.behavioralTopics?.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
      <div className="ai-prep-section">
        <h4 className="ai-prep-heading">Company Research</h4>
        <ul className="ai-prep-list">
          {prep.companyResearch?.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
      {prep.keyTakeaways && (
        <div className="ai-prep-section ai-prep-takeaway">
          <h4 className="ai-prep-heading">Key Takeaway</h4>
          <p>{prep.keyTakeaways}</p>
        </div>
      )}
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    switch (result.type) {
      case 'advice':    return renderAdvice(result.content);
      case 'bullets':   return renderBullets(result.content);
      case 'questions': return renderQuestions(result.content);
      case 'prep':      return renderPrep(result.content);
      default:          return null;
    }
  };

  // ── Feature hint text ──────────────────────────────────────
  const activeHint = FEATURES.find(f => f.id === activeFeature)?.hint;

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span className="ai-panel-badge">AI</span>
        <span className="ai-panel-title">AI Tools for {job.company}</span>
      </div>

      {/* Feature tabs */}
      <div className="ai-tabs">
        {FEATURES.map((feature) => {
          const disabled = feature.needsDescription && !hasDescription;
          return (
            <button
              key={feature.id}
              className={`ai-tab ${activeFeature === feature.id ? 'ai-tab-active' : ''} ${disabled ? 'ai-tab-disabled' : ''}`}
              onClick={() => !disabled && handleFeature(feature.id)}
              title={disabled ? 'Add a job description to this application to use this feature' : feature.hint}
              disabled={loading && activeFeature !== feature.id}
            >
              {feature.label}
            </button>
          );
        })}
      </div>

      {/* No description warning for features that need it */}
      {!hasDescription && (
        <p className="ai-no-desc">
          Tip: Add a job description when editing this application to unlock Resume Bullets and Interview Prep.
        </p>
      )}

      {/* Result area */}
      {activeFeature && (
        <div className="ai-result-box">
          {loading ? (
            <div className="ai-loading">
              <span className="ai-spinner" />
              Generating with AI — this takes a few seconds...
            </div>
          ) : error ? (
            <p className="ai-error">{error}</p>
          ) : result ? (
            <>
              <p className="ai-result-hint">{activeHint}</p>
              {renderResult()}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default AIPanel;
