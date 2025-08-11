import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Setup axios interceptors and check authentication status on mount
  useEffect(() => {
    // Setup axios interceptors for automatic token handling
    const setupAxiosInterceptors = () => {
      // Request interceptor to add token to all requests
      const requestInterceptor = axios.interceptors.request.use(
        (config) => {
          const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
          if (storedToken) {
            config.headers.Authorization = `Bearer ${storedToken}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor to handle token errors globally
      const responseInterceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log('🔄 [Auth] Token error detected, logging out...');
            handleLogout();
          }
          return Promise.reject(error);
        }
      );

      // Return cleanup function
      return () => {
        axios.interceptors.request.eject(requestInterceptor);
        axios.interceptors.response.eject(responseInterceptor);
      };
    };

    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (storedToken) {
          // Fetch user details using the /me endpoint
          const response = await fetch(`${BACKEND_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const { data } = await response.json();
            // Transform the data to match frontend expectations
            const transformedUser = {
              id: data.id,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email,
              mobileNumber: data.mobile,
              country: data.country,
              state: data.state,
              city: data.city,
              isAdmin: data.role_id === process.env.REACT_APP_ADMIN_ROLE_ID,
              createdAt: data.created_at,
              updatedAt: data.last_login
            };
            setUser(transformedUser);
            setToken(storedToken);
          } else {
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    const cleanupInterceptors = setupAxiosInterceptors();
    checkAuth();

    // Cleanup interceptors on unmount
    return cleanupInterceptors;
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('auth_token', data.token);
      
      setToken(data.token);
      setUser(data.user);

      // Redirect based on user role
      if (data.user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch(`${BACKEND_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all possible token storage locations
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      // Redirect to homepage instead of login
      navigate('/');
    }
  };

   const updateUser = async (updatedData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          country: updatedData.country,
          state: updatedData.state,
          city: updatedData.city
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const { data } = await response.json();
      
      // Update the user state with new data
      setUser(prev => ({
        ...prev,
        ...data
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.isAdmin || false,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    loading,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;