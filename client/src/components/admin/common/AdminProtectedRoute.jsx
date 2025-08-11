// components/admin/common/AdminProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AdminProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      // Check multiple token storage locations
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        console.log('🔄 [AdminProtectedRoute] No token or user data found');
        // Clear any remaining auth data
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        
        if (userData.isAdmin) {
          setIsAdmin(true);
        } else {
          console.log('🔄 [AdminProtectedRoute] User is not admin');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('🔄 [AdminProtectedRoute] Error parsing user data:', error);
        // Clear invalid user data
        localStorage.removeItem('user');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminProtectedRoute;