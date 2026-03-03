// Dashboard page — Sprint 5: Full analytics dashboard
// Shows: application summary, application progress, insights, recent applications

import React, { useState, useEffect } from 'react';
import { jobAPI, analyticsAPI } from '../services/api';

function Dashboard({ onNavigate, user }) {
  const [stats, setStats]       = useState(null);
  const [velocity, setVelocity] = useState(null);
  const [insights, setInsights] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Load all dashboard data in parallel — if one fails the others still render
  const loadDashboard = async () => {
    setLoading(true);
    const [statsRes, velocityRes, insightsRes, jobsRes] = await Promise.allSettled([
      jobAPI.getStats(),
      analyticsAPI.getVelocity(),
      analyticsAPI.getInsights(),
      jobAPI.getAll()
    ]);

    if (statsRes.status === 'fulfilled')    setStats(statsRes.value);
    if (velocityRes.status === 'fulfilled') setVelocity(velocityRes.value);
    if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value);
    if (jobsRes.status === 'fulfilled')     setRecentJobs(jobsRes.value.slice(0, 5));

    setLoading(false);
  };

  // ── Helper: status badge label + color ───────────────────
  const getStatusStyle = (status) => {
    const map = {
      'Applied':            { background: '#3498db', color: 'white' },
      'Interview Scheduled':{ background: '#f39c12', color: 'white' },
      'Offer':              { background: '#2ecc71', color: 'white' },
      'Rejected':           { background: '#e74c3c', color: 'white' },
      'Withdrawn':          { background: '#95a5a6', color: 'white' }
    };
    return map[status] || { background: '#ccc', color: 'white' };
  };

  // ── Helper: days since a date ─────────────────────────────
  const daysSince = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // ── Helper: progress bar ──────────────────────────────────
  const ProgressBar = ({ value, color }) => (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Welcome back, {user?.name}!</h1>
        <div className="loading-state">Loading your analytics...</div>
      </div>
    );
  }

  const hasJobs = stats && stats.total > 0;

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}!</h1>
      <p className="dashboard-subtitle">Your job search at a glance</p>

      {/* ── Section 1: Application Summary ─────────────────── */}
      <section className="dash-section">
        <h2 className="section-title">Application Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total</h3>
            <p>{stats?.total ?? 0}</p>
          </div>
          <div className="stat-card">
            <h3>Applied</h3>
            <p style={{ color: '#3498db' }}>{stats?.applied ?? 0}</p>
          </div>
          <div className="stat-card">
            <h3>Interviews</h3>
            <p style={{ color: '#f39c12' }}>{stats?.interviews ?? 0}</p>
          </div>
          <div className="stat-card">
            <h3>Offers</h3>
            <p style={{ color: '#2ecc71' }}>{stats?.offers ?? 0}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <p style={{ color: '#e74c3c' }}>{stats?.rejected ?? 0}</p>
          </div>
        </div>
      </section>

      {!hasJobs ? (
        <div className="empty-state">
          <p>No applications yet. Add your first job to see analytics!</p>
          <button className="btn btn-primary" style={{ maxWidth: 240, marginTop: '1rem' }}
            onClick={() => onNavigate('jobs')}>
            Add First Application
          </button>
        </div>
      ) : (
        <>
          {/* ── Section 2: Application Progress ────────────── */}
          {velocity && (
            <section className="dash-section">
              <h2 className="section-title">Application Progress</h2>
              <div className="velocity-grid">

                {/* Conversion rates */}
                <div className="analytics-card">
                  <h3 className="card-subtitle">Conversion Rates</h3>

                  <div className="metric-row">
                    <span className="metric-label">Interview Rate</span>
                    <span className="metric-value" style={{ color: '#f39c12' }}>
                      {velocity.interviewConversionRate}%
                    </span>
                  </div>
                  <ProgressBar value={velocity.interviewConversionRate} color="#f39c12" />

                  <div className="metric-row" style={{ marginTop: '1rem' }}>
                    <span className="metric-label">Offer Rate</span>
                    <span className="metric-value" style={{ color: '#2ecc71' }}>
                      {velocity.offerConversionRate}%
                    </span>
                  </div>
                  <ProgressBar value={velocity.offerConversionRate} color="#2ecc71" />

                  <div className="metric-row" style={{ marginTop: '1rem' }}>
                    <span className="metric-label">Rejection Rate</span>
                    <span className="metric-value" style={{ color: '#e74c3c' }}>
                      {velocity.rejectionRate}%
                    </span>
                  </div>
                  <ProgressBar value={velocity.rejectionRate} color="#e74c3c" />
                </div>

                {/* Application status numbers */}
                <div className="analytics-card">
                  <h3 className="card-subtitle">Application Status</h3>
                  <div className="health-number-grid">
                    <div className="health-number">
                      <span className="health-number-val">{velocity.averageResponseTime}</span>
                      <span className="health-number-label">Avg. Response (days)</span>
                    </div>
                    <div className="health-number">
                      <span className="health-number-val" style={{ color: '#3498db' }}>
                        {velocity.activeApplications}
                      </span>
                      <span className="health-number-label">Active Applications</span>
                    </div>
                    <div className="health-number">
                      <span className="health-number-val"
                        style={{ color: velocity.staleApplications > 0 ? '#e74c3c' : '#2ecc71' }}>
                        {velocity.staleApplications}
                      </span>
                      <span className="health-number-label">Stale (14+ days)</span>
                    </div>
                  </div>
                  {velocity.staleApplications > 0 && (
                    <p className="stale-warning">
                      {velocity.staleApplications} application{velocity.staleApplications > 1 ? 's' : ''} with no response in 14+ days — consider following up.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── Section 3: Insights & Actions ──────────────── */}
          {insights && (
            <section className="dash-section">
              <h2 className="section-title">Insights & Actions</h2>
              <div className="insights-grid">

                {/* Priorities */}
                {insights.topPriorities?.length > 0 && (
                  <div className="analytics-card insight-priorities">
                    <h3 className="card-subtitle">Top Priorities</h3>
                    <ul className="insight-list">
                      {insights.topPriorities.map((p, i) => (
                        <li key={i} className="insight-item">
                          <span className="insight-dot dot-red" />
                          <div>
                            <div className="insight-msg">{p.message}</div>
                            <div className="insight-action">{p.action}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Actions */}
                {insights.nextActions?.length > 0 && (
                  <div className="analytics-card insight-actions">
                    <h3 className="card-subtitle">Next Actions</h3>
                    <ul className="insight-list">
                      {insights.nextActions.map((a, i) => (
                        <li key={i} className="insight-item">
                          <span className="insight-dot dot-blue" />
                          <span className="insight-msg">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strengths */}
                {insights.strengths?.length > 0 && (
                  <div className="analytics-card insight-strengths">
                    <h3 className="card-subtitle">Strengths</h3>
                    <ul className="insight-list">
                      {insights.strengths.map((s, i) => (
                        <li key={i} className="insight-item">
                          <span className="insight-dot dot-green" />
                          <span className="insight-msg">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {insights.improvements?.length > 0 && (
                  <div className="analytics-card insight-improvements">
                    <h3 className="card-subtitle">Areas to Improve</h3>
                    <ul className="insight-list">
                      {insights.improvements.map((item, i) => (
                        <li key={i} className="insight-item">
                          <span className="insight-dot dot-orange" />
                          <span className="insight-msg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Section 4: Recent Applications ─────────────── */}
          {recentJobs.length > 0 && (
            <section className="dash-section">
              <div className="section-header-row">
                <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Applications</h2>
                <button className="btn-link" onClick={() => onNavigate('jobs')}>
                  View all →
                </button>
              </div>
              <div className="analytics-card" style={{ marginTop: '1rem' }}>
                {recentJobs.map((job, i) => (
                  <div key={job._id}
                    className={`recent-item ${i < recentJobs.length - 1 ? 'recent-item-border' : ''}`}>
                    <div className="recent-info">
                      <span className="recent-company">{job.company}</span>
                      <span className="recent-position">{job.position}</span>
                      {job.location && (
                        <span className="recent-location">{job.location}</span>
                      )}
                    </div>
                    <div className="recent-meta">
                      <span className="job-status" style={getStatusStyle(job.status)}>
                        {job.status}
                      </span>
                      <span className="recent-days">
                        {daysSince(job.dateApplied)}d ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button className="btn btn-primary" style={{ maxWidth: 280 }}
          onClick={() => onNavigate('jobs')}>
          Manage Applications
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
