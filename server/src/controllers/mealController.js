const { pool } = require('../config/database');

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALID_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

// GET /api/meals - Get all meals for the logged-in user
const getMeals = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM meals WHERE user_id = $1 ORDER BY CASE day_of_week WHEN \'Monday\' THEN 1 WHEN \'Tuesday\' THEN 2 WHEN \'Wednesday\' THEN 3 WHEN \'Thursday\' THEN 4 WHEN \'Friday\' THEN 5 WHEN \'Saturday\' THEN 6 WHEN \'Sunday\' THEN 7 END, CASE meal_type WHEN \'Breakfast\' THEN 1 WHEN \'Lunch\' THEN 2 WHEN \'Dinner\' THEN 3 END',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get meals error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/meals - Create or update a meal (upsert)
const createMeal = async (req, res) => {
  const { day_of_week, meal_type, meal_name, description } = req.body;

  try {
    if (!day_of_week || !meal_type || !meal_name) {
      return res.status(400).json({ message: 'Day, meal type, and meal name are required' });
    }

    if (!VALID_DAYS.includes(day_of_week)) {
      return res.status(400).json({ message: 'Invalid day of week' });
    }

    if (!VALID_MEAL_TYPES.includes(meal_type)) {
      return res.status(400).json({ message: 'Invalid meal type. Must be Breakfast, Lunch, or Dinner' });
    }

    if (meal_name.trim().length === 0 || meal_name.length > 150) {
      return res.status(400).json({ message: 'Meal name must be between 1 and 150 characters' });
    }

    // Upsert: insert or update if the slot already exists
    const result = await pool.query(
      `INSERT INTO meals (user_id, day_of_week, meal_type, meal_name, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, day_of_week, meal_type)
       DO UPDATE SET meal_name = $4, description = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, day_of_week, meal_type, meal_name.trim(), description?.trim() || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create meal error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/meals/:id - Update a meal
const updateMeal = async (req, res) => {
  const { id } = req.params;
  const { meal_name, description } = req.body;

  try {
    if (!meal_name) {
      return res.status(400).json({ message: 'Meal name is required' });
    }

    if (meal_name.trim().length === 0 || meal_name.length > 150) {
      return res.status(400).json({ message: 'Meal name must be between 1 and 150 characters' });
    }

    const result = await pool.query(
      'UPDATE meals SET meal_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE meal_id = $3 AND user_id = $4 RETURNING *',
      [meal_name.trim(), description?.trim() || null, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update meal error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/meals/:id - Delete a meal
const deleteMeal = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM meals WHERE meal_id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    console.error('Delete meal error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMeals, createMeal, updateMeal, deleteMeal };
