// JobCard component — Sprint 6: added AI Tools toggle
import React, { useState } from 'react';
import AIPanel from './AIPanel';

function JobCard({ job, onEdit, onDelete }) {
  const [showAI, setShowAI] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const map = {
      'Applied':             'status-applied',
      'Interview Scheduled': 'status-interview',
      'Offer':               'status-offer',
      'Rejected':            'status-rejected',
      'Withdrawn':           'status-rejected'
    };
    return map[status] || 'status-applied';
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title">
          <h3>{job.position}</h3>
          <p>{job.company}</p>
        </div>
        <span className={`job-status ${getStatusClass(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="job-details">
        <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
        <p><strong>Date Applied:</strong> {formatDate(job.dateApplied)}</p>
        {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
        {job.jobUrl && (
          <p>
            <strong>Job Link:</strong>{' '}
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
              View Posting
            </a>
          </p>
        )}
        {job.notes && <p><strong>Notes:</strong> {job.notes}</p>}
      </div>

      <div className="job-actions">
        <button className="btn-edit"   onClick={() => onEdit(job)}>Edit</button>
        <button className="btn-delete" onClick={() => onDelete(job._id)}>Delete</button>
        <button
          className={`btn-ai ${showAI ? 'btn-ai-active' : ''}`}
          onClick={() => setShowAI(prev => !prev)}
        >
          {showAI ? 'Close AI' : '✦ AI Tools'}
        </button>
      </div>

      {showAI && <AIPanel job={job} />}
    </div>
  );
}

export default JobCard;
