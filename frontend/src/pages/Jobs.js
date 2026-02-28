// Jobs page - list and manage job applications
import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';
import JobCard from '../components/JobCard';
import JobForm from '../components/JobForm';

function Jobs({ onNavigate, user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Fetch all jobs when component loads
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs...');
      const data = await jobAPI.getAll();
      setJobs(data);
      console.log('Jobs loaded:', data.length);
    } catch (error) {
      console.log('Error fetching jobs:', error);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new job
  const handleAddJob = async (jobData) => {
    try {
      console.log('Adding new job...');
      await jobAPI.create(jobData);
      setShowForm(false);
      fetchJobs(); // Refresh list
      alert('Job application added successfully!');
    } catch (error) {
      console.log('Error adding job:', error);
      alert(error.error || 'Failed to add job. Please try again.');
    }
  };

  // Handle updating job
  const handleUpdateJob = async (jobData) => {
    try {
      console.log('Updating job...');
      await jobAPI.update(editingJob._id, jobData);
      setShowForm(false);
      setEditingJob(null);
      fetchJobs(); // Refresh list
      alert('Job application updated successfully!');
    } catch (error) {
      console.log('Error updating job:', error);
      alert(error.error || 'Failed to update job. Please try again.');
    }
  };

  // Handle deleting job
  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      console.log('Deleting job:', id);
      await jobAPI.delete(id);
      fetchJobs(); // Refresh list
      alert('Job application deleted successfully!');
    } catch (error) {
      console.log('Error deleting job:', error);
      alert(error.error || 'Failed to delete job. Please try again.');
    }
  };

  // Open form for editing
  const handleEditClick = (job) => {
    console.log('Editing job:', job.company);
    setEditingJob(job);
    setShowForm(true);
  };

  // Open form for adding new
  const handleAddClick = () => {
    console.log('Opening form for new job');
    setEditingJob(null);
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    console.log('Closing form');
    setShowForm(false);
    setEditingJob(null);
  };

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1>My Job Applications</h1>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add New Job
        </button>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <p>No job applications yet!</p>
          <p>Click "Add New Job" to track your first application.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onEdit={handleEditClick}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

      {/* Job Form Modal */}
      {showForm && (
        <JobForm
          job={editingJob}
          onSave={editingJob ? handleUpdateJob : handleAddJob}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default Jobs;

// TODO: Add search functionality
// TODO: Add filter by status
// TODO: Add sorting options