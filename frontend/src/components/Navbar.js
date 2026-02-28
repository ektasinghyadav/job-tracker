// Navbar component - navigation menu
import React from 'react';

function Navbar({ onNavigate, onLogout, currentPage, user }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Job Tracker
      </div>
      
      <div className="navbar-menu">
        <span style={{ marginRight: '1rem', opacity: 0.8 }}>
          Hi, {user?.name}
        </span>
        
        <button 
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        
        <button 
          className={currentPage === 'jobs' ? 'active' : ''}
          onClick={() => onNavigate('jobs')}
        >
          My Jobs
        </button>
        
        <button 
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;