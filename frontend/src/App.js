// Main App component
import React, { useState, useEffect } from 'react';
import './App.css';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Navbar from './components/Navbar';

function App() {
  // State to track which page to show
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      console.log('User already logged in');
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  // Handle login
  const handleLogin = (userData, token) => {
    console.log('Login successful, saving data...');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('login');
  };

  // Navigate to different pages
  const navigate = (page) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
  };

  // Render different pages based on currentPage state
  const renderPage = () => {
    // If not logged in, show login/register only
    if (!isAuthenticated) {
      if (currentPage === 'register') {
        return <Register onNavigate={navigate} onLogin={handleLogin} />;
      }
      return <Login onNavigate={navigate} onLogin={handleLogin} />;
    }

    // If logged in, show dashboard/jobs
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} user={user} />;
      case 'jobs':
        return <Jobs onNavigate={navigate} user={user} />;
      default:
        return <Dashboard onNavigate={navigate} user={user} />;
    }
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <Navbar 
          onNavigate={navigate} 
          onLogout={handleLogout}
          currentPage={currentPage}
          user={user}
        />
      )}
      <div className="main-content">
        {renderPage()}
      </div>
      <footer className="footer-credit">
        made with ❤️ by Ekta
      </footer>
    </div>
  );
}

export default App;

// TODO: Add React Router for better navigation
// TODO: Add loading spinner between page changes
