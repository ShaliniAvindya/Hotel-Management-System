import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiconfig';

export const AuthContext = createContext();

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      api.defaults.headers['Authorization'] = `Bearer ${token}`;
      api.get('/users/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          delete api.defaults.headers['Authorization'];
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
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete api.defaults.headers['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ api, user, login, logout, loading, setRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
};