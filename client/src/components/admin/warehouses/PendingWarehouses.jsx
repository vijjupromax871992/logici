import { useState, useEffect } from 'react';
import {BACKEND_URL} from '../../../config/api';
import ThemedPageWrapper from '../common/ThemedPageWrapper';
import { useTheme } from '../../../contexts/ThemeContext';

const PendingWarehouses = () => {
  const { theme } = useTheme();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPendingWarehouses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_URL}/admin/warehouses/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setWarehouses(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch pending warehouses');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch pending warehouses');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingWarehouses();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/admin/warehouses/approve/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
        setSuccessMessage('Warehouse approved successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to approve warehouse');
      }
    } catch (err) {
      setError('Failed to approve warehouse');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/admin/warehouses/reject/${currentWarehouse.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setWarehouses(warehouses.filter(w => w.id !== currentWarehouse.id));
        setShowRejectionModal(false);
        setSuccessMessage('Warehouse rejected successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to reject warehouse');
      }
    } catch (err) {
      setError('Failed to reject warehouse');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (images) => {
    if (!images) return '/placeholder-warehouse.jpg';
    
    // Handle array of images
    if (Array.isArray(images)) {
      if (images.length === 0) return '/placeholder-warehouse.jpg';
      const mainImage = images[0];
      return mainImage.startsWith('http') ? mainImage : `${BACKEND_URL}/${mainImage}`;
    }
    
    // Handle comma-separated string of images
    if (typeof images === 'string') {
      const imageArray = images.split(',').map(img => img.trim());
      if (imageArray.length === 0) return '/placeholder-warehouse.jpg';
      const mainImage = imageArray[0];
      return mainImage.startsWith('http') ? mainImage : `${BACKEND_URL}/${mainImage}`;
    }
    
    return '/placeholder-warehouse.jpg';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ThemedPageWrapper title="Pending Warehouse Approvals" subtitle="Review and approve warehouse registration requests">
      <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ background: theme.background }}>

      {successMessage && (
        <div className="px-3 py-2 sm:px-4 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: theme.success }}>
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="px-3 py-2 sm:px-4 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: theme.error }}>
          <p>{error}</p>
        </div>
      )}

      {warehouses.length === 0 ? (
        <div className="rounded-lg shadow p-4 sm:p-6 text-center" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.textMuted }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg sm:text-xl font-medium mb-2" style={{ color: theme.textPrimary }}>All caught up!</h2>
          <p className="text-sm sm:text-base" style={{ color: theme.textMuted }}>There are no pending warehouse approvals at this time.</p>
        </div>
      ) : (
        <div className="rounded-lg shadow overflow-hidden" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          {/* Desktop view table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y" style={{ borderColor: theme.cardBorder }}>
              <thead style={{ backgroundColor: theme.surface }}>
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Warehouse
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Owner
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Location
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Date Submitted
                  </th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: theme.surface, borderColor: theme.cardBorder }}>
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="transition-colors" 
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = theme.surfaceHover}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img 
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover" 
                            src={getImageUrl(warehouse.images)}
                            alt={warehouse.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-warehouse.jpg';
                            }}
                          />
                        </div>
                        <div className="ml-3 md:ml-4">
                          <div className="text-xs sm:text-sm font-medium" style={{ color: theme.textPrimary }}>
                            {warehouse.name}
                          </div>
                          <div className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                            {warehouse.warehouse_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm" style={{ color: theme.textPrimary }}>
                        {warehouse.owner?.firstName} {warehouse.owner?.lastName}
                      </div>
                      <div className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                        {warehouse.owner?.email}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm" style={{ color: theme.textPrimary }}>
                        {warehouse.city}, {warehouse.state}
                      </div>
                      <div className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                        {warehouse.country}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                      {new Date(warehouse.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <button
                        className="mr-4 disabled:opacity-50 transition-colors"
                        style={{ color: theme.success }}
                        onMouseEnter={(e) => e.target.style.color = '#6ee7b7'}
                        onMouseLeave={(e) => e.target.style.color = theme.success}
                        onClick={() => handleApprove(warehouse.id)}
                        disabled={actionLoading}
                      >
                        Approve
                      </button>
                      <button
                        className="disabled:opacity-50 transition-colors"
                        style={{ color: theme.error }}
                        onMouseEnter={(e) => e.target.style.color = '#fca5a5'}
                        onMouseLeave={(e) => e.target.style.color = theme.error}
                        onClick={() => {
                          setCurrentWarehouse(warehouse);
                          setRejectionReason('');
                          setShowRejectionModal(true);
                        }}
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view cards */}
          <div className="md:hidden space-y-4 p-4">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id} className="rounded-lg p-4 shadow" style={{ background: theme.surface, border: `1px solid ${theme.cardBorder}` }}>
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0 h-12 w-12">
                    <img 
                      className="h-12 w-12 rounded-md object-cover" 
                      src={getImageUrl(warehouse.images)}
                      alt={warehouse.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-warehouse.jpg';
                      }}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium" style={{ color: theme.textPrimary }}>{warehouse.name}</div>
                    <div className="text-xs mt-1" style={{ color: theme.textMuted }}>{warehouse.warehouse_type}</div>
                  </div>
                </div>

                <div className="mb-3 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <div style={{ color: theme.textMuted }}>Owner</div>
                    <div style={{ color: theme.textPrimary }}>{warehouse.owner?.firstName} {warehouse.owner?.lastName}</div>
                    <div className="truncate max-w-[150px]" style={{ color: theme.textMuted }}>{warehouse.owner?.email}</div>
                  </div>
                  <div>
                    <div style={{ color: theme.textMuted }}>Location</div>
                    <div style={{ color: theme.textPrimary }}>{warehouse.city}, {warehouse.state}</div>
                    <div style={{ color: theme.textMuted }}>{warehouse.country}</div>
                  </div>
                </div>

                <div className="text-xs mb-3" style={{ color: theme.textMuted }}>
                  Submitted: {new Date(warehouse.createdAt).toLocaleDateString()}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    className="px-3 py-1 rounded text-xs font-medium disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: theme.success }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
                    onClick={() => handleApprove(warehouse.id)}
                    disabled={actionLoading}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 rounded text-xs font-medium disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: theme.error }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                    onClick={() => {
                      setCurrentWarehouse(warehouse);
                      setRejectionReason('');
                      setShowRejectionModal(true);
                    }}
                    disabled={actionLoading}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg shadow-xl max-w-lg w-full mx-auto" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4" style={{ color: theme.textPrimary }}>
                Reject Warehouse
              </h3>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: theme.textMuted }}>
                You are about to reject the warehouse:
                <span className="font-medium" style={{ color: theme.textSecondary }}> {currentWarehouse?.name}</span>
              </p>
              
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Reason for Rejection
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  style={{ 
                    background: theme.inputBg, 
                    border: `1px solid ${theme.inputBorder}`, 
                    color: theme.textPrimary 
                  }}
                  rows="4"
                  placeholder="Please provide a reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md focus:outline-none disabled:opacity-50 text-xs sm:text-sm transition-colors"
                  style={{ backgroundColor: theme.surface, color: theme.textSecondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.surfaceHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.surface}
                  onClick={() => setShowRejectionModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md focus:outline-none disabled:opacity-50 text-xs sm:text-sm transition-colors"
                  style={{ backgroundColor: theme.error, color: theme.textInverted }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.error}
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ThemedPageWrapper>
  );
};

export default PendingWarehouses;