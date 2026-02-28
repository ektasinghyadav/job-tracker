const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
}));

// Login existing user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
}));

module.exports = router;
