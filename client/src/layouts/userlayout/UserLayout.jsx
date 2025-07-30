import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Inner component that uses theme
const UserLayoutContent = () => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row transition-colors duration-300" style={{ background: theme.background }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 transition-colors duration-300" style={{ background: theme.background }}>
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Footer - visible only on larger screens */}
        <footer 
          className="hidden md:block border-t px-4 py-3 md:px-6 md:py-4 transition-colors duration-300"
          style={{
            background: theme.surface,
            borderColor: theme.cardBorder
          }}
        >
          <div className="text-center text-xs md:text-sm" style={{ color: theme.textMuted }}>
            © {new Date().getFullYear()} Logic-i. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

const UserLayout = () => {
  return (
    <ThemeProvider>
      <UserLayoutContent />
    </ThemeProvider>
  );
};

export default UserLayout;