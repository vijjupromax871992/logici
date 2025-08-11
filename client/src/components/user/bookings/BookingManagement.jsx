// src/components/user/bookings/BookingManagement.jsx - ENHANCED WITH CONFIRMED BOOKINGS
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Phone, 
  Mail, 
  Building, 
  Eye, 
  CreditCard,
  FileText,
  Filter
} from 'lucide-react';
import bookingService from '../../../services/bookingService';
import { useTheme } from '../../../contexts/ThemeContext';

const BookingStatusBadge = ({ status, type }) => {
  let statusLabels;
  let colorStyle;

  if (type === 'inquiry') {
    statusLabels = {
      pending: 'Pending',
      contacted: 'Contacted',
      resolved: 'Resolved'
    };
    const colorMap = {
      pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
      contacted: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
      resolved: { bg: 'rgba(20, 184, 166, 0.1)', text: '#14b8a6', border: 'rgba(20, 184, 166, 0.2)' }
    };
    colorStyle = colorMap[status] || colorMap.pending;
  } else {
    statusLabels = {
      confirmed: 'Confirmed',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    const colorMap = {
      confirmed: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
      active: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
      completed: { bg: 'rgba(147, 51, 234, 0.1)', text: '#9333ea', border: 'rgba(147, 51, 234, 0.2)' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' }
    };
    colorStyle = colorMap[status] || colorMap.confirmed;
  }

  return (
    <span 
      className="px-3 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: colorStyle.bg,
        color: colorStyle.text,
        borderColor: colorStyle.border
      }}
    >
      {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const BookingTypeBadge = ({ type, isPaid }) => {
  if (type === 'confirmed' || isPaid) {
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1"
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          borderColor: 'rgba(16, 185, 129, 0.2)'
        }}
      >
        <CreditCard className="w-3 h-3" />
        Paid
      </span>
    );
  } else {
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1"
        style={{
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          color: '#fb923c',
          borderColor: 'rgba(251, 146, 60, 0.2)'
        }}
      >
        <FileText className="w-3 h-3" />
        Inquiry
      </span>
    );
  }
};

BookingStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

BookingTypeBadge.propTypes = {
  type: PropTypes.string.isRequired,
  isPaid: PropTypes.bool.isRequired
};

const BookingManagement = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    warehouse_id: '',
    type: 'all' // all, inquiries, confirmed
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getBookings({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      if (response.success) {
        setBookings(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 0
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await bookingService.getBookingStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [fetchBookings, fetchStats]);

  const handleStatusUpdate = async (bookingId, newStatus, type) => {
    try {
      setUpdating(prev => ({ ...prev, [bookingId]: true }));
      setError(null);
      
      const response = await bookingService.updateBookingStatus(bookingId, newStatus, type);
      
      if (response.success) {
        setBookings(currentBookings => 
          currentBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
              : booking
          )
        );
        
        setError(`Booking status updated to ${newStatus}`);
        setTimeout(() => setError(null), 2000);
        fetchStats(); // Refresh stats
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      setError(`Failed to update booking status: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); 
  };

  const formatMessage = (message) => {
    if (!message) return 'No message provided';
    
    try {
      // Check for HTTP log data patterns
      if (message.includes('HTTP/1.1') || message.includes('GET /uploads/') || message.includes('Mozilla/')) {
        return 'This appears to be system log data rather than a customer message. Please check the original form submission.';
      }
      
      // Check for the specific garbled pattern
      if (message.includes('szdcfvxbgcnvhmtj') || /^[a-z,]{30,}$/.test(message)) {
        return 'This message appears to be corrupted during form submission. Please contact the customer directly for their inquiry details.';
      }
      
      // Handle URL encoding
      if (message.includes('%') || message.includes('+')) {
        const decoded = decodeURIComponent(message.replace(/\+/g, ' '));
        if (decoded.length > 10 && decoded !== message && !decoded.includes('HTTP')) {
          return decoded.length > 300 ? decoded.substring(0, 300) + '...' : decoded;
        }
      }
      
      // Handle comma-separated data
      if (message.includes(',') && message.length > 50) {
        const parts = message.split(',').filter(part => part.trim().length > 0);
        
        const meaningfulParts = parts.filter(part => {
          const trimmed = part.trim();
          return trimmed.length > 3 && 
                 trimmed.length < 200 &&
                 !trimmed.includes('undefined') &&
                 !trimmed.includes('HTTP') &&
                 !/^[a-z]{15,}$/i.test(trimmed) &&
                 /[aeiou]/i.test(trimmed);
        });
        
        if (meaningfulParts.length > 0) {
          const bestPart = meaningfulParts[0].trim();
          return bestPart.length > 300 ? bestPart.substring(0, 300) + '...' : bestPart;
        }
      }
      
      // For very long messages without spaces (likely corrupted)
      if (message.length > 100 && !/\s/.test(message)) {
        return 'Message content appears to be corrupted or encoded. Please contact the customer directly for their inquiry.';
      }
      
      // Truncate very long messages
      if (message.length > 300) {
        return message.substring(0, 300) + '...';
      }
      
      return message;
    } catch (e) {
      return 'Unable to display message. Please contact customer directly.';
    }
  };

  const getStatusOptions = (type) => {
    if (type === 'inquiry') {
      return [
        { value: 'pending', label: 'Pending' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'resolved', label: 'Resolved' }
      ];
    } else {
      return [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: theme.primary }}></div>
        <span className="ml-3" style={{ color: theme.textPrimary }}>Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 lg:gap-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold" style={{ color: theme.textPrimary }}>Booking Management</h2>
        
        {/* Stats Summary */}
        {stats && (
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-5 text-sm">
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base" style={{ backgroundColor: theme.primaryLight, color: theme.primary, borderColor: theme.primary + '33' }}>
              Total: {stats.inquiries?.total + stats.confirmed_bookings?.total || 0}
            </div>
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.2)' }}>
              Inquiries: {stats.inquiries?.total || 0}
            </div>
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: theme.success, borderColor: theme.success + '33' }}>
              Paid: {stats.confirmed_bookings?.total || 0}
            </div>
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', borderColor: 'rgba(147, 51, 234, 0.2)' }}>
              Revenue: {stats.revenue?.formatted || '₹0.00'}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 items-stretch sm:items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.textMuted }} />
          <select
            className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg border shadow-sm focus:ring-1 text-sm sm:text-base w-full sm:w-auto md:min-w-[160px] lg:min-w-[180px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary, focusBorderColor: theme.inputFocus, focusRingColor: theme.inputFocus }}
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Bookings</option>
            <option value="inquiries">Inquiries Only</option>
            <option value="confirmed">Paid Bookings</option>
          </select>
        </div>
        
        <select
          className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg border shadow-sm focus:ring-1 text-sm sm:text-base w-full sm:w-auto md:min-w-[140px] lg:min-w-[160px]"
          style={{ 
            backgroundColor: theme.inputBg, 
            borderColor: theme.inputBorder, 
            color: theme.textPrimary,
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = theme.inputFocus}
          onBlur={(e) => e.target.style.borderColor = theme.inputBorder}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {filters.type === 'inquiries' && (
            <>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </>
          )}
          {filters.type === 'confirmed' && (
            <>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </>
          )}
          {filters.type === 'all' && (
            <>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </>
          )}
        </select>
      </div>

      {/* Error/Success Message */}
      {error && (
        <div className="p-4 rounded-lg border"
          style={{
            backgroundColor: error.includes('updated') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: error.includes('updated') ? theme.success : theme.error,
            borderColor: (error.includes('updated') ? theme.success : theme.error) + '33'
          }}>
          {error}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-8 text-center" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
          <p style={{ color: theme.textSecondary }}>No bookings found.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-5 md:gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-4 sm:p-5 md:p-6 lg:p-7 transition-all hover:shadow-lg" style={{ background: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.cardShadow, '&:hover': { boxShadow: theme.cardHoverShadow } }}>
              <div className="flex flex-col lg:flex-row xl:flex-row lg:justify-between lg:items-start gap-4 sm:gap-5 md:gap-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-medium" style={{ color: theme.textPrimary }}>{booking.fullName}</h3>
                    <div className="flex gap-2">
                      <BookingTypeBadge type={booking.type} isPaid={booking.is_paid} />
                      <BookingStatusBadge status={booking.status} type={booking.type} />
                    </div>
                  </div>
                  
                  {booking.companyName && (
                    <p className="flex items-center mt-1" style={{ color: theme.textSecondary }}>
                      <Building className="w-4 h-4 mr-1" />
                      {booking.companyName}
                    </p>
                  )}
                  
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-sm sm:text-base">
                    <p className="flex items-center" style={{ color: theme.textSecondary }}>
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span className="break-all">{booking.email}</span>
                    </p>
                    <p className="flex items-center" style={{ color: theme.textSecondary }}>
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      {booking.phoneNumber}
                    </p>
                    <p style={{ color: theme.textSecondary }}>
                      <strong>Preferred Contact:</strong> {booking.preferredContactMethod}
                    </p>
                    <p className="flex items-center" style={{ color: theme.textSecondary }}>
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      {booking.preferredContactTime}
                    </p>
                  </div>

                  {/* Payment Information for Confirmed Bookings */}
                  {booking.type === 'confirmed' && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: theme.success + '33' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base">
                        <div style={{ color: theme.success }}>
                          <strong>Amount Paid:</strong> {bookingService.formatCurrency(booking.amount_paid)}
                        </div>
                        {booking.booking_number && (
                          <div style={{ color: theme.success }}>
                            <strong>Booking #:</strong> {booking.booking_number}
                          </div>
                        )}
                        {booking.payment_method && (
                          <div style={{ color: theme.success }}>
                            <strong>Payment Method:</strong> {booking.payment_method}
                          </div>
                        )}
                      </div>
                      {booking.payment_date && (
                        <div className="text-xs sm:text-sm mt-1 sm:mt-2" style={{ color: theme.success }}>
                          Paid on: {new Date(booking.payment_date).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3 sm:gap-4 w-full lg:min-w-[220px] xl:min-w-[240px] lg:w-auto">
                  <select
                    className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg border shadow-sm focus:ring-1 disabled:opacity-50 text-sm sm:text-base"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary, focusBorderColor: theme.inputFocus, focusRingColor: theme.inputFocus }}
                    value={booking.status}
                    onChange={(e) => handleStatusUpdate(booking.id, e.target.value, booking.type)}
                    disabled={updating[booking.id]}
                  >
                    {getStatusOptions(booking.type).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="text-xs sm:text-sm md:text-base" style={{ color: theme.textSecondary }}>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {booking.preferredStartDate ? 
                        new Date(booking.preferredStartDate).toLocaleDateString() : 
                        'No date specified'
                      }
                    </div>
                    {booking.updatedAt && (
                      <p className="text-xs sm:text-sm mt-1 sm:mt-2" style={{ color: theme.textMuted }}>
                        Updated: {new Date(booking.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  {updating[booking.id] && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 mx-auto" style={{ borderBottomColor: theme.primary }}></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Message Section */}
              {booking.message && (
                <div className="mt-6 p-4 rounded-lg border-l-4" style={{ background: theme.cardBg, borderLeftColor: theme.primary }}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium" style={{ color: theme.textPrimary }}>Message:</h4>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                      className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
                      style={{ color: theme.primary }}
                    >
                      <Eye className="w-3 h-3" />
                      View Full
                    </button>
                  </div>
                  <div className="relative">
                    <div 
                      className="text-sm leading-relaxed overflow-hidden"
                      style={{
                        maxHeight: '120px',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                        color: theme.textPrimary
                      }}
                    >
                      <div className="whitespace-pre-wrap break-all">
                        {formatMessage(booking.message)}
                      </div>
                    </div>
                    {/* Gradient overlay for overflow indication */}
                    {formatMessage(booking.message).length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none" style={{ background: `linear-gradient(to top, ${theme.cardBg}, transparent)` }}></div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Warehouse Info */}
              {booking.warehouse && (
                <div className="mt-4 p-3 rounded-lg" style={{ background: theme.cardBg }}>
                  <h4 className="text-sm font-medium mb-1" style={{ color: theme.textPrimary }}>Warehouse:</h4>
                  <p style={{ color: theme.textPrimary }}>{booking.warehouse.name}</p>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>{booking.warehouse.city}, {booking.warehouse.state}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-5 md:gap-6 mt-4 sm:mt-6 md:mt-8">
          <p className="text-xs sm:text-sm md:text-base text-center sm:text-left font-medium" style={{ color: theme.textPrimary }}>
            Showing {bookings.length} of {pagination.total} bookings
          </p>
          <div className="flex gap-2 sm:gap-3 justify-center sm:justify-end">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 sm:p-2.5 md:p-3 rounded-lg disabled:opacity-50 hover:opacity-80 transition-opacity"
              style={{ 
                background: theme.buttonPrimary, 
                color: theme.textInverted 
              }}
            >
              <ChevronLeft className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
            </button>
            <span className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 font-medium text-sm sm:text-base md:text-lg" style={{ color: theme.textPrimary }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="p-2 sm:p-2.5 md:p-3 rounded-lg disabled:opacity-50 hover:opacity-80 transition-opacity"
              style={{ 
                background: theme.buttonPrimary, 
                color: theme.textInverted 
              }}
            >
              <ChevronRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Booking Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-white font-medium">{selectedBooking.fullName}</h4>
                <BookingTypeBadge type={selectedBooking.type} isPaid={selectedBooking.is_paid} />
                <BookingStatusBadge status={selectedBooking.status} type={selectedBooking.type} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300"><strong>Email:</strong> {selectedBooking.email}</p>
                  <p className="text-gray-300"><strong>Phone:</strong> {selectedBooking.phoneNumber}</p>
                  <p className="text-gray-300"><strong>Company:</strong> {selectedBooking.companyName}</p>
                  <p className="text-gray-300"><strong>Contact Method:</strong> {selectedBooking.preferredContactMethod}</p>
                  <p className="text-gray-300"><strong>Contact Time:</strong> {selectedBooking.preferredContactTime}</p>
                </div>
                <div>
                  <p className="text-gray-300"><strong>Start Date:</strong> {selectedBooking.preferredStartDate ? new Date(selectedBooking.preferredStartDate).toLocaleDateString() : 'Not specified'}</p>
                  <p className="text-gray-300"><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</p>
                  {selectedBooking.type === 'confirmed' && (
                    <>
                      <p className="text-gray-300"><strong>Amount Paid:</strong> {bookingService.formatCurrency(selectedBooking.amount_paid)}</p>
                      {selectedBooking.booking_number && (
                        <p className="text-gray-300"><strong>Booking Number:</strong> {selectedBooking.booking_number}</p>
                      )}
                      {selectedBooking.payment_method && (
                        <p className="text-gray-300"><strong>Payment Method:</strong> {selectedBooking.payment_method}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {selectedBooking.message && (
                <div>
                  <h4 className="text-white font-medium mb-3">Complete Message:</h4>
                  <div className="p-4 bg-gray-700 rounded-lg text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedBooking.message || 'No message content available'}
                  </div>
                </div>
              )}

              {selectedBooking.warehouse && (
                <div>
                  <h4 className="text-white font-medium mb-2">Warehouse Information:</h4>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-white font-medium">{selectedBooking.warehouse.name}</p>
                    <p className="text-gray-300 text-sm">{selectedBooking.warehouse.address}</p>
                    <p className="text-gray-300 text-sm">{selectedBooking.warehouse.city}, {selectedBooking.warehouse.state}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;