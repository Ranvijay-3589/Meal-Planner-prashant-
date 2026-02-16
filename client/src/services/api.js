import axios from 'axios';

const DEFAULT_API_URL = 'https://ranvijay.capricorn.online/prashant/api';
const configuredApiUrl = process.env.REACT_APP_API_URL || DEFAULT_API_URL;

const api = axios.create({
  baseURL: configuredApiUrl.replace(/\/+$/, '')
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
