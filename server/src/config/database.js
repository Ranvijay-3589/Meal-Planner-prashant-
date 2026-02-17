const { Pool } = require('pg');
require('dotenv').config();

const SCHEMA = process.env.DB_SCHEMA || 'meal_planner';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', (client) => {
  client.query(`SET search_path TO ${SCHEMA}, public`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${SCHEMA}, public`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SCHEMA}.meals (
        meal_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES ${SCHEMA}.users(user_id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
        meal_type VARCHAR(10) NOT NULL CHECK (meal_type IN ('Breakfast','Lunch','Dinner')),
        meal_name VARCHAR(150) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, day_of_week, meal_type)
      );
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
