import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const setTokenAndFetchUser = async (token) => {
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('token', token);
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
        return true;
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        throw error;
      }
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token || res.data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      const userData = res.data.data || res.data.user;
      setUser(userData);
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const token = res.data.token || res.data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      const userData = res.data.data || res.data.user;
      setUser(userData);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setTokenAndFetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
