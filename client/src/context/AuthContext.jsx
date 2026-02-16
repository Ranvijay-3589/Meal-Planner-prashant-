import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  async function fetchCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    async function bootstrapAuth() {
      if (!token) {
        setLoading(false);
        return;
      }
      await fetchCurrentUser();
      setLoading(false);
    }

    bootstrapAuth();
  }, [token]);

  async function register(payload) {
    const response = await api.post('/auth/register', payload);
    const nextToken = response.data.token;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(response.data.user);
    return response.data.user;
  }

  async function login(payload) {
    const response = await api.post('/auth/login', payload);
    const nextToken = response.data.token;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(response.data.user);
    return response.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, register, login, logout, fetchCurrentUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
