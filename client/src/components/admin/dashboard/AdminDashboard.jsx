import { useState, useEffect } from 'react';
import { Activity, Users, Archive, Clock, MessageSquare, HelpCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../theme/ThemeToggle';

// InfoTooltip component
const InfoTooltip = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        className="p-1 transition-all duration-200 focus:outline-none transform hover:scale-110"
        style={{ color: theme.textMuted }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More information"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div 
          className="absolute z-10 w-64 p-3 mt-2 text-sm rounded-xl left-0 transform -translate-x-1/2 md:left-auto md:transform-none transition-opacity duration-200"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.cardShadow,
            backdropFilter: theme.glassBlur
          }}
        >
          <div 
            className="absolute -top-2 left-0 md:left-1/4 w-4 h-4 transform rotate-45"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`
            }}
          ></div>
          <p style={{ color: theme.textPrimary }}>{content}</p>
        </div>
      )}
    </div>
  );
};

InfoTooltip.propTypes = {
  content: PropTypes.string.isRequired
};

const AdminDashboard = () => {
  const { theme, isLightTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalWarehouses: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    totalInquiries: 0,
    pendingInquiries: 0
  });
  const [user, setUser] = useState({ firstName: 'Admin' });

  // Navigation handlers for stat cards
  const handleNavigateToUsers = () => navigate('/admin/users');
  const handleNavigateToWarehouses = () => navigate('/admin/warehouses');
  const handleNavigateToBookings = () => navigate('/admin/bookings');
  const handleNavigateToPendingApprovals = () => navigate('/admin/warehouses/pending');
  const handleNavigateToInquiries = () => navigate('/admin/inquiries');
  const handleNavigateToPendingInquiries = () => navigate('/admin/inquiries?status=pending');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Get user data
        const userDataRaw = localStorage.getItem('user');
        if (userDataRaw) {
          const parsedUser = JSON.parse(userDataRaw);
          if (parsedUser.firstName) {
            setUser({ firstName: parsedUser.firstName });
          }
        }
        
        // Fetch dashboard data
        // Check if token exists
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const response = await fetch(`${BACKEND_URL}/admin/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (!response.ok) {
          // Handle specific authentication errors
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
          }
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }

        if (result.success) {
          // Add inquiries data if not present in API response
          const enhancedData = {
            ...result.data,
            totalInquiries: result.data.totalInquiries || 0,
            pendingInquiries: result.data.pendingInquiries || 0
          };
          
          // Fetch inquiries count if not included in dashboard data
          if (!result.data.totalInquiries) {
            try {
              const inquiriesResponse = await fetch(
                `${BACKEND_URL}/api/admin/inquiries?page=1&limit=1`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const inquiriesData = await inquiriesResponse.json();
              if (inquiriesData.success) {
                enhancedData.totalInquiries = inquiriesData.total || 0;
                enhancedData.pendingInquiries = inquiriesData.unallocated || 0;
              }
            } catch (err) {
            }
          }
          
          setDashboardData(enhancedData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const bookingTooltipContent = 
    "Bookings are warehouse specific requests where users view and select a specific warehouse listing before requesting to book it.";
  
  const inquiryTooltipContent = 
    "Inquiries are general requests where users fill out a form to express interest without selecting a specific warehouse.";

  if (loading) return (
    <div className="p-6 min-h-screen" style={{ background: theme.background }}>
      <div className="animate-pulse space-y-6">
        <div className="h-32 rounded-2xl" style={{ background: theme.glassBg }}></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl" style={{ background: theme.glassBg }}></div>
          ))}
        </div>
        <div className="h-64 rounded-2xl" style={{ background: theme.glassBg }}></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 min-h-screen" style={{ background: theme.background }}>
      <div className="px-6 py-4 rounded-2xl border" style={{
        background: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: theme.error
      }}>
        <p className="font-semibold">Error loading dashboard</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    </div>
  );

  const stats = [
    {
      title: "TOTAL USERS",
      value: dashboardData.totalUsers,
      icon: Users,
      color: isLightTheme ? '#3b82f6' : '#06b6d4',
      bgColor: isLightTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(6, 182, 212, 0.15)',
      onClick: handleNavigateToUsers
    },
    {
      title: "TOTAL WAREHOUSES",
      value: dashboardData.totalWarehouses,
      icon: Archive,
      color: isLightTheme ? '#10b981' : '#34d399',
      bgColor: isLightTheme ? 'rgba(16, 185, 129, 0.1)' : 'rgba(52, 211, 153, 0.15)',
      onClick: handleNavigateToWarehouses
    },
    {
      title: "TOTAL BOOKINGS",
      value: dashboardData.totalBookings,
      icon: Activity,
      color: isLightTheme ? '#f59e0b' : '#fbbf24',
      bgColor: isLightTheme ? 'rgba(245, 158, 11, 0.1)' : 'rgba(251, 191, 36, 0.15)',
      tooltip: bookingTooltipContent,
      onClick: handleNavigateToBookings
    },
    {
      title: "PENDING APPROVALS",
      value: dashboardData.pendingApprovals,
      icon: Clock,
      color: isLightTheme ? '#ef4444' : '#f87171',
      bgColor: isLightTheme ? 'rgba(239, 68, 68, 0.1)' : 'rgba(248, 113, 113, 0.15)',
      onClick: handleNavigateToPendingApprovals
    },
    {
      title: "TOTAL INQUIRIES",
      value: dashboardData.totalInquiries,
      icon: MessageSquare,
      color: isLightTheme ? '#8b5cf6' : '#a78bfa',
      bgColor: isLightTheme ? 'rgba(139, 92, 246, 0.1)' : 'rgba(167, 139, 250, 0.15)',
      tooltip: inquiryTooltipContent,
      onClick: handleNavigateToInquiries
    },
    {
      title: "PENDING INQUIRIES",
      value: dashboardData.pendingInquiries,
      icon: MessageSquare,
      color: isLightTheme ? '#06b6d4' : '#22d3ee',
      bgColor: isLightTheme ? 'rgba(6, 182, 212, 0.1)' : 'rgba(34, 211, 238, 0.15)',
      tooltip: inquiryTooltipContent,
      onClick: handleNavigateToPendingInquiries
    }
  ];

  return (
    <div className="p-4 md:p-6 min-h-screen transition-all duration-300" style={{ background: theme.background }}>
      {/* Header with Theme Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <ThemeToggle />
      </div>

      {/* Welcome Section */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 border transition-all duration-500 hover:scale-[1.02] group cursor-pointer"
        style={{
          background: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: theme.cardShadow,
          backdropFilter: theme.glassBlur
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = theme.cardHoverShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = theme.cardShadow;
        }}
      >
        {/* Floating orbs */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`
          }}
        ></div>

        <div className="relative z-10">
          <h1 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 transition-all duration-300"
            style={{ color: theme.textPrimary }}
          >
            Welcome back, {' '}
            <span 
              className="font-black bg-clip-text text-transparent"
              style={{
                backgroundImage: theme.primaryGradient
              }}
            >
              {user?.firstName}!
            </span>
          </h1>
          <p 
            className="text-lg leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            Here's an overview of your system statistics and recent activity
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-10">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group relative overflow-hidden rounded-2xl p-4 md:p-5 lg:p-6 border transition-all duration-500 hover:scale-105 cursor-pointer"
            style={{
              background: theme.statsBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
              backdropFilter: theme.glassBlur
            }}
            onClick={stat.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.statsHover;
              e.currentTarget.style.boxShadow = theme.cardHoverShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.statsBg;
              e.currentTarget.style.boxShadow = theme.cardShadow;
            }}
          >
            {/* Animated background gradient */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${stat.bgColor}, transparent)`
              }}
            ></div>
            
            {/* Floating orb effect */}
            <div 
              className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle, ${stat.color}20, transparent)`
              }}
            ></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 md:p-4 rounded-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: theme.glassBg,
                    border: `1px solid ${theme.glassBorder}`,
                    color: stat.color
                  }}
                >
                  <stat.icon size={24} className="drop-shadow-lg" />
                </div>
                {stat.tooltip && (
                  <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    <InfoTooltip content={stat.tooltip} />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <p 
                  className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-2 transition-colors duration-300"
                  style={{ 
                    color: theme.textSecondary,
                    opacity: 0.8
                  }}
                >
                  {stat.title}
                </p>
                <p 
                  className="text-2xl md:text-3xl lg:text-4xl font-black transition-all duration-300"
                  style={{ color: theme.textPrimary }}
                >
                  {stat.value?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;