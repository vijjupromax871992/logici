// components/admin/common/AdminProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AdminProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        
        setIsAdmin(userData.isAdmin);
      } catch (error) {
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