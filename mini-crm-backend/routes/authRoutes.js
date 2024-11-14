const express = require('express');
const router = express.Router();
const passport = require('../auth'); 
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in successfully.', user: { email: req.user.email, name: req.user.name } });
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed.', error: err });
    }
    res.json({ message: 'Logged out successfully.' });
  });
});

router.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: { email: req.user.email, name: req.user.name } });
  } else {
    res.json({ isAuthenticated: false });
  }
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000'); 
  }
);

module.exports = router;
