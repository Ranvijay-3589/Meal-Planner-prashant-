const express = require('express');
const router = express.Router();
const { getMeals, createMeal, updateMeal, deleteMeal } = require('../controllers/mealController');
const auth = require('../middleware/auth');

// All meal routes require authentication
router.use(auth);

router.get('/', getMeals);
router.post('/', createMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;
