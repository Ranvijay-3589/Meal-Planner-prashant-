import axios from 'axios';

const api = axios.create({
  baseURL: '/prashant/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/prashant/login';
    }
    return Promise.reject(error);
  }
);

// Meal API functions
export const getMeals = () => api.get('/meals');
export const createMeal = (data) => api.post('/meals', data);
export const updateMeal = (id, data) => api.put(`/meals/${id}`, data);
export const deleteMeal = (id) => api.delete(`/meals/${id}`);

export default api;
