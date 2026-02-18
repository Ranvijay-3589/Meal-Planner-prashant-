const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/prashant/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/prashant/api/meals', mealRoutes);
app.use('/api/meals', mealRoutes);

// Serve React static files
const clientBuildPath = path.join(__dirname, '../../client/build');
app.use('/prashant', express.static(clientBuildPath));

// Handle React routing (skip API paths)
app.get('/prashant/*', (req, res) => {
  if (req.path.startsWith('/prashant/api')) {
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

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database init error:', err.message);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
