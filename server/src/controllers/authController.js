const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (username.length < 4) {
      return res
        .status(400)
        .json({ message: 'Username must be at least 4 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with an uppercase letter and a number',
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email, created_at',
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id);

    res.status(201).json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last_login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    const token = generateToken(user.user_id);

    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, created_at, last_login FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      last_login: user.last_login,
    });
  } catch (err) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
