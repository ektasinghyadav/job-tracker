// JobForm component - modal form for adding/editing jobs
import React, { useState, useEffect } from 'react';

function JobForm({ job, onSave, onClose }) {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: 'Remote',
    status: 'Applied',
    dateApplied: '',
    notes: '',
    jobUrl: '',
    salary: '',
    jobDescription: ''
  });

  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company || '',
        position: job.position || '',
        location: job.location || 'Remote',
        status: job.status || 'Applied',
        dateApplied: job.dateApplied ? job.dateApplied.split('T')[0] : '',
        notes: job.notes || '',
        jobUrl: job.jobUrl || '',
        salary: job.salary || '',
        jobDescription: job.jobDescription || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dateApplied: today }));
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.position) {
      alert('Company and Position are required!');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{job ? 'Edit Job Application' : 'Add New Job Application'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Google, Microsoft"
              required
            />
          </div>

          <div className="form-group">
            <label>Position *</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Remote, Bangalore"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Applied">Applied</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date Applied</label>
            <input
              type="date"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Salary (Optional)</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., ₹8-10 LPA"
            />
          </div>

          <div className="form-group">
            <label>Job URL (Optional)</label>
            <input
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>
              Job Description (Optional)
              <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>
                — used for AI suggestions in Sprint 3
              </span>
            </label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Paste the full job description here. This will be used to generate tailored resume bullets and interview prep."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Interview prep, contacts, follow-up dates, etc."
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {job ? 'Update Job' : 'Add Job'}
          </button>

          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default JobForm;
