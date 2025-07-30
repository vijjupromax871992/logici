import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';

const AdminHeader = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const API_URL = BACKEND_URL;
  const [adminData, setAdminData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch admin data');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch admin data');
      }
      
      setAdminData(data.data);
      
      if (data.data.profilePhoto) {
        setProfilePhoto(`${API_URL}/uploads/${data.data.profilePhoto}`);
      }
    } catch (error) {
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  return (
    <header 
      className="border-b transition-colors duration-300"
      style={{
        background: theme.navBg,
        borderColor: theme.navBorder,
        boxShadow: theme.navShadow,
        backdropFilter: theme.glassBlur
      }}
    >
      <div className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          {/* Empty div to maintain spacing on mobile, since burger is positioned absolute */}
          <div className="w-10 md:hidden"></div>
          
          {/* Page Title - Only for Mobile */}
          <div className="md:hidden text-lg font-semibold" style={{ color: theme.textPrimary }}>
            Admin Portal
          </div>

          {/* Admin Info - Hidden on small mobile, visible on tablets and up */}
          <div className="hidden sm:flex items-center">
            <div className="flex-shrink-0">
              <div 
                className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border transition-colors duration-300"
                style={{
                  background: theme.glassBg,
                  borderColor: theme.cardBorder
                }}
              >
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt={`${adminData?.first_name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center font-semibold"
                    style={{ 
                      background: theme.primaryGradient,
                      color: theme.textInverted
                    }}
                  >
                    {adminData?.first_name?.charAt(0)}
                    {adminData?.last_name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm md:text-base font-semibold" style={{ color: theme.textPrimary }}>
                {adminData?.first_name} {adminData?.last_name}
              </div>
              <div className="text-xs md:text-sm" style={{ color: theme.textSecondary }}>
                Administrator
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center">
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
              style={{ color: theme.textSecondary }}
              onMouseEnter={(e) => {
                e.target.style.color = theme.error;
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = theme.textSecondary;
                e.target.style.background = 'transparent';
              }}
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;