// src/components/user/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats';
import DashboardCharts from './DashboardCharts';
import InfoTooltip from '../../ui/InfoTooltip';
import { useAuth } from '../../../context/AuthContext';
import bookingService from '../../../services/bookingService';
import inquiryService from '../../../services/inquiryService';
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../theme/ThemeToggle';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    approvedWarehouses: 0,
    pendingWarehouses: 0,
    totalBookings: 0,
    totalInquiries: 0,
    pendingBookings: 0,
    pendingInquiries: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
    
        // Fetch warehouse data - add parameter to get all warehouses
        const warehouseResponse = await fetch(`${BACKEND_URL}/api/warehouses?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (!warehouseResponse.ok) {
          throw new Error('Failed to fetch warehouse data');
        }
    
        const warehouseData = await warehouseResponse.json();
        
        // Fetch bookings data
        const bookingsResponse = await bookingService.getBookings({
          limit: 1000 // Get a larger number to calculate counts
        });
        
        // Fetch inquiries data
        const inquiriesData = await inquiryService.getPartnerInquiries();
        
        // Calculate stats
        const newStats = {
          totalWarehouses: warehouseData.total || 0,
          approvedWarehouses: warehouseData.data.filter(w => w.approval_status === 'approved').length,
          pendingWarehouses: warehouseData.data.filter(w => w.approval_status === 'pending').length,
          totalBookings: bookingsResponse.pagination?.total || bookingsResponse.data?.length || 0,
          pendingBookings: bookingsResponse.data?.filter(b => b.status === 'pending').length || 0,
          totalInquiries: inquiriesData.pagination?.total || inquiriesData.data?.length || 0,
          pendingInquiries: inquiriesData.data?.filter(i => i.status === 'pending').length || 0
        };
    
        setStats(newStats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: theme.primary, borderBottomColor: theme.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg" style={{ color: theme.error, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        Error loading dashboard: {error}
      </div>
    );
  }

  const bookingTooltipContent = 
    "Bookings are warehouse specific requests where users view and select a specific warehouse listing before requesting to book it.";
  
  const inquiryTooltipContent = 
    "Inquiries are general requests where users fill out a form to express interest without selecting a specific warehouse.";

  return (
    <div className="space-y-8 md:space-y-10 lg:space-y-12 px-2 md:px-4 min-h-screen pt-6 transition-all duration-300" style={{ background: theme.background }}>
      {/* Welcome Section */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 border transition-all duration-500 hover:scale-[1.02] group cursor-pointer"
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
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
          }}
        ></div>
        <div className="relative z-10">
          <h1 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 flex items-center"
            style={{ color: theme.textPrimary }}
          >
            Welcome back, {' '}
            <span 
              className="font-black bg-clip-text text-transparent ml-2"
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
            Here is an overview of your warehouse management statistics
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{ background: `linear-gradient(135deg, ${theme.primary}20, ${theme.accent}20)` }}></div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookings Info */}
        <div className="group relative overflow-hidden backdrop-blur-2xl rounded-2xl p-6 md:p-8 border shadow-2xl transition-all duration-500" style={{ background: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.cardShadow }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: theme.glassBg }}></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold" style={{ color: theme.primary }}>Bookings</h3>
              <div className="ml-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <InfoTooltip content={bookingTooltipContent} />
              </div>
            </div>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: theme.textSecondary }}>
              You have <span className="text-2xl font-black" style={{ color: theme.warning }}>{stats.pendingBookings}</span> pending bookings that need your attention.
            </p>
            <a 
              href="/user/bookings"
              className="group/btn inline-flex items-center px-6 py-3 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
              style={{ background: theme.buttonPrimary, color: theme.textInverted }}
            >
              <span className="mr-2">Manage Bookings</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl" style={{ background: `linear-gradient(135deg, ${theme.primary}20, ${theme.accent}20)` }}></div>
        </div>

        {/* Inquiries Info */}
        <div className="group relative overflow-hidden backdrop-blur-2xl rounded-2xl p-6 md:p-8 border shadow-2xl transition-all duration-500" style={{ background: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.cardShadow }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: theme.glassBg }}></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold" style={{ color: theme.success }}>Inquiries</h3>
              <div className="ml-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <InfoTooltip content={inquiryTooltipContent} />
              </div>
            </div>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: theme.textSecondary }}>
              You have <span className="text-2xl font-black" style={{ color: theme.warning }}>{stats.pendingInquiries}</span> pending inquiries that need your response.
            </p>
            <a 
              href="/user/inquiries"
              className="group/btn inline-flex items-center px-6 py-3 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
              style={{ background: theme.buttonPrimary, color: theme.textInverted }}
            >
              <span className="mr-2">Manage Inquiries</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl" style={{ background: `linear-gradient(135deg, ${theme.success}20, ${theme.accent}20)` }}></div>
        </div>
      </div>

      {/* Updated Charts */}
      <DashboardCharts />
    </div>
  );
};

export default Dashboard;