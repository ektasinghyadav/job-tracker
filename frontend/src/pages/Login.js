// Login page component
import React, { useState } from 'react';
import { authAPI } from '../services/api';

function Login({ onNavigate, onLogin }) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login...');

    try {
      // Call login API
      const response = await authAPI.login({ email, password });
      
      // Save token and user data
      onLogin(response.user, response.token);
      
      console.log('Login successful!');
    } catch (err) {
      console.log('Login failed:', err);
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Job Tracker - Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')}>
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

// TODO: Add "Remember me" checkbox
// TODO: Add forgot password link