const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (username.length < 4) {
      return res.status(400).json({ message: 'Username must be at least 4 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }

    const existingUser = await pool.query(
      'SELECT user_id FROM meal_planner_users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO meal_planner_users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email, created_at',
      [username, email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id);

    res.status(201).json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await pool.query(
      'SELECT * FROM meal_planner_users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await pool.query(
      'UPDATE meal_planner_users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    const token = generateToken(user.user_id);

    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    await pool.query(
      'UPDATE meal_planner_users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, created_at, last_login FROM meal_planner_users WHERE user_id = $1',
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
      createdAt: user.created_at,
      lastLogin: user.last_login,
    });
  } catch (err) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
