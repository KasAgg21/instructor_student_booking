// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial loading state

  // Check if the user is already authenticated
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/auth/check-auth`, { withCredentials: true })
      .then((response) => {
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Authentication check failed.', error);
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setUser(response.data.user);
  };

  const register = async (email, password) => {
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, { email, password });
  };

  const logout = async () => {
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, null, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
