const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - allow all origins for production compatibility
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// API ROUTES - MUST come before static serving
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', routes: ['auth', 'meals'], port: PORT, timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Meal routes
app.use('/api/meals', mealRoutes);

// Also mount with /prashant prefix (in case proxy doesn't strip it)
app.get('/prashant/api/health', (req, res) => {
  res.json({ status: 'ok', routes: ['auth', 'meals'], port: PORT, timestamp: new Date().toISOString() });
});
app.use('/prashant/api/auth', authRoutes);
app.use('/prashant/api/meals', mealRoutes);

// ============================================
// STATIC FILES - After API routes
// ============================================
const clientBuildPath = path.join(__dirname, '../../client/build');
app.use('/prashant', express.static(clientBuildPath));
app.use(express.static(clientBuildPath));

// React SPA catch-all (skip API paths)
app.get('/prashant/*', (req, res) => {
  if (req.path.startsWith('/prashant/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Initialize database tables on startup
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meal_planner_users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS meals (
        meal_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES meal_planner_users(user_id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,
        meal_type VARCHAR(10) NOT NULL,
        meal_name VARCHAR(150) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, day_of_week, meal_type)
      );
    `);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Database init error:', err.message);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Meal Planner API running on port ${PORT}`);
    console.log('Routes: /api/auth, /api/meals, /prashant/api/auth, /prashant/api/meals');
  });
});
