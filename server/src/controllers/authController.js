const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const {
  validateRegisterPayload,
  validateLoginPayload
} = require('../utils/validation');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
}

async function register(req, res) {
  try {
    const validation = validateRegisterPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { username, email, password } = validation.data;

    const existingUserResult = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUserResult.rows.length > 0) {
      return res
        .status(409)
        .json({ message: 'Username or email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, email, created_at`,
      [username, email, password_hash]
    );

    const user = insertResult.rows[0];
    const token = signToken({ user_id: user.user_id, email: user.email });

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
}

async function login(req, res) {
  try {
    const validation = validateLoginPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { email, password } = validation.data;

    const result = await pool.query(
      `SELECT user_id, username, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userRecord = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [
      userRecord.user_id
    ]);

    const token = signToken({ user_id: userRecord.user_id, email: userRecord.email });

    return res.status(200).json({
      token,
      user: {
        user_id: userRecord.user_id,
        username: userRecord.username,
        email: userRecord.email,
        created_at: userRecord.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
}

async function me(req, res) {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, created_at, last_login FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user.', error: error.message });
  }
}

module.exports = {
  register,
  login,
  me
};
