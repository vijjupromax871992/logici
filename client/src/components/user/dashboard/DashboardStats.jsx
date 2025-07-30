//src/components/user/dashboard/DashboardStats.jsx
import PropTypes from 'prop-types';
import { 
  Warehouse, 
  CheckCircle, 
  Clock, 
  CalendarClock,
  MessageSquare
} from 'lucide-react';
import InfoTooltip from '../../ui/InfoTooltip';
import { useTheme } from '../../../contexts/ThemeContext';

const StatCard = ({ title, value, icon: Icon, trend, description, tooltipContent }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="group relative overflow-hidden backdrop-blur-2xl rounded-2xl p-4 md:p-6 shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.cardHoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = theme.cardShadow;
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)' }}></div>
      
      {/* Floating orb effect */}
      <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{ background: `linear-gradient(135deg, ${theme.primary}10, ${theme.accent}10)` }}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="p-3 backdrop-blur-sm rounded-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{
              background: theme.glassBg,
              color: theme.primary
            }}
          >
            <Icon className="h-6 w-6 md:h-7 md:w-7 drop-shadow-lg" />
          </div>
          {trend && (
            <div 
              className="px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm"
              style={{
                background: trend > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: trend > 0 ? '#10b981' : '#ef4444',
                border: `1px solid ${trend > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <h3 
            className="text-sm font-medium uppercase tracking-wider group-hover:text-opacity-80 transition-colors duration-300"
            style={{ color: theme.textSecondary }}
          >
            {title}
          </h3>
          {tooltipContent && (
            <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              <InfoTooltip content={tooltipContent} />
            </div>
          )}
        </div>
        <div className="mb-2">
          <p 
            className="text-2xl md:text-3xl font-black transition-all duration-300"
            style={{ color: theme.textPrimary }}
          >
            {value}
          </p>
        </div>
        {description && (
          <p 
            className="text-sm transition-colors duration-300 leading-relaxed"
            style={{ color: theme.textMuted }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.number,
  description: PropTypes.string,
  tooltipContent: PropTypes.string
};

const DashboardStats = ({ stats }) => {
  const bookingTooltipContent = 
    "Bookings are warehouse specific requests where users view and select a specific warehouse listing before requesting to book it.";
  
  const inquiryTooltipContent = 
    "Inquiries are general requests where users fill out a form to express interest without selecting a specific warehouse.";

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-2">
      <StatCard
        title="Total Warehouses"
        value={stats.totalWarehouses}
        icon={Warehouse}
        trend={8}
        description="All your listed warehouses"
      />
      <StatCard
        title="Approved Warehouses"
        value={stats.approvedWarehouses}
        icon={CheckCircle}
        trend={5}
        description="Successfully approved listings"
      />
      <StatCard
        title="Pending Approval"
        value={stats.pendingWarehouses}
        icon={Clock}
        description="Warehouses awaiting approval"
      />
      <StatCard
        title="Total Bookings"
        value={stats.totalBookings}
        icon={CalendarClock}
        trend={12}
        description="All warehouse bookings"
        tooltipContent={bookingTooltipContent}
      />
      <StatCard
        title="Pending Bookings"
        value={stats.pendingBookings}
        icon={CalendarClock}
        description="Bookings awaiting response"
        tooltipContent={bookingTooltipContent}
      />
      <StatCard
        title="Total Inquiries"
        value={stats.totalInquiries}
        icon={MessageSquare}
        trend={15}
        description="All general inquiries"
        tooltipContent={inquiryTooltipContent}
      />
      <StatCard
        title="Pending Inquiries"
        value={stats.pendingInquiries}
        icon={MessageSquare}
        description="Inquiries awaiting response"
        tooltipContent={inquiryTooltipContent}
      />
    </div>
  );
};

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    totalWarehouses: PropTypes.number.isRequired,
    approvedWarehouses: PropTypes.number.isRequired,
    pendingWarehouses: PropTypes.number.isRequired,
    totalBookings: PropTypes.number.isRequired,
    pendingBookings: PropTypes.number.isRequired,
    totalInquiries: PropTypes.number.isRequired,
    pendingInquiries: PropTypes.number.isRequired
  }).isRequired
};

export default DashboardStats;