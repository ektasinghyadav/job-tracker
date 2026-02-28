// JobCard component - displays single job application
import React from 'react';

function JobCard({ job, onEdit, onDelete }) {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    const statusMap = {
      'Applied': 'status-applied',
      'Interview Scheduled': 'status-interview',
      'Offer': 'status-offer',
      'Rejected': 'status-rejected',
      'Withdrawn': 'status-rejected'
    };
    return statusMap[status] || 'status-applied';
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
        {job.notes && (
          <p><strong>Notes:</strong> {job.notes}</p>
        )}
      </div>

      <div className="job-actions">
        <button 
          className="btn-edit"
          onClick={() => onEdit(job)}
        >
          Edit
        </button>
        <button 
          className="btn-delete"
          onClick={() => onDelete(job._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default JobCard;