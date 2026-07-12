import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from sessionStorage on mount and background sync
  useEffect(() => {
    const stored = sessionStorage.getItem('ca_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      
      // Background sync to fetch fresh data (e.g. assignedCA updates)
      API.get('/auth/me')
        .then(res => {
          const merged = { ...parsed, ...res.data };
          setUser(merged);
          sessionStorage.setItem('ca_user', JSON.stringify(merged));
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    sessionStorage.setItem('ca_user', JSON.stringify(data));
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    setUser(data);
    sessionStorage.setItem('ca_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ca_user');
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    setUser(merged);
    sessionStorage.setItem('ca_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
