import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Inner component that uses theme
const AdminLayoutContent = () => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Use the standard token since your auth system is using the same token for both admin and user
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  // Validate token format and admin status
  if (!token || !userData.isAdmin) {
    // Clear invalid tokens and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }

  // Additional check: validate JWT token format (check if it has isAdmin field)
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      // If token doesn't have isAdmin field, force re-authentication
      if (payload.isAdmin === undefined) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/admin/login" replace />;
      }
    }
  } catch (error) {
    // Invalid token format, clear and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row transition-colors duration-300" style={{ background: theme.background }}>
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto transition-colors duration-300" style={{ background: theme.background }}>
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer 
          className="border-t px-4 py-3 md:px-6 md:py-4 transition-colors duration-300"
          style={{
            background: theme.surface,
            borderColor: theme.cardBorder
          }}
        >
          <div className="text-center text-xs md:text-sm" style={{ color: theme.textMuted }}>
            © {new Date().getFullYear()} Admin Portal. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <ThemeProvider>
      <AdminLayoutContent />
    </ThemeProvider>
  );
};

export default AdminLayout;