const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const { initDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Strip subpath prefix if present (handles proxy path rewriting)
// The deployed site at ranvijay.capricorn.online/prashant/ may forward
// requests with /prashant/ prefix intact. This strips it so routes match.
app.use((req, res, next) => {
  if (req.url.startsWith('/prashant/') || req.url === '/prashant') {
    req.url = req.url.replace(/^\/prashant/, '') || '/';
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
