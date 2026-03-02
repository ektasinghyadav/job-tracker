// API service - handles all backend communication
import axios from 'axios';

// Base URL for backend API
// In development: reads from frontend/.env (REACT_APP_API_URL=http://localhost:5000/api)
// In production: set REACT_APP_API_URL in your Vercel dashboard
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Auth API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('Registering user:', userData.email);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Registration successful');
      return response.data;
    } catch (error) {
      console.log('Registration error:', error.response?.data);
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Logging in:', credentials.email);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('Login successful');
      return response.data;
    } catch (error) {
      console.log('Login error:', error.response?.data);
      throw error.response?.data || { error: 'Login failed' };
    }
  }
};

// Job API calls
export const jobAPI = {
  // Get all jobs
  getAll: async () => {
    try {
      console.log('Fetching all jobs...');
      const response = await axios.get(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      console.log(`Fetched ${response.data.length} jobs`);
      return response.data;
    } catch (error) {
      console.log('Error fetching jobs:', error.response?.data);
      throw error.response?.data || { error: 'Failed to fetch jobs' };
    }
  },

  // Get single job
  getOne: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.log('Error fetching job:', error.response?.data);
      throw error.response?.data || { error: 'Failed to fetch job' };
    }
  },

  // Create new job
  create: async (jobData) => {
    try {
      console.log('Creating job:', jobData.company, jobData.position);
      const response = await axios.post(`${API_URL}/jobs`, jobData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      console.log('Job created successfully');
      return response.data;
    } catch (error) {
      console.log('Error creating job:', error.response?.data);
      throw error.response?.data || { error: 'Failed to create job' };
    }
  },

  // Update job
  update: async (id, jobData) => {
    try {
      console.log('Updating job:', id);
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      console.log('Job updated successfully');
      return response.data;
    } catch (error) {
      console.log('Error updating job:', error.response?.data);
      throw error.response?.data || { error: 'Failed to update job' };
    }
  },

  // Delete job
  delete: async (id) => {
    try {
      console.log('Deleting job:', id);
      const response = await axios.delete(`${API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      console.log('Job deleted successfully');
      return response.data;
    } catch (error) {
      console.log('Error deleting job:', error.response?.data);
      throw error.response?.data || { error: 'Failed to delete job' };
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      console.log('Fetching statistics...');
      const response = await axios.get(`${API_URL}/jobs/stats/summary`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.log('Error fetching stats:', error.response?.data);
      throw error.response?.data || { error: 'Failed to fetch statistics' };
    }
  }
};

// AI API calls — Sprint 6
export const aiAPI = {
  // Personalized next-step advice for a specific job
  getAdvice: async (jobId) => {
    try {
      const response = await axios.post(`${API_URL}/ai/advice`, { jobId }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get advice' };
    }
  },

  // Resume bullet points tailored to a job description
  getResumeBullets: async (jobDescription, userExperience = '') => {
    try {
      const response = await axios.post(`${API_URL}/ai/resume-bullets`,
        { jobDescription, userExperience },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to generate resume bullets' };
    }
  },

  // Interview preparation guide
  getInterviewPrep: async (jobDescription, company) => {
    try {
      const response = await axios.post(`${API_URL}/ai/interview-prep`,
        { jobDescription, company },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to generate interview prep' };
    }
  },

  // Predicted interview questions for a company and role
  getQuestions: async (company, position) => {
    try {
      const response = await axios.post(`${API_URL}/ai/questions`,
        { company, position },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to predict questions' };
    }
  },

  // Semantic search over job descriptions
  search: async (query, limit = 5) => {
    try {
      const response = await axios.post(`${API_URL}/ai/search`,
        { query, limit },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Search failed' };
    }
  }
};

// Analytics API calls — Sprint 5
export const analyticsAPI = {
  // Pipeline velocity: conversion rates, response times, stale count
  getVelocity: async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/velocity`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch velocity' };
    }
  },

  // Actionable insights: priorities, strengths, improvements, next actions
  getInsights: async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/insights`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch insights' };
    }
  },

  // Health score for a single job application
  getHealth: async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/health/${jobId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch health score' };
    }
  },

  // Offer probability prediction for a single job
  predict: async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/predict/${jobId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch prediction' };
    }
  }
};