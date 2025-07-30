import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Calendar, Building, Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ThemedCard,
  ThemedTable,
  ThemedTableHeader,
  ThemedTableHeaderCell,
  ThemedTableBody,
  ThemedTableRow,
  ThemedTableCell,
  ThemedButton,
  ThemedInput,
  ThemedSelect
} from '../common/ThemedTable';
import { BACKEND_URL } from '../../../config/api';

const ThemedAdminBookings = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/admin/bookings?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: theme.success, bg: 'rgba(16, 185, 129, 0.1)' },
      pending: { color: theme.warning, bg: 'rgba(245, 158, 11, 0.1)' },
      cancelled: { color: theme.error, bg: 'rgba(239, 68, 68, 0.1)' },
      completed: { color: theme.primary, bg: theme.primaryLight }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span 
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          color: config.color,
          background: config.bg,
          border: `1px solid ${config.color}30`
        }}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen" style={{ background: theme.background }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4" style={{
            borderColor: theme.cardBorder,
            borderTopColor: theme.primary
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ background: theme.background }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>
          Booking Management
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Manage and track all booking requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Bookings', value: bookings.length, icon: Calendar, color: theme.primary },
          { title: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: Building, color: theme.success },
          { title: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: Users, color: theme.warning },
          { title: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: Eye, color: theme.error }
        ].map((stat, index) => (
          <ThemedCard key={index} className="hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  {stat.title}
                </p>
                <p className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                  {stat.value}
                </p>
              </div>
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  background: `${stat.color}20`,
                  color: stat.color 
                }}
              >
                <stat.icon size={24} />
              </div>
            </div>
          </ThemedCard>
        ))}
      </div>

      {/* Filters */}
      <ThemedCard className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: theme.textMuted }} 
              />
              <ThemedInput
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <ThemedSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </ThemedSelect>
          </div>
        </div>
      </ThemedCard>

      {/* Bookings Table */}
      <ThemedTable>
        <ThemedTableHeader>
          <tr>
            <ThemedTableHeaderCell>Customer</ThemedTableHeaderCell>
            <ThemedTableHeaderCell>Contact</ThemedTableHeaderCell>
            <ThemedTableHeaderCell>Warehouse</ThemedTableHeaderCell>
            <ThemedTableHeaderCell>Date</ThemedTableHeaderCell>
            <ThemedTableHeaderCell>Status</ThemedTableHeaderCell>
            <ThemedTableHeaderCell>Actions</ThemedTableHeaderCell>
          </tr>
        </ThemedTableHeader>
        <ThemedTableBody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <ThemedTableRow key={booking.id} isClickable>
                <ThemedTableCell>
                  <div>
                    <div className="font-semibold" style={{ color: theme.textPrimary }}>
                      {booking.fullName}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>
                      ID: {booking.id}
                    </div>
                  </div>
                </ThemedTableCell>
                <ThemedTableCell>
                  <div>
                    <div className="text-sm" style={{ color: theme.textPrimary }}>
                      {booking.email}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>
                      {booking.phoneNumber}
                    </div>
                  </div>
                </ThemedTableCell>
                <ThemedTableCell>
                  <div className="font-medium" style={{ color: theme.textPrimary }}>
                    {booking.Warehouse?.name || 'N/A'}
                  </div>
                </ThemedTableCell>
                <ThemedTableCell>
                  <div className="text-sm" style={{ color: theme.textPrimary }}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </ThemedTableCell>
                <ThemedTableCell>
                  {getStatusBadge(booking.status)}
                </ThemedTableCell>
                <ThemedTableCell>
                  <div className="flex space-x-2">
                    <ThemedButton size="small" variant="secondary">
                      <Eye size={16} />
                    </ThemedButton>
                    <ThemedButton size="small" variant="primary">
                      Edit
                    </ThemedButton>
                  </div>
                </ThemedTableCell>
              </ThemedTableRow>
            ))
          ) : (
            <ThemedTableRow>
              <ThemedTableCell colSpan={6} className="text-center py-12">
                <div style={{ color: theme.textMuted }}>
                  No bookings found matching your criteria
                </div>
              </ThemedTableCell>
            </ThemedTableRow>
          )}
        </ThemedTableBody>
      </ThemedTable>
    </div>
  );
};

export default ThemedAdminBookings;