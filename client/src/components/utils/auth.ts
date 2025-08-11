import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {BACKEND_URL} from '../../config';

const API_URL = `${BACKEND_URL}`;

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  sendOTP: (type: 'email', value: string) => Promise<any>;
  verifyOTP: (type: 'email', value: string, otp: string) => Promise<any>;
  googleAuth: () => void;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/');
  };

  const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
  };

  const sendOTP = async (type: 'email', value: string) => {
    // Mobile OTP removed - only email OTP supported
    if (type !== 'email') {
      throw new Error('Only email OTP is supported');
    }
    const response = await axios.post(`${API_URL}/api/auth/send-otp`, { type, value });
    return response.data;
  };

  const verifyOTP = async (type: 'email', value: string, otp: string) => {
    // Mobile OTP removed - only email OTP supported  
    if (type !== 'email') {
      throw new Error('Only email OTP is supported');
    }
    const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { type, value, otp });
    return response.data;
  };

  const googleAuth = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
      sendOTP,
      verifyOTP,
      googleAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Auth Service Functions
export const authService = {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return response.data;
  },

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
  }) {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  }
};

// Callback Handler Component
export const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userDataStr = params.get('user');

      if (token && userDataStr) {
        const userData = JSON.parse(userDataStr);
        login(token, userData);
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [login, navigate]);

  return null;
};