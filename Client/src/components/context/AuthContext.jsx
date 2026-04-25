import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiconfig';
import { clearPersistedQueryCache } from '../../lib/queryClient';
import { clearViewCache } from '../../lib/viewCache';
import { primeDashboardSummary, resetOperationalWarmup, warmOperationalCaches } from '../../lib/warmup';

export const AuthContext = createContext();

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sanitizeStoredUser = (currentUser) => {
  if (!currentUser || typeof currentUser !== 'object') return null;

  return {
    _id: currentUser._id,
    id: currentUser.id,
    name: currentUser.name,
    role: currentUser.role,
    isAdmin: currentUser.isAdmin,
    status: currentUser.status,
    isActive: currentUser.isActive,
  };
};

const storeAuthUser = (storage, currentUser) => {
  const safeUser = sanitizeStoredUser(currentUser);
  if (!safeUser) return;
  storage.setItem('auth_user', JSON.stringify(safeUser));
};

const clearClientCaches = () => {
  clearPersistedQueryCache();
  clearViewCache();
  resetOperationalWarmup();
};

const parseStoredUser = () => {
  try {
    const rawUser =
      localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.warn('Failed to parse stored auth user', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => parseStoredUser());
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      api.get('/users/me')
        .then(async (response) => {
          setUser(response.data);
          const targetStorage = localStorage.getItem('token') ? localStorage : sessionStorage;
          storeAuthUser(targetStorage, response.data);
          await primeDashboardSummary(token);
          warmOperationalCaches(token, { skipDashboard: true });
        })
        .catch(error => {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('auth_user');
          sessionStorage.removeItem('auth_user');
          clearClientCaches();
          delete api.defaults.headers['Authorization'];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async ({ token, user, rememberMe }) => {
    setUser(user);
    clearClientCaches();
    if (rememberMe) {
      localStorage.setItem('token', token);
      storeAuthUser(localStorage, user);
      sessionStorage.removeItem('auth_user');
    } else {
      sessionStorage.setItem('token', token);
      storeAuthUser(sessionStorage, user);
      localStorage.removeItem('auth_user');
    }
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
    await primeDashboardSummary(token);
    warmOperationalCaches(token, { skipDashboard: true });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
    clearClientCaches();
    delete api.defaults.headers['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ api, user, login, logout, loading, setRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
};
