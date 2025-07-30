import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
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
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      navigate('/login');
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