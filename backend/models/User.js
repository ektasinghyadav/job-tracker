// User model - defines how user data is stored in database
const mongoose = require('mongoose');

// Define the schema (structure) for a user
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true, // No duplicate emails
    lowercase: true
  },
  password: {
    type: String,
    required: true
    // We'll hash this before saving (for security)
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set to current date
  }
});

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;