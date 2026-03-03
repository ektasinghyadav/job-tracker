// Jobs page — Sprint 6: added semantic search bar + AI Tools on each card
import React, { useState, useEffect } from 'react';
import { jobAPI, aiAPI } from '../services/api';
import JobCard from '../components/JobCard';
import JobForm from '../components/JobForm';

function Jobs({ onNavigate, user }) {
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editingJob, setEditingJob]   = useState(null);

  // Semantic search state
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode]       = useState(null);   // 'vector' | 'text' | null
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError]     = useState('');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobAPI.getAll();
      setJobs(data);
    } catch (error) {
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Semantic search ────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setIsSearchActive(true);

    try {
      const data = await aiAPI.search(searchQuery.trim(), 10);
      setSearchResults(data.results);
      setSearchMode(data.mode);
    } catch (err) {
      setSearchError(err.error || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchMode(null);
    setIsSearchActive(false);
    setSearchError('');
  };

  // ── CRUD handlers ──────────────────────────────────────────
  const handleAddJob = async (jobData) => {
    try {
      await jobAPI.create(jobData);
      setShowForm(false);
      fetchJobs();
      alert('Job application added successfully!');
    } catch (error) {
      alert(error.error || 'Failed to add job. Please try again.');
    }
  };

  const handleUpdateJob = async (jobData) => {
    try {
      await jobAPI.update(editingJob._id, jobData);
      setShowForm(false);
      setEditingJob(null);
      fetchJobs();
      if (isSearchActive) clearSearch();   // Reset search so updated job shows correctly
      alert('Job application updated successfully!');
    } catch (error) {
      alert(error.error || 'Failed to update job. Please try again.');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      await jobAPI.delete(id);
      fetchJobs();
      if (isSearchActive) clearSearch();
      alert('Job application deleted successfully!');
    } catch (error) {
      alert(error.error || 'Failed to delete job. Please try again.');
    }
  };

  const handleEditClick = (job) => { setEditingJob(job); setShowForm(true); };
  const handleAddClick  = () => { setEditingJob(null); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditingJob(null); };

  // Jobs to display — search results or all jobs
  const displayJobs = isSearchActive ? searchResults : jobs;

  return (
    <div className="jobs-page">

      {/* ── Search bar ──────────────────────────────────────── */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Search by skills, role, company, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-btn" type="submit" disabled={searchLoading}>
          {searchLoading ? 'Searching...' : 'Search'}
        </button>
        {isSearchActive && (
          <button className="search-clear" type="button" onClick={clearSearch}>
            Clear
          </button>
        )}
      </form>

      {/* Search status badges */}
      {isSearchActive && !searchLoading && (
        <div className="search-status">
          {searchError ? (
            <span className="search-error-msg">{searchError}</span>
          ) : (
            <>
              <span className="search-count">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </span>
              <span className={`search-mode-badge ${searchMode === 'vector' ? 'badge-vector' : 'badge-text'}`}>
                {searchMode === 'vector' ? '⚡ Smart Match' : '🔤 Keyword Match'}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="jobs-header">
        <h1>My Job Applications</h1>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add New Job
        </button>
      </div>

      {/* ── Jobs list ───────────────────────────────────────── */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : displayJobs.length === 0 ? (
        <div className="empty-state">
          {isSearchActive
            ? <p>No results found for "{searchQuery}". Try different keywords.</p>
            : <><p>No job applications yet!</p><p>Click "Add New Job" to track your first application.</p></>
          }
        </div>
      ) : (
        <div className="jobs-grid">
          {displayJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onEdit={handleEditClick}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

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
