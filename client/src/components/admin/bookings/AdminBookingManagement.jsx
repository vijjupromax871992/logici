// src/components/admin/bookings/AdminBookingManagement.jsx - ENHANCED WITH CONFIRMED BOOKINGS
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Phone, 
  Mail, 
  Building,
  Search,
  Trash2,
  Eye,
  Filter,
  CreditCard,
  FileText,
  DollarSign
} from 'lucide-react';
import bookingService from '../../../services/bookingService';
import { useTheme } from '../../../contexts/ThemeContext';

const BookingStatusBadge = ({ status, type }) => {
  let colors, statusLabels;

  if (type === 'inquiry') {
    colors = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      contacted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      resolved: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    };
    statusLabels = {
      pending: 'Pending',
      contacted: 'Contacted',
      resolved: 'Resolved'
    };
  } else {
    colors = {
      confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
      active: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      completed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    statusLabels = {
      confirmed: 'Confirmed',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.pending}`}>
      {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const BookingTypeBadge = ({ type, isPaid }) => {
  if (type === 'confirmed' || isPaid) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
        <CreditCard className="w-3 h-3" />
        Paid
      </span>
    );
  } else {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1">
        <FileText className="w-3 h-3" />
        Inquiry
      </span>
    );
  }
};

const AdminBookingManagement = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    type: 'all' // all, inquiries, confirmed
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.getAllBookingsAdmin({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      if (response.success) {
        setBookings(response.data || []);
        setSummary(response.summary || null);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 0
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Fetch admin bookings error:', err);
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId, newStatus, notes = '', type) => {
    try {
      setUpdating(prev => ({ ...prev, [bookingId]: true }));
      setError(null);
      
      const response = await bookingService.updateBookingStatusAdmin(bookingId, newStatus, notes, type);
      
      if (response.success) {
        setBookings(currentBookings => 
          currentBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
              : booking
          )
        );
        
        setError(`Booking status updated to ${newStatus}`);
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(`Failed to update booking status: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleDeleteBooking = async (bookingId, type) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [bookingId]: true }));
      
      const response = await bookingService.deleteBookingAdmin(bookingId, type);
      
      if (response.success) {
        setBookings(currentBookings => 
          currentBookings.filter(booking => booking.id !== bookingId)
        );
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        setError('Booking deleted successfully');
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
      setError(`Failed to delete booking: ${err.message}`);
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
      if (message.includes('%') || message.includes('+')) {
        return decodeURIComponent(message.replace(/\+/g, ' '));
      }
      
      if (message.length > 200 && message.includes(',')) {
        const parts = message.split(',');
        const meaningfulParts = parts.filter(part => 
          part.length > 10 && 
          part.length < 100 && 
          !part.includes('undefined') &&
          !/^[a-z]{20,}$/.test(part)
        );
        
        if (meaningfulParts.length > 0) {
          return meaningfulParts[0].trim();
        }
      }
      
      if (message.length > 300) {
        const sentences = message.split(/[.!?]/);
        const meaningfulSentence = sentences.find(s => 
          s.length > 10 && 
          s.length < 200 && 
          !/^[a-z]{20,}$/.test(s.trim())
        );
        
        if (meaningfulSentence) {
          return meaningfulSentence.trim() + '.';
        }
      }
      
      return message;
    } catch (e) {
      console.error('Error formatting message:', e);
      return 'Message could not be displayed';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3" style={{ color: theme.textPrimary }}>Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 lg:gap-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold" style={{ color: theme.textPrimary }}>Booking Management</h2>
        
        {/* Enhanced Stats */}
        {summary && (
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-5 text-sm">
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base" style={{ backgroundColor: theme.primaryLight, color: theme.primary, borderColor: theme.primary + '33' }}>
              Total: {pagination.total}
            </div>
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base flex items-center gap-1" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.2)' }}>
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              Inquiries: {summary.total_inquiries}
            </div>
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base flex items-center gap-1" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: theme.success, borderColor: theme.success + '33' }}>
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              Paid: {summary.total_confirmed}
            </div>
            <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm md:text-base flex items-center gap-1" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', borderColor: 'rgba(147, 51, 234, 0.2)' }}>
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              Revenue: {bookingService.formatCurrency(summary.total_revenue)}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textSecondary }} />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-1"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: theme.textSecondary }} />
          
          <select
            className="px-4 py-2 rounded-lg border focus:ring-1"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="inquiries">Inquiries Only</option>
            <option value="confirmed">Paid Bookings</option>
          </select>
          
          <select
            className="px-4 py-2 rounded-lg border focus:ring-1"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
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
      </div>

      {/* Error/Success Message */}
      {error && (
        <div className={`p-4 rounded-lg ${
          error.includes('updated') || error.includes('deleted')
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {error}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-8 text-center" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <p style={{ color: theme.textSecondary }}>No bookings found.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6 transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, ':hover': { backgroundColor: theme.surfaceHover } }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium" style={{ color: theme.textPrimary }}>{booking.fullName}</h3>
                    <BookingTypeBadge type={booking.type} isPaid={booking.is_paid} />
                    <BookingStatusBadge status={booking.status} type={booking.type} />
                  </div>
                  
                  {booking.companyName && (
                    <p className="flex items-center mb-2" style={{ color: theme.textSecondary }}>
                      <Building className="w-4 h-4 mr-1" />
                      {booking.companyName}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="flex items-center" style={{ color: theme.textSecondary }}>
                        <Mail className="w-4 h-4 mr-2" />
                        {booking.email}
                      </p>
                      <p className="flex items-center" style={{ color: theme.textSecondary }}>
                        <Phone className="w-4 h-4 mr-2" />
                        {booking.phoneNumber}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p style={{ color: theme.textSecondary }}>
                        <strong>Contact Method:</strong> {booking.preferredContactMethod}
                      </p>
                      <p className="flex items-center" style={{ color: theme.textSecondary }}>
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.preferredContactTime}
                      </p>
                    </div>
                  </div>

                  {/* Payment Information for Confirmed Bookings */}
                  {booking.type === 'confirmed' && (
                    <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-green-400">
                          <strong>Amount Paid:</strong> {bookingService.formatCurrency(booking.amount_paid)}
                        </div>
                        {booking.booking_number && (
                          <div className="text-green-400">
                            <strong>Booking #:</strong> {booking.booking_number}
                          </div>
                        )}
                        {booking.payment_method && (
                          <div className="text-green-400">
                            <strong>Payment Method:</strong> {booking.payment_method}
                          </div>
                        )}
                        {booking.razorpay_payment_id && (
                          <div className="text-green-400">
                            <strong>Payment ID:</strong> {booking.razorpay_payment_id.substring(0, 20)}...
                          </div>
                        )}
                      </div>
                      {booking.payment_date && (
                        <div className="text-xs text-green-400 mt-1">
                          Paid on: {new Date(booking.payment_date).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3 min-w-[250px]">
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-1 disabled:opacity-50"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value, '', booking.type)}
                      disabled={updating[booking.id]}
                    >
                      {getStatusOptions(booking.type).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary, color: theme.textInverted }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBooking(booking.id, booking.type)}
                      disabled={updating[booking.id]}
                      className="p-2 rounded-lg transition-colors disabled:opacity-50"
                      style={{ backgroundColor: theme.error, color: theme.textInverted }}
                      title="Delete Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {booking.preferredStartDate ? 
                        new Date(booking.preferredStartDate).toLocaleDateString() : 
                        'No date specified'
                      }
                    </div>
                    {booking.updatedAt && (
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                        Updated: {new Date(booking.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  {updating[booking.id] && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Message Section */}
              {booking.message && (
                <div className="mt-4 p-3 rounded-lg border-l-4" style={{ background: theme.cardBg, borderLeftColor: theme.primary }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>Message:</h4>
                  <div className="text-sm leading-relaxed" style={{ color: theme.textPrimary }}>
                    {formatMessage(booking.message).substring(0, 150)}
                    {formatMessage(booking.message).length > 150 && '...'}
                  </div>
                </div>
              )}
              
              {/* Warehouse Info */}
              {booking.warehouse && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: theme.cardBg }}>
                  <h4 className="text-sm font-medium mb-1" style={{ color: theme.textPrimary }}>Warehouse:</h4>
                  <p className="text-sm" style={{ color: theme.textPrimary }}>{booking.warehouse.name}</p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>{booking.warehouse.city}, {booking.warehouse.state}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-5 md:gap-6 mt-4 sm:mt-6 md:mt-8">
          <p className="text-xs sm:text-sm md:text-base font-medium" style={{ color: theme.textSecondary }}>
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: theme.buttonSecondary, color: theme.textInverted }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2" style={{ color: theme.textPrimary }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: theme.buttonSecondary, color: theme.textInverted }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg || theme.background || '#ffffff', border: `2px solid ${theme.cardBorder || '#e5e7eb'}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold" style={{ color: theme.textPrimary }}>Booking Details</h3>
                <BookingTypeBadge type={selectedBooking.type} isPaid={selectedBooking.is_paid} />
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="hover:opacity-80"
                style={{ color: theme.textSecondary }}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h4 className="font-medium text-lg" style={{ color: theme.textPrimary }}>{selectedBooking.fullName}</h4>
                <BookingStatusBadge status={selectedBooking.status} type={selectedBooking.type} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2" style={{ color: theme.textPrimary }}>Contact Information</h5>
                    <div className="space-y-2 text-sm">
                      <p style={{ color: theme.textPrimary }}><strong>Email:</strong> {selectedBooking.email}</p>
                      <p style={{ color: theme.textPrimary }}><strong>Phone:</strong> {selectedBooking.phoneNumber}</p>
                      <p style={{ color: theme.textPrimary }}><strong>Company:</strong> {selectedBooking.companyName}</p>
                      <p style={{ color: theme.textPrimary }}><strong>Contact Method:</strong> {selectedBooking.preferredContactMethod}</p>
                      <p style={{ color: theme.textPrimary }}><strong>Contact Time:</strong> {selectedBooking.preferredContactTime}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: theme.textPrimary }}>Booking Information</h5>
                    <div className="space-y-2 text-sm">
                      <p style={{ color: theme.textPrimary }}><strong>Start Date:</strong> {selectedBooking.preferredStartDate ? new Date(selectedBooking.preferredStartDate).toLocaleDateString() : 'Not specified'}</p>
                      <p style={{ color: theme.textPrimary }}><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</p>
                      {selectedBooking.updatedAt && (
                        <p style={{ color: theme.textPrimary }}><strong>Last Updated:</strong> {new Date(selectedBooking.updatedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedBooking.type === 'confirmed' && (
                    <div>
                      <h5 className="text-green-400 font-medium mb-2">Payment Information</h5>
                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 space-y-2 text-sm">
                        <p className="text-green-400"><strong>Amount Paid:</strong> {bookingService.formatCurrency(selectedBooking.amount_paid)}</p>
                        {selectedBooking.booking_number && (
                          <p className="text-green-400"><strong>Booking Number:</strong> {selectedBooking.booking_number}</p>
                        )}
                        {selectedBooking.payment_method && (
                          <p className="text-green-400"><strong>Payment Method:</strong> {selectedBooking.payment_method}</p>
                        )}
                        {selectedBooking.razorpay_payment_id && (
                          <p className="text-green-400"><strong>Payment ID:</strong> {selectedBooking.razorpay_payment_id}</p>
                        )}
                        {selectedBooking.payment_date && (
                          <p className="text-green-400"><strong>Payment Date:</strong> {new Date(selectedBooking.payment_date).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedBooking.warehouse && (
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: theme.textPrimary }}>Warehouse Information</h5>
                      <div className="p-4 rounded-lg space-y-2 text-sm" style={{ backgroundColor: theme.surface || theme.cardBg || 'rgba(255, 255, 255, 0.95)', border: `2px solid ${theme.cardBorder || '#e5e7eb'}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <p className="font-medium" style={{ color: theme.textPrimary || '#1f2937' }}>{selectedBooking.warehouse.name}</p>
                        {selectedBooking.warehouse.address && (
                          <p style={{ color: theme.textPrimary || '#1f2937' }}>{selectedBooking.warehouse.address}</p>
                        )}
                        <p style={{ color: theme.textPrimary || '#1f2937' }}>{selectedBooking.warehouse.city}, {selectedBooking.warehouse.state}</p>
                        {selectedBooking.warehouse.warehouse_type && (
                          <p style={{ color: theme.textSecondary || '#6b7280' }}>Type: {selectedBooking.warehouse.warehouse_type}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedBooking.owner && (
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: theme.textPrimary }}>Warehouse Owner</h5>
                      <div className="p-4 rounded-lg space-y-2 text-sm" style={{ backgroundColor: theme.surface || theme.cardBg || 'rgba(255, 255, 255, 0.95)', border: `2px solid ${theme.cardBorder || '#e5e7eb'}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <p style={{ color: theme.textPrimary || '#1f2937' }}>{selectedBooking.owner.firstName} {selectedBooking.owner.lastName}</p>
                        <p style={{ color: theme.textPrimary || '#1f2937' }}>{selectedBooking.owner.email}</p>
                        {selectedBooking.owner.mobileNumber && (
                          <p style={{ color: theme.textPrimary || '#1f2937' }}>{selectedBooking.owner.mobileNumber}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedBooking.message && (
                <div>
                  <h5 className="font-medium mb-3" style={{ color: theme.textPrimary }}>Complete Message</h5>
                  <div className="p-4 rounded-lg whitespace-pre-wrap break-words leading-relaxed" style={{ backgroundColor: theme.surface || theme.cardBg || 'rgba(255, 255, 255, 0.95)', color: theme.textPrimary || '#1f2937', border: `2px solid ${theme.cardBorder || '#e5e7eb'}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '60px' }}>
                    {formatMessage(selectedBooking.message)}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="border-t pt-4" style={{ borderColor: theme.cardBorder }}>
                <h5 className="font-medium mb-3" style={{ color: theme.textPrimary }}>Admin Actions</h5>
                <div className="flex gap-3">
                  <select
                    className="px-4 py-2 rounded-lg border focus:ring-1"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                    value={selectedBooking.status}
                    onChange={(e) => {
                      handleStatusUpdate(selectedBooking.id, e.target.value, '', selectedBooking.type);
                      setSelectedBooking(prev => ({ ...prev, status: e.target.value }));
                    }}
                  >
                    {getStatusOptions(selectedBooking.type).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => {
                      handleDeleteBooking(selectedBooking.id, selectedBooking.type);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    style={{ backgroundColor: theme.error, color: theme.textInverted }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;