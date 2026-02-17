import React, { useState, useEffect, useCallback } from 'react';
import { getMeals, createMeal, updateMeal, deleteMeal } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const MealPlanner = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: '',
    meal_type: '',
    meal_name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      const res = await getMeals();
      setMeals(res.data);
    } catch (err) {
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const getMealForSlot = (day, mealType) => {
    return meals.find(m => m.day_of_week === day && m.meal_type === mealType);
  };

  const handleAddClick = (day, mealType) => {
    setEditingMeal(null);
    setFormData({
      day_of_week: day,
      meal_type: mealType,
      meal_name: '',
      description: '',
    });
    setShowModal(true);
    setError('');
  };

  const handleEditClick = (meal) => {
    setEditingMeal(meal);
    setFormData({
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      meal_name: meal.meal_name,
      description: meal.description || '',
    });
    setShowModal(true);
    setError('');
  };

  const handleDeleteClick = async (meal) => {
    if (!window.confirm(`Delete "${meal.meal_name}" from ${meal.day_of_week} ${meal.meal_type}?`)) {
      return;
    }
    try {
      await deleteMeal(meal.meal_id);
      setMeals(prev => prev.filter(m => m.meal_id !== meal.meal_id));
    } catch (err) {
      setError('Failed to delete meal');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meal_name.trim()) {
      setError('Meal name is required');
      return;
    }
    setSaving(true);
    setError('');

    try {
      if (editingMeal) {
        const res = await updateMeal(editingMeal.meal_id, {
          meal_name: formData.meal_name,
          description: formData.description,
        });
        setMeals(prev => prev.map(m => m.meal_id === editingMeal.meal_id ? res.data : m));
      } else {
        const res = await createMeal(formData);
        // Replace existing meal for that slot or add new
        setMeals(prev => {
          const filtered = prev.filter(
            m => !(m.day_of_week === formData.day_of_week && m.meal_type === formData.meal_type)
          );
          return [...filtered, res.data];
        });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save meal');
    } finally {
      setSaving(false);
    }
  };

  const getMealTypeIcon = (type) => {
    switch (type) {
      case 'Breakfast': return '\u2615';
      case 'Lunch': return '\uD83C\uDF5C';
      case 'Dinner': return '\uD83C\uDF5D';
      default: return '';
    }
  };

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'Breakfast': return '#fff3cd';
      case 'Lunch': return '#d1ecf1';
      case 'Dinner': return '#d4edda';
      default: return '#f8f9fa';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow mt-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Weekly Meal Plan</h4>
          <span className="badge bg-primary">{meals.length} meals planned</span>
        </div>

        {error && !showModal && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Weekly Grid */}
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="table-primary text-center">
                <th style={{ width: '100px' }}>Meal</th>
                {DAYS.map(day => (
                  <th key={day} style={{ minWidth: '120px' }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map(mealType => (
                <tr key={mealType}>
                  <td
                    className="fw-bold text-center"
                    style={{ backgroundColor: getMealTypeColor(mealType) }}
                  >
                    <div>{getMealTypeIcon(mealType)}</div>
                    <small>{mealType}</small>
                  </td>
                  {DAYS.map(day => {
                    const meal = getMealForSlot(day, mealType);
                    return (
                      <td
                        key={`${day}-${mealType}`}
                        className="p-2 text-center"
                        style={{ backgroundColor: meal ? getMealTypeColor(mealType) : '#f8f9fa', verticalAlign: 'middle' }}
                      >
                        {meal ? (
                          <div>
                            <div className="fw-semibold small mb-1" title={meal.meal_name}>
                              {meal.meal_name.length > 20
                                ? meal.meal_name.substring(0, 20) + '...'
                                : meal.meal_name}
                            </div>
                            {meal.description && (
                              <div className="text-muted small mb-1" title={meal.description} style={{ fontSize: '0.75rem' }}>
                                {meal.description.length > 25
                                  ? meal.description.substring(0, 25) + '...'
                                  : meal.description}
                              </div>
                            )}
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary btn-sm py-0 px-1"
                                onClick={() => handleEditClick(meal)}
                                title="Edit"
                                style={{ fontSize: '0.7rem' }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm py-0 px-1"
                                onClick={() => handleDeleteClick(meal)}
                                title="Delete"
                                style={{ fontSize: '0.7rem' }}
                              >
                                Del
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleAddClick(day, mealType)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            + Add
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Meal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
          <div className="modal d-block fade show" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingMeal ? 'Edit Meal' : 'Add Meal'}
                    {' - '}
                    <span className="text-primary">{formData.day_of_week}</span>
                    {' '}
                    <span className="text-muted">({formData.meal_type})</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="meal_name" className="form-label">
                        Meal Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="meal_name"
                        value={formData.meal_name}
                        onChange={(e) =>
                          setFormData({ ...formData, meal_name: e.target.value })
                        }
                        placeholder="e.g., Oatmeal with fruits"
                        maxLength={150}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        Description <span className="text-muted">(optional)</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="2"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Add notes or ingredients..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : editingMeal ? 'Update Meal' : 'Add Meal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MealPlanner;
