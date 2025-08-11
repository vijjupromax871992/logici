import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';
import AdminWarehouseDetailModal from './AdminWarehouseDetailModal';

const AdminWarehouses = () => {
  const { theme } = useTheme();
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      const response = await fetch(
        `${BACKEND_URL}/admin/warehouses?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch warehouses');
      
      const data = await response.json();
      setWarehouses(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const filtered = warehouses.filter(warehouse =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (warehouse.owner && 
        `${warehouse.owner.firstName} ${warehouse.owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredWarehouses(filtered);
  }, [warehouses, searchTerm]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Building2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleViewWarehouse = (warehouse, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSelectedWarehouse(warehouse);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWarehouse(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="text-2xl font-semibold mb-1"
            style={{ color: theme.textPrimary }}
          >
            All Warehouses
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Manage all warehouse listings in the system
          </p>
        </div>
        <Link
          to="/admin/warehouses/pending"
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            background: theme.buttonSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.cardBorder}`
          }}
        >
          <Clock size={20} />
          Pending Approvals
        </Link>
      </div>

      {/* Filters */}
      <div 
        className="flex flex-col md:flex-row gap-4 p-4 rounded-lg"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.cardShadow
        }}
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search 
            className="absolute left-3 top-3 w-4 h-4" 
            style={{ color: theme.textMuted }} 
          />
          <input
            type="text"
            placeholder="Search warehouses, cities, or owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg transition-colors"
            style={{
              background: theme.inputBg,
              border: `1px solid ${theme.inputBorder}`,
              color: theme.textPrimary
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: theme.textMuted }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg transition-colors"
            style={{
              background: theme.inputBg,
              border: `1px solid ${theme.inputBorder}`,
              color: theme.textPrimary
            }}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Warehouse Table */}
      {loading ? (
        <div 
          className="text-center py-12"
          style={{ color: theme.textMuted }}
        >
          Loading warehouses...
        </div>
      ) : error ? (
        <div 
          className="text-center py-12 text-red-500"
        >
          Error: {error}
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div 
          className="text-center py-12"
          style={{ color: theme.textMuted }}
        >
          No warehouses found
        </div>
      ) : (
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.cardShadow
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed w-full">
              <thead 
                style={{ background: theme.tableBg || theme.glassBg }}
              >
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4"
                    style={{ color: theme.textSecondary }}
                  >
                    Warehouse
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4"
                    style={{ color: theme.textSecondary }}
                  >
                    Owner
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6"
                    style={{ color: theme.textSecondary }}
                  >
                    Location
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/8"
                    style={{ color: theme.textSecondary }}
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/8"
                    style={{ color: theme.textSecondary }}
                  >
                    Created
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider w-1/8"
                    style={{ color: theme.textSecondary }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme.cardBorder }}>
                {filteredWarehouses.map((warehouse) => (
                  <tr 
                    key={warehouse.id}
                    className="hover:bg-opacity-50 transition-colors"
                    style={{ 
                      background: theme.cardBg,
                      ':hover': { background: theme.hoverBg }
                    }}
                    onClick={(e) => {
                      // Prevent row click from interfering with button clicks
                      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(warehouse.approval_status)}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div 
                            className="text-sm font-medium truncate"
                            style={{ color: theme.textPrimary }}
                            title={warehouse.name}
                          >
                            {warehouse.name}
                          </div>
                          <div 
                            className="text-sm truncate"
                            style={{ color: theme.textSecondary }}
                            title={warehouse.warehouse_type}
                          >
                            {warehouse.warehouse_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="min-w-0">
                        <div 
                          className="text-sm truncate"
                          style={{ color: theme.textPrimary }}
                          title={warehouse.owner ? 
                            `${warehouse.owner.firstName} ${warehouse.owner.lastName}` : 
                            'N/A'
                          }
                        >
                          {warehouse.owner ? 
                            `${warehouse.owner.firstName} ${warehouse.owner.lastName}` : 
                            'N/A'
                          }
                        </div>
                        <div 
                          className="text-sm truncate"
                          style={{ color: theme.textSecondary }}
                          title={warehouse.owner?.email || 'N/A'}
                        >
                          {warehouse.owner?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="text-sm truncate"
                        style={{ color: theme.textPrimary }}
                        title={`${warehouse.city}, ${warehouse.state}`}
                      >
                        {warehouse.city}, {warehouse.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(warehouse.approval_status)}>
                        {warehouse.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="text-sm"
                        style={{ color: theme.textSecondary }}
                      >
                        {new Date(warehouse.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewWarehouse(warehouse, e);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded transition-colors hover:opacity-80"
                        style={{
                          color: theme.primary,
                          background: `${theme.primary}10`,
                          border: `1px solid ${theme.primary}30`
                        }}
                        title="View warehouse details in admin modal"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div 
              className="px-6 py-3 flex items-center justify-between border-t"
              style={{ borderColor: theme.cardBorder }}
            >
              <div className="flex-1 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded transition-colors disabled:opacity-50"
                  style={{
                    background: theme.buttonSecondary,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.cardBorder}`
                  }}
                >
                  Previous
                </button>
                
                <span style={{ color: theme.textSecondary }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded transition-colors disabled:opacity-50"
                  style={{
                    background: theme.buttonSecondary,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.cardBorder}`
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Warehouse Detail Modal */}
      {showModal && selectedWarehouse && (
        <div>
          <AdminWarehouseDetailModal
            warehouse={selectedWarehouse}
            isOpen={showModal}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </div>
  );
};

export default AdminWarehouses;