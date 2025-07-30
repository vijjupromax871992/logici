// src/components/user/dashboard/DashboardCharts.jsx
import { useState, useEffect } from 'react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import PropTypes from 'prop-types';
import bookingService from '../../../services/bookingService';
import inquiryService from '../../../services/inquiryService';
import { useTheme } from '../../../contexts/ThemeContext';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
        <p className="text-white font-semibold">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number
  }))
};

const DashboardCharts = () => {
  const { theme } = useTheme();
  const [bookingData, setBookingData] = useState([]);
  const [inquiryData, setInquiryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch bookings data
        const bookingsResponse = await bookingService.getBookings({
          limit: 100 // Get a larger number to calculate stats
        });
        
        // Fetch inquiries data
        const inquiriesData = await inquiryService.getPartnerInquiries();
        
        // Process booking data by status
        const bookingStatusCounts = bookingsResponse.data.reduce((acc, booking) => {
          const status = booking.status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const formattedBookingData = Object.entries(bookingStatusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));
        
        // Process inquiry data by status
        const inquiryStatusCounts = inquiriesData.data.reduce((acc, inquiry) => {
          const status = inquiry.status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const formattedInquiryData = Object.entries(inquiryStatusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));
        
        // Set the data for the charts
        
        setBookingData(formattedBookingData);
        setInquiryData(formattedInquiryData);
      } catch (error) {
        setBookingData([]);
        setInquiryData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className="p-6 rounded-lg border h-[300px] flex items-center justify-center"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow
          }}
        >
          <div className="animate-pulse" style={{ color: theme.textMuted }}>Loading booking data...</div>
        </div>
        <div 
          className="p-6 rounded-lg border h-[300px] flex items-center justify-center"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow
          }}
        >
          <div className="animate-pulse" style={{ color: theme.textMuted }}>Loading inquiry data...</div>
        </div>
      </div>
    );
  }

  const BOOKING_COLORS = ['#10B981', '#F59E0B', '#EF4444'];
  const INQUIRY_COLORS = ['#6366F1', '#8B5CF6', '#EC4899'];

  // Show empty state if no data
  if (bookingData.length === 0 && inquiryData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className="p-6 rounded-lg border h-[300px] flex items-center justify-center"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow
          }}
        >
          <p style={{ color: theme.textMuted }}>No booking data available</p>
        </div>
        <div 
          className="p-6 rounded-lg border h-[300px] flex items-center justify-center"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow
          }}
        >
          <p style={{ color: theme.textMuted }}>No inquiry data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Booking Chart */}
      <div 
        className="p-4 md:p-6 rounded-lg border shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
        style={{
          background: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: theme.cardShadow
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = theme.cardHoverShadow;
          e.target.style.borderColor = theme.primary;
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = theme.cardShadow;
          e.target.style.borderColor = theme.cardBorder;
        }}
      >
        <h3 className="text-lg font-medium mb-6" style={{ color: theme.textPrimary }}>Booking Status Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={bookingData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {bookingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BOOKING_COLORS[index % BOOKING_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip theme={theme} />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inquiry Chart */}
      <div 
        className="p-4 md:p-6 rounded-lg border shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
        style={{
          background: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: theme.cardShadow
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = theme.cardHoverShadow;
          e.target.style.borderColor = theme.primary;
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = theme.cardShadow;
          e.target.style.borderColor = theme.cardBorder;
        }}
      >
        <h3 className="text-lg font-medium mb-6" style={{ color: theme.textPrimary }}>Inquiry Status Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={inquiryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {inquiryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={INQUIRY_COLORS[index % INQUIRY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip theme={theme} />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;