// server/index.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./passport-setup');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(session({
  secret: process.env.COOKIE_KEY,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// --- API and Auth Routes ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard'); 
  }
);

app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});