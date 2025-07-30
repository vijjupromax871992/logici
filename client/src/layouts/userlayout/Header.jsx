import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/theme/ThemeToggle';

const Header = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const API_URL = BACKEND_URL;
  const [userData, setUserData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/');
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
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user data');
      }
      
      setUserData(data.data);
      
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
            Logic-i
          </div>

          {/* User Info - Hidden on small mobile, visible on tablets and up */}
          <div className="hidden sm:flex items-center">
            <div className="flex-shrink-0">
              <div 
                className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border transition-all duration-200"
                style={{
                  borderColor: theme.cardBorder,
                  background: theme.primaryLight
                }}
              >
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt={`${userData?.first_name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center font-medium"
                    style={{
                      background: theme.primaryGradient,
                      color: theme.textInverted
                    }}
                  >
                    {userData?.first_name?.charAt(0)}
                    {userData?.last_name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm md:text-base font-medium" style={{ color: theme.textPrimary }}>
                {userData?.first_name} {userData?.last_name}
              </div>
              <div className="text-xs md:text-sm truncate max-w-[200px]" style={{ color: theme.textSecondary }}>
                {userData?.email}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle className="hidden sm:block" />
            
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
              style={{ color: theme.textSecondary }}
              onMouseEnter={(e) => {
                e.target.style.color = theme.textPrimary;
                e.target.style.background = theme.surfaceHover;
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

export default Header;