import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Warehouse, 
  User, 
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
// Logic-I Logo URLs
const lightLogo = 'https://logic-i.com/assets/Logic-I-logo-D44ULDb-.png';
const darkLogo = 'https://logic-i.com/assets/white-logo-DFkSNrBa.png';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
  { name: 'Warehouses', href: '/user/warehouses', icon: Warehouse },
  { name: 'Inquiries', href: '/user/inquiries', icon: MessageSquare },
  { name: 'Bookings', href: '/user/bookings', icon: MessageSquare },
  { name: 'Profile', href: '/user/profile', icon: User },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
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
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar for desktop and mobile */}
      <div 
        className={`
          fixed md:relative inset-y-0 left-0 z-20
          transform transition-transform duration-300 ease-in-out
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
          {/* Logo - Modified with extra padding on left for mobile */}
          <div 
            className="flex items-center h-16 flex-shrink-0 px-4 md:px-4 border-b transition-colors duration-300"
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder
            }}
          >
            {/* Close button for mobile - inside the header instead of fixed */}
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
              alt="Logic-i"
            />
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
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
          
          {/* Footer for mobile view */}
          <div 
            className="md:hidden flex-shrink-0 flex p-4 border-t transition-colors duration-300"
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder
            }}
          >
            <div className="text-xs" style={{ color: theme.textMuted }}>
              © {new Date().getFullYear()} Logic-i
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;