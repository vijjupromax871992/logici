// components/admin/inquiries/AdminInquiries.jsx
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Users } from 'lucide-react';
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';

const AdminInquiries = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('unallocated');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('unallocated');

  // Allocation modal state
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [businessPartners, setBusinessPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    fetchInquiries();
    fetchBusinessPartners();
  }, [currentPage, statusFilter, activeTab]);

  // Update statusFilter when activeTab changes
  useEffect(() => {
    setStatusFilter(activeTab);
    setCurrentPage(1); // Reset to first page when changing tabs
  }, [activeTab]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/admin/inquiries?page=${currentPage}&limit=10&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch inquiries');
      }
      if (data.success) {
        setInquiries(data.data);
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.message || 'Failed to fetch inquiries');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessPartners = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/users?role=partner`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();

      // Check if data exists and has the expected format
      if (data.success && Array.isArray(data.data)) {
        setBusinessPartners(data.data);
      } else if (data.success && data.data.rows) {
        // Handle paginated response
        setBusinessPartners(data.data.rows);
      } else {
        setBusinessPartners([]);
      }
    } catch (err) {
      setBusinessPartners([]);
    }
  };

  const handleAllocate = async () => {
    if (!selectedPartnerId || !selectedInquiry) {
      setError('Please select a business partner');
      return;
    }

    try {
      setAllocating(true);
      const response = await fetch(
        `${BACKEND_URL}/api/admin/inquiries/${selectedInquiry.id}/allocate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partnerId: selectedPartnerId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Inquiry allocated successfully');
        await fetchInquiries(); // Refresh the list
        setShowAllocationModal(false);
        setSelectedInquiry(null);
        setSelectedPartnerId('');

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to allocate inquiry');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAllocating(false);
    }
  };

  const handleMarkInvalid = async (inquiryId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/inquiries/${inquiryId}/invalid`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: 'Marked as invalid by admin',
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Inquiry marked as invalid');
        await fetchInquiries(); // Refresh the list

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to mark inquiry as invalid');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = async (inquiryId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/inquiries/${inquiryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // For now, show a simple alert with inquiry details
        // This could be enhanced with a proper modal later
        const inquiry = data.data;
        alert(`Inquiry Details:
        
Name: ${inquiry.fullName}
Email: ${inquiry.email}
Phone: ${inquiry.phoneNumber}
Company: ${inquiry.companyName}
Type: ${inquiry.inquiryType}
Status: ${inquiry.allocation_status}
Message: ${inquiry.message || 'No message'}
Created: ${new Date(inquiry.createdAt).toLocaleString()}
${inquiry.allocated_to ? `Allocated to: ${inquiry.allocated_to.firstName} ${inquiry.allocated_to.lastName}` : ''}`);
      } else {
        throw new Error(data.message || 'Failed to fetch inquiry details');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReactivateInquiry = async (inquiryId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/inquiries/${inquiryId}/reactivate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Inquiry reactivated successfully');
        await fetchInquiries(); // Refresh the list

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to reactivate inquiry');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!confirm('Are you sure you want to permanently delete this inquiry? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/inquiries/${inquiryId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Inquiry deleted successfully');
        await fetchInquiries(); // Refresh the list

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to delete inquiry');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: theme.primary, borderBottomColor: theme.primary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6" style={{ background: theme.background }}>
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>
          Inquiries Management
        </h1>
        <p className="text-sm sm:text-lg" style={{ color: theme.textSecondary }}>
          View and manage your inquiries
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg flex items-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: theme.success }}>
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg flex items-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: theme.error }}>
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div 
        className="flex mb-4 sm:mb-6 rounded-lg p-1"
        style={{ background: theme.surface }}
      >
        <button
          className="flex-1 py-2 sm:py-3 px-2 sm:px-6 rounded-md transition-colors font-medium text-xs sm:text-sm"
          style={{
            background: activeTab === 'unallocated' ? theme.primary : 'transparent',
            color: activeTab === 'unallocated' ? theme.textInverted : theme.textSecondary
          }}
          onClick={() => setActiveTab('unallocated')}
        >
          <span className="hidden sm:inline">Unallocated Inquiries</span>
          <span className="sm:hidden">Unallocated</span>
        </button>
        <button
          className="flex-1 py-2 sm:py-3 px-2 sm:px-6 rounded-md transition-colors font-medium text-xs sm:text-sm"
          style={{
            background: activeTab === 'allocated' ? theme.primary : 'transparent',
            color: activeTab === 'allocated' ? theme.textInverted : theme.textSecondary
          }}
          onClick={() => setActiveTab('allocated')}
        >
          <span className="hidden sm:inline">Allocated Inquiries</span>
          <span className="sm:hidden">Allocated</span>
        </button>
      </div>

      {/* Additional Filters for Invalid inquiries - only show when on allocated tab */}
      {activeTab === 'allocated' && (
        <div className="mb-4 sm:mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg px-3 sm:px-4 py-2 text-sm w-full sm:w-auto"
            style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }}
          >
            <option value="allocated">Allocated</option>
            <option value="invalid">Invalid</option>
          </select>
        </div>
      )}

      {/* Inquiries Table - Desktop */}
      <div className="hidden md:block">
        <div className="rounded-lg shadow overflow-hidden" style={{ background: theme.cardBg, boxShadow: theme.cardShadow }}>
          <table className="min-w-full divide-y" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: theme.surface }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Client Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Actions
                </th>
              </tr>
            </thead>
          <tbody className="divide-y" style={{ backgroundColor: theme.surface, borderColor: theme.cardBorder }}>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="hover:bg-opacity-10" style={{ '&:hover': { backgroundColor: theme.surfaceHover } }}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                    {inquiry.fullName}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>{inquiry.email}</div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {inquiry.phoneNumber}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {inquiry.companyName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: theme.primaryLight, color: theme.primary }}>
                    {inquiry.inquiryType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: theme.textSecondary }}>
                  {inquiry.message || 'No message provided'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: inquiry.allocation_status === 'unallocated'
                        ? 'rgba(245, 158, 11, 0.1)'
                        : inquiry.allocation_status === 'allocated'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                      color: inquiry.allocation_status === 'unallocated'
                        ? theme.warning
                        : inquiry.allocation_status === 'allocated'
                        ? theme.success
                        : theme.error
                    }}
                  >
                    {inquiry.allocation_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: theme.textSecondary }}>
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  {inquiry.allocation_status === 'unallocated' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowAllocationModal(true);
                        }}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.primary }}
                      >
                        Allocate
                      </button>
                      <button
                        onClick={() => handleMarkInvalid(inquiry.id)}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.error }}
                      >
                        Invalid
                      </button>
                    </>
                  )}
                  {inquiry.allocation_status === 'allocated' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowAllocationModal(true);
                        }}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.warning }}
                      >
                        Reallocate
                      </button>
                      <button
                        onClick={() => handleMarkInvalid(inquiry.id)}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.error }}
                      >
                        Invalid
                      </button>
                      <button
                        onClick={() => handleViewDetails(inquiry.id)}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.success }}
                      >
                        View
                      </button>
                    </>
                  )}
                  {inquiry.allocation_status === 'invalid' && (
                    <>
                      <button
                        onClick={() => handleReactivateInquiry(inquiry.id)}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.success }}
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.error }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Inquiries Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="rounded-lg p-4 shadow"
            style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-sm" style={{ color: theme.textPrimary }}>
                  {inquiry.fullName}
                </h3>
                <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                  {inquiry.email}
                </p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {inquiry.phoneNumber}
                </p>
                {inquiry.companyName && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {inquiry.companyName}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: theme.primaryLight, color: theme.primary }}>
                  {inquiry.inquiryType}
                </span>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: inquiry.allocation_status === 'unallocated'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : inquiry.allocation_status === 'allocated'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    color: inquiry.allocation_status === 'unallocated'
                      ? theme.warning
                      : inquiry.allocation_status === 'allocated'
                      ? theme.success
                      : theme.error
                  }}
                >
                  {inquiry.allocation_status}
                </span>
              </div>
            </div>
            
            {inquiry.message && (
              <div className="mb-3 p-2 rounded" style={{ backgroundColor: theme.surface }}>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {inquiry.message.length > 100 ? inquiry.message.substring(0, 100) + '...' : inquiry.message}
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3" style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
              <span className="text-xs" style={{ color: theme.textSecondary }}>
                {new Date(inquiry.createdAt).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                {inquiry.allocation_status === 'unallocated' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setShowAllocationModal(true);
                      }}
                      className="px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: theme.primary, color: theme.textInverted }}
                    >
                      Allocate
                    </button>
                    <button
                      onClick={() => handleMarkInvalid(inquiry.id)}
                      className="px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: theme.error, color: theme.textInverted }}
                    >
                      Invalid
                    </button>
                  </>
                )}
                {inquiry.allocation_status === 'allocated' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setShowAllocationModal(true);
                      }}
                      className="px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: theme.warning, color: theme.textInverted }}
                    >
                      Reallocate
                    </button>
                    <button
                      onClick={() => handleMarkInvalid(inquiry.id)}
                      className="px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: theme.error, color: theme.textInverted }}
                    >
                      Invalid
                    </button>
                  </>
                )}
                {inquiry.allocation_status === 'invalid' && (
                  <>
                    <button
                      onClick={() => handleReactivateInquiry(inquiry.id)}
                      className="px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: theme.success, color: theme.textInverted }}
                    >
                      Reactivate
                    </button>
                    <button
                      onClick={() => handleDeleteInquiry(inquiry.id)}
                      className="px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: theme.error, color: theme.textInverted }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className="px-3 py-1 rounded transition-all"
              style={{
                background: currentPage === index + 1 ? theme.primaryGradient : theme.inputBg,
                color: currentPage === index + 1 ? theme.textInverted : theme.textSecondary,
                border: `1px solid ${currentPage === index + 1 ? 'transparent' : theme.inputBorder}`
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg shadow-xl max-w-lg w-full mx-4" style={{ background: theme.cardBg, boxShadow: theme.cardShadow }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 mr-2" style={{ color: theme.primary }} />
                  <h3 className="text-lg font-medium" style={{ color: theme.textPrimary }}>
                    Allocate Inquiry to Business Partner
                  </h3>
                </div>
                <button
                  onClick={() => setShowAllocationModal(false)}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: theme.textSecondary }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
                  Inquiry from: {selectedInquiry?.fullName} (
                  {selectedInquiry?.companyName})
                </p>
                {businessPartners.length > 0 ? (
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full rounded-lg px-4 py-2"
                    style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }}
                  >
                    <option value="">Select Business Partner</option>
                    {businessPartners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.firstName} {partner.lastName} - {partner.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm" style={{ color: theme.error }}>
                    No business partners available
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAllocationModal(false)}
                  className="px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: theme.buttonSecondary, color: theme.textPrimary }}
                  disabled={allocating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAllocate}
                  disabled={
                    allocating ||
                    !selectedPartnerId ||
                    businessPartners.length === 0
                  }
                  className="px-4 py-2 rounded-lg hover:opacity-90 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  style={{ background: theme.buttonPrimary, color: theme.textInverted }}
                >
                  {allocating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Allocating...
                    </>
                  ) : (
                    'Allocate Inquiry'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
