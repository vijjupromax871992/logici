// components/user/inquiries/PartnerInquiries.jsx
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Filter } from 'lucide-react';
import inquiryService from '../../../services/inquiryService';
import { useTheme } from '../../../contexts/ThemeContext';

const PartnerInquiries = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('allocated');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first

  // Fetch inquiries based on active tab
  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (activeTab === 'allocated') {
          data = await inquiryService.getPartnerInquiries();
        } else {
          data = await inquiryService.getUnallocatedInquiries();
        }
        setInquiries(data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch inquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [activeTab]);

  // Handle status update
  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      await inquiryService.updateInquiryStatus(inquiryId, newStatus);
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: newStatus }
          : inquiry
      ));
      setSuccessMessage('Status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update status');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter and sort inquiries
  const getFilteredAndSortedInquiries = () => {
    return inquiries
      .filter(inquiry => statusFilter === 'all' || inquiry.status === statusFilter)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: theme.primary }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8"
      style={{ background: theme.background }}
    >
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-3"
          style={{ color: theme.textPrimary }}
        >
          Inquiries Management
        </h1>
        <p className="text-sm sm:text-base md:text-lg" style={{ color: theme.textSecondary }}>View and manage your inquiries</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div 
          className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 rounded-lg flex items-center"
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${theme.success}50`,
            color: theme.success
          }}
        >
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3" />
          <span className="text-sm sm:text-base md:text-lg">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div 
          className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 rounded-lg flex items-center"
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${theme.error}50`,
            color: theme.error
          }}
        >
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3" />
          <span className="text-sm sm:text-base md:text-lg">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div 
        className="flex mb-4 sm:mb-6 md:mb-8 rounded-lg p-1 sm:p-1.5"
        style={{ background: theme.surface }}
      >
        <button
          className="flex-1 py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 md:px-6 rounded-md transition-colors text-xs sm:text-sm md:text-base lg:text-lg font-medium"
          style={{
            background: activeTab === 'allocated' ? theme.primary : 'transparent',
            color: activeTab === 'allocated' ? theme.textInverted : theme.textSecondary
          }}
          onClick={() => setActiveTab('allocated')}
        >
          <span className="hidden sm:inline">Allocated Inquiries</span>
          <span className="sm:hidden">Allocated</span>
        </button>
        <button
          className="flex-1 py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 md:px-6 rounded-md transition-colors text-xs sm:text-sm md:text-base lg:text-lg font-medium"
          style={{
            background: activeTab === 'unallocated' ? theme.primary : 'transparent',
            color: activeTab === 'unallocated' ? theme.textInverted : theme.textSecondary
          }}
          onClick={() => setActiveTab('unallocated')}
        >
          <span className="hidden sm:inline">Unallocated Inquiries</span>
          <span className="sm:hidden">Unallocated</span>
        </button>
      </div>

      {/* Filters and Sort - Only show for allocated inquiries */}
      {activeTab === 'allocated' && (
        <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 sm:justify-between mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center">
            <div 
              className="flex items-center rounded-lg px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 w-full sm:w-auto md:min-w-[160px] lg:min-w-[180px]"
              style={{ background: theme.surface }}
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3" style={{ color: theme.textSecondary }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm sm:text-base md:text-lg flex-1"
                style={{ color: theme.textPrimary }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 border-none focus:ring-0 text-sm sm:text-base md:text-lg w-full sm:w-auto md:min-w-[140px] lg:min-w-[160px]"
              style={{
                background: theme.surface,
                color: theme.textPrimary
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      )}

      {/* Inquiries Table - Desktop */}
      <div className="hidden md:block">
        <div 
          className="rounded-lg shadow-lg overflow-hidden"
          style={{ background: theme.cardBg }}
        >
          <table className="min-w-full">
            <thead style={{ background: theme.surface }}>
              <tr>
                <th 
                  className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-left text-xs md:text-sm lg:text-base font-medium uppercase tracking-wider"
                  style={{ color: theme.textSecondary }}
                >
                  Inquiry Details
                </th>
                <th 
                  className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-left text-xs md:text-sm lg:text-base font-medium uppercase tracking-wider"
                  style={{ color: theme.textSecondary }}
                >
                  Type
                </th>
                <th 
                  className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-left text-xs md:text-sm lg:text-base font-medium uppercase tracking-wider"
                  style={{ color: theme.textSecondary }}
                >
                  Status
                </th>
                <th 
                  className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-left text-xs md:text-sm lg:text-base font-medium uppercase tracking-wider"
                  style={{ color: theme.textSecondary }}
                >
                  Date
                </th>
                {activeTab === 'allocated' && (
                  <th 
                    className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-right text-xs md:text-sm lg:text-base font-medium uppercase tracking-wider"
                    style={{ color: theme.textSecondary }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedInquiries().map((inquiry) => (
                <tr 
                  key={inquiry.id} 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ 
                    borderTop: `1px solid ${theme.cardBorder}`
                  }}
                >
                  <td className="px-6 py-4">
                    <div 
                      className="text-sm"
                      style={{ color: theme.textPrimary }}
                    >
                      {inquiry.fullName}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      {inquiry.email}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      {inquiry.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      style={{
                        background: theme.primaryLight,
                        color: theme.primary
                      }}
                    >
                      {inquiry.inquiryType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      style={{
                        background: inquiry.status === 'completed'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : inquiry.status === 'in_progress'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : theme.surface,
                        color: inquiry.status === 'completed'
                          ? theme.success
                          : inquiry.status === 'in_progress'
                          ? theme.warning
                          : theme.textSecondary
                      }}
                    >
                      {inquiry.status}
                    </span>
                  </td>
                  <td 
                    className="px-6 py-4 text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                  {activeTab === 'allocated' && (
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                        className="rounded px-3 py-1 text-sm border-none focus:ring-1"
                        style={{
                          background: theme.surface,
                          color: theme.textPrimary,
                          focusRingColor: theme.primary
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Inquiries Cards - Mobile & Tablet */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {getFilteredAndSortedInquiries().map((inquiry) => (
          <div
            key={inquiry.id}
            className="rounded-lg p-4 sm:p-5 shadow-md"
            style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base md:text-lg truncate" style={{ color: theme.textPrimary }}>
                  {inquiry.fullName}
                </h3>
                <p className="text-xs sm:text-sm mt-1 break-all" style={{ color: theme.textSecondary }}>
                  {inquiry.email}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: theme.textSecondary }}>
                  {inquiry.phoneNumber}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-3">
                <span 
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap"
                  style={{
                    background: theme.primaryLight,
                    color: theme.primary
                  }}
                >
                  {inquiry.inquiryType}
                </span>
                <span
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap"
                  style={{
                    background: inquiry.status === 'completed'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : inquiry.status === 'in_progress'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : theme.surface,
                    color: inquiry.status === 'completed'
                      ? theme.success
                      : inquiry.status === 'in_progress'
                      ? theme.warning
                      : theme.textSecondary
                  }}
                >
                  {inquiry.status}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
              <span className="text-xs sm:text-sm font-medium" style={{ color: theme.textSecondary }}>
                {new Date(inquiry.createdAt).toLocaleDateString()}
              </span>
              {activeTab === 'allocated' && (
                <select
                  value={inquiry.status}
                  onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                  className="rounded px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-none focus:ring-1 w-full sm:w-auto"
                  style={{
                    background: theme.surface,
                    color: theme.textPrimary,
                    focusRingColor: theme.primary
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerInquiries;