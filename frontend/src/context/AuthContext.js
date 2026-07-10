import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount and background sync
  useEffect(() => {
    const stored = localStorage.getItem('ca_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      
      // Background sync to fetch fresh data (e.g. assignedCA updates)
      API.get('/auth/me')
        .then(res => {
          const merged = { ...parsed, ...res.data };
          setUser(merged);
          localStorage.setItem('ca_user', JSON.stringify(merged));
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  // Re-sync when ProfilePage updates localStorage
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('ca_user');
      if (stored) setUser(JSON.parse(stored));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('ca_user', JSON.stringify(data));
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    setUser(data);
    localStorage.setItem('ca_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ca_user');
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem('ca_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
