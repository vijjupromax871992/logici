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
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewWarehouse, setViewWarehouse] = useState(null);

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
      <div className="min-h-screen" style={{ background: theme.background }}>

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
          {/* Tablet view - Compact table */}
          <div className="hidden md:block lg:hidden overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: theme.cardBorder }}>
              <thead style={{ backgroundColor: theme.surface }}>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Warehouse
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Details
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: theme.surface, borderColor: theme.cardBorder }}>
                {warehouses.map((warehouse) => (
                  <tr key={`tablet-${warehouse.id}`} className="transition-colors" 
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = theme.surfaceHover}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                    <td className="px-3 py-3">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img 
                            className="h-8 w-8 rounded-md object-cover" 
                            src={getImageUrl(warehouse.images)}
                            alt={warehouse.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-warehouse.jpg';
                            }}
                          />
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium truncate max-w-[140px]" style={{ color: theme.textPrimary }}>
                            {warehouse.name}
                          </div>
                          <div className="text-xs truncate max-w-[140px]" style={{ color: theme.textMuted }}>
                            {warehouse.warehouse_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs space-y-1">
                        <div className="truncate max-w-[160px]" style={{ color: theme.textPrimary }}>
                          {warehouse.owner?.firstName} {warehouse.owner?.lastName}
                        </div>
                        <div className="truncate max-w-[160px]" style={{ color: theme.textMuted }}>
                          {warehouse.city}, {warehouse.state}
                        </div>
                        <div style={{ color: theme.textMuted }}>
                          {new Date(warehouse.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex flex-col space-y-1">
                        <button
                          className="px-2 py-1 rounded text-xs font-medium transition-colors"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: theme.primary }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                          onClick={() => {
                            setViewWarehouse(warehouse);
                            setShowViewModal(true);
                          }}
                        >
                          View Details
                        </button>
                        <button
                          className="px-2 py-1 rounded text-xs font-medium disabled:opacity-50 transition-colors"
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: theme.success }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
                          onClick={() => handleApprove(warehouse.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? '...' : 'Approve'}
                        </button>
                        <button
                          className="px-2 py-1 rounded text-xs font-medium disabled:opacity-50 transition-colors"
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
                          {actionLoading ? '...' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop view table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: theme.cardBorder }}>
              <thead style={{ backgroundColor: theme.surface }}>
                <tr>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Warehouse
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Owner
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Location
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Date Submitted
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: theme.surface, borderColor: theme.cardBorder }}>
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="transition-colors" 
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = theme.surfaceHover}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                    <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10">
                          <img 
                            className="h-8 w-8 lg:h-10 lg:w-10 rounded-md object-cover" 
                            src={getImageUrl(warehouse.images)}
                            alt={warehouse.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-warehouse.jpg';
                            }}
                          />
                        </div>
                        <div className="ml-2 lg:ml-3 xl:ml-4 min-w-0 flex-1">
                          <div className="text-xs lg:text-sm font-medium truncate max-w-[120px] lg:max-w-[180px]" style={{ color: theme.textPrimary }}>
                            {warehouse.name}
                          </div>
                          <div className="text-xs truncate max-w-[120px] lg:max-w-[180px]" style={{ color: theme.textMuted }}>
                            {warehouse.warehouse_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                      <div className="min-w-0">
                        <div className="text-xs lg:text-sm truncate max-w-[100px] lg:max-w-[150px]" style={{ color: theme.textPrimary }}>
                          {warehouse.owner?.firstName} {warehouse.owner?.lastName}
                        </div>
                        <div className="text-xs truncate max-w-[100px] lg:max-w-[150px]" style={{ color: theme.textMuted }}>
                          {warehouse.owner?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                      <div className="min-w-0">
                        <div className="text-xs lg:text-sm truncate max-w-[100px] lg:max-w-[120px]" style={{ color: theme.textPrimary }}>
                          {warehouse.city}, {warehouse.state}
                        </div>
                        <div className="text-xs truncate max-w-[100px] lg:max-w-[120px]" style={{ color: theme.textMuted }}>
                          {warehouse.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-xs lg:text-sm whitespace-nowrap" style={{ color: theme.textMuted }}>
                      {new Date(warehouse.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </td>
                    <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2 lg:space-x-3">
                        <button
                          className="px-2 py-1 lg:px-3 lg:py-1.5 rounded text-xs lg:text-sm font-medium transition-colors"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: theme.primary }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                          onClick={() => {
                            setViewWarehouse(warehouse);
                            setShowViewModal(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="px-2 py-1 lg:px-3 lg:py-1.5 rounded text-xs lg:text-sm font-medium disabled:opacity-50 transition-colors"
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: theme.success }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
                          onClick={() => handleApprove(warehouse.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? '...' : 'Approve'}
                        </button>
                        <button
                          className="px-2 py-1 lg:px-3 lg:py-1.5 rounded text-xs lg:text-sm font-medium disabled:opacity-50 transition-colors"
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
                          {actionLoading ? '...' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view cards */}
          <div className="md:hidden space-y-3 sm:space-y-4 p-3 sm:p-4">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id} className="rounded-lg p-3 sm:p-4 shadow" style={{ background: theme.surface, border: `1px solid ${theme.cardBorder}` }}>
                <div className="flex items-start mb-3 sm:mb-4">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                    <img 
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-md object-cover" 
                      src={getImageUrl(warehouse.images)}
                      alt={warehouse.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-warehouse.jpg';
                      }}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium truncate" style={{ color: theme.textPrimary }}>{warehouse.name}</div>
                    <div className="text-xs sm:text-sm mt-1 truncate" style={{ color: theme.textMuted }}>{warehouse.warehouse_type}</div>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4 text-xs sm:text-sm space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                  <div className="min-w-0">
                    <div className="font-medium" style={{ color: theme.textMuted }}>Owner</div>
                    <div className="truncate" style={{ color: theme.textPrimary }}>{warehouse.owner?.firstName} {warehouse.owner?.lastName}</div>
                    <div className="truncate text-xs" style={{ color: theme.textMuted }}>{warehouse.owner?.email}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium" style={{ color: theme.textMuted }}>Location</div>
                    <div className="truncate" style={{ color: theme.textPrimary }}>{warehouse.city}, {warehouse.state}</div>
                    <div className="truncate" style={{ color: theme.textMuted }}>{warehouse.country}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="text-xs" style={{ color: theme.textMuted }}>
                    Submitted: {new Date(warehouse.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex justify-end space-x-2 sm:space-x-3">
                    <button
                      className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors min-w-[60px] sm:min-w-[70px]"
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: theme.primary }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                      onClick={() => {
                        setViewWarehouse(warehouse);
                        setShowViewModal(true);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium disabled:opacity-50 transition-colors min-w-[60px] sm:min-w-[70px]"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: theme.success }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
                      onClick={() => handleApprove(warehouse.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? '...' : 'Approve'}
                    </button>
                    <button
                      className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium disabled:opacity-50 transition-colors min-w-[60px] sm:min-w-[70px]"
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
                      {actionLoading ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4" style={{ color: theme.textPrimary }}>
                Reject Warehouse
              </h3>
              <p className="text-sm mb-3 sm:mb-4" style={{ color: theme.textMuted }}>
                You are about to reject the warehouse:
                <span className="block sm:inline font-medium break-words" style={{ color: theme.textSecondary }}> {currentWarehouse?.name}</span>
              </p>
              
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Reason for Rejection
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  style={{ 
                    background: theme.inputBg, 
                    border: `1px solid ${theme.inputBorder}`, 
                    color: theme.textPrimary 
                  }}
                  rows="3"
                  placeholder="Please provide a reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md focus:outline-none disabled:opacity-50 text-sm transition-colors order-2 sm:order-1"
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
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md focus:outline-none disabled:opacity-50 text-sm transition-colors order-1 sm:order-2"
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

      {/* View Warehouse Details Modal */}
      {showViewModal && viewWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Warehouse Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Name</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Type</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.warehouse_type}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Description</label>
                  <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.description || 'No description provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Total Area</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.total_area} sq ft</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Available Area</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.available_area} sq ft</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Price per sq ft</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>₹{viewWarehouse.price_per_sqft}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Security Deposit</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>₹{viewWarehouse.security_deposit}</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>Location & Owner</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Address</label>
                  <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.address}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>City</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>State</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.state}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Country</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.country}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>PIN Code</label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.pin_code}</p>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="border-t pt-4" style={{ borderColor: theme.cardBorder }}>
                  <h4 className="text-md font-semibold mb-3" style={{ color: theme.textPrimary }}>Owner Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Name</label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {viewWarehouse.owner?.firstName} {viewWarehouse.owner?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Email</label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.owner?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Mobile</label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>{viewWarehouse.owner?.mobile}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Submitted</label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {new Date(viewWarehouse.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Images */}
            {viewWarehouse.images && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>Warehouse Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(Array.isArray(viewWarehouse.images) 
                    ? viewWarehouse.images 
                    : viewWarehouse.images.split(',').map(img => img.trim())
                  ).map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.startsWith('http') ? image : `${BACKEND_URL}/${image}`}
                        alt={`Warehouse ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-warehouse.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 pt-6 border-t" style={{ borderColor: theme.cardBorder }}>
              <button
                className="px-6 py-2 rounded-md font-medium transition-colors"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: theme.success }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
                onClick={() => {
                  handleApprove(viewWarehouse.id);
                  setShowViewModal(false);
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Approve Warehouse'}
              </button>
              <button
                className="px-6 py-2 rounded-md font-medium transition-colors"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: theme.error }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                onClick={() => {
                  setCurrentWarehouse(viewWarehouse);
                  setShowViewModal(false);
                  setShowRejectionModal(true);
                  setRejectionReason('');
                }}
                disabled={actionLoading}
              >
                Reject Warehouse
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ThemedPageWrapper>
  );
};

export default PendingWarehouses;