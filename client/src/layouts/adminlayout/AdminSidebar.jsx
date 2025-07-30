import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, User, UserPlus, Users, MessageSquare, Menu, X, Settings, BookOpen, Phone } from 'lucide-react';
// Logic-I Logo URLs
const lightLogo = 'https://logic-i.com/assets/Logic-I-logo-D44ULDb-.png';
const darkLogo = 'https://logic-i.com/assets/white-logo-DFkSNrBa.png';
import { useTheme } from '../../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pending Warehouses', href: '/admin/warehouses/pending', icon: Building2 },
  { name: 'Profile', href: '/admin/profile', icon: User },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Contacts', href: '/admin/contacts', icon: Phone },
  { name: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { name: 'Create Admin', href: '/admin/create-admin', icon: UserPlus },
  { name: 'Admin Users', href: '/admin/admin-users', icon: Settings },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
];

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { theme, isDarkTheme } = useTheme();

  return (
    <>
      {/* Mobile menu button - visible only on mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-xl transition-all duration-200 transform hover:scale-110"
        style={{
          background: theme.cardBg,
          color: theme.textPrimary,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.cardShadow
        }}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar for desktop and mobile */}
      <div 
        className={`
          fixed md:relative inset-y-0 left-0 z-20
          transform transition-all duration-300 ease-in-out
          md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col w-64 h-full
        `}
      >
        <div 
          className="flex flex-col h-full flex-1 border-r transition-colors duration-300"
          style={{
            background: theme.surface,
            borderColor: theme.cardBorder,
            backdropFilter: theme.glassBlur
          }}
        >
          {/* Logo Header */}
          <div 
            className="flex items-center h-16 flex-shrink-0 px-4 border-b transition-colors duration-300"
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder
            }}
          >
            {/* Close button for mobile */}
            <div className="md:hidden flex items-center pr-2">
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg transition-all duration-200 transform hover:scale-110"
                style={{ color: theme.textPrimary }}
                onMouseEnter={(e) => {
                  e.target.style.background = theme.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <img
              className="h-12 w-auto"
              src={isDarkTheme ? darkLogo : lightLogo}
              alt="Logic-I Admin Portal"
            />
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when a link is clicked
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                      isActive ? 'shadow-lg' : ''
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? theme.primaryGradient : 'transparent',
                    color: isActive ? theme.textInverted : theme.textSecondary,
                    border: `1px solid ${isActive ? 'transparent' : theme.cardBorder}`
                  })}
                  onMouseEnter={(e) => {
                    if (!e.target.classList.contains('active')) {
                      e.target.style.background = theme.surfaceHover;
                      e.target.style.color = theme.textPrimary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.classList.contains('active')) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = theme.textSecondary;
                    }
                  }}
                >
                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Admin Status Footer */}
          <div 
            className="flex-shrink-0 p-4 border-t transition-colors duration-300"
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder
            }}
          >
            <div className="flex items-center w-full">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{
                  background: theme.primaryGradient,
                  color: theme.textInverted
                }}
              >
                <Settings size={16} />
              </div>
              <div className="w-full">
                <div className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  Admin Portal
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  v1.0.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
AdminSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default AdminSidebar;