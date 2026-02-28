// Dashboard page component - shows statistics
import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';

function Dashboard({ onNavigate, user }) {
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviews: 0,
    offers: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics when component loads
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching dashboard statistics...');
      const data = await jobAPI.getStats();
      setStats(data);
      console.log('Stats loaded:', data);
    } catch (error) {
      console.log('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}! </h1>
      
      {loading ? (
        <p>Loading statistics...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Applications</h3>
              <p>{stats.total}</p>
            </div>
            
            <div className="stat-card">
              <h3>Applied</h3>
              <p style={{ color: '#3498db' }}>{stats.applied}</p>
            </div>
            
            <div className="stat-card">
              <h3>Interviews</h3>
              <p style={{ color: '#f39c12' }}>{stats.interviews}</p>
            </div>
            
            <div className="stat-card">
              <h3>Offers</h3>
              <p style={{ color: '#2ecc71' }}>{stats.offers}</p>
            </div>
            
            <div className="stat-card">
              <h3>Rejected</h3>
              <p style={{ color: '#e74c3c' }}>{stats.rejected}</p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('jobs')}
              style={{ maxWidth: '300px' }}
            >
              View All Applications
            </button>
          </div>
        </>
      )}

      {!loading && stats.total === 0 && (
        <div className="empty-state">
          <p>No job applications yet!</p>
          <p>Click "My Jobs" in the menu to add your first application.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

// TODO: Add charts/graphs for better visualization
// TODO: Add recent applications list