import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Warehouse as WarehouseIcon } from 'lucide-react';
import { BACKEND_URL, getImageUrl } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';

const WarehouseCard = ({ warehouse, onRefresh }) => {
  const { theme } = useTheme();
  const statusColors = {
    pending: { backgroundColor: 'rgba(251, 191, 36, 0.1)', color: theme.warning },
    approved: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: theme.success },
    rejected: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: theme.error }
  };

  // Get the main image (first one from the array)
  const mainImage = Array.isArray(warehouse.images) ? warehouse.images[0] : warehouse.images?.split(',')[0];

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to homepage if no token
        window.location.href = '/';
        return;
      }
  
      const response = await fetch(
        `${BACKEND_URL}/api/warehouses/${warehouse.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Try to parse the response body
      const responseData = await response.json().catch(e => ({ error: 'Could not parse response', e }));
  
      if (!response.ok) {
        // Handle token-related errors by redirecting to homepage
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          return;
        }
        throw new Error(`Failed to delete warehouse: ${responseData.message || response.status}`);
      }
  
      // Success - refresh the warehouse list
      onRefresh();
    } catch (error) {
      alert(`Failed to delete warehouse: ${error.message}`);
    }
  };

  return (
    <div 
      className="rounded-lg overflow-hidden transition-all duration-300 hover:transform hover:scale-105"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow
      }}
    >
      <div 
        className="aspect-video relative"
        style={{ backgroundColor: theme.surface }}
      >
        {mainImage ? (
          <img
            // Using getImageUrl helper
            src={getImageUrl(mainImage)}
            alt={warehouse.id}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-warehouse.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <WarehouseIcon 
              className="w-16 h-16" 
              style={{ color: theme.textMuted }}
            />
          </div>
        )}
        <div 
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
          style={statusColors[warehouse.approval_status]}
        >
          {warehouse.approval_status.charAt(0).toUpperCase() + warehouse.approval_status.slice(1)}
        </div>
      </div>

      <div className="p-4">
        <h3 
          className="text-lg font-medium mb-2"
          style={{ color: theme.textPrimary }}
        >
          {warehouse.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>Location</span>
            <span style={{ color: theme.textPrimary }}>{warehouse.city}, {warehouse.state}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>Area</span>
            <span style={{ color: theme.textPrimary }}>{warehouse.build_up_area} sq ft</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>Type</span>
            <span style={{ color: theme.textPrimary }}>{warehouse.warehouse_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>Price</span>
            <span style={{ color: theme.textPrimary }}>₹{warehouse.rent}/sqft/month</span>
          </div>
        </div>

        <div 
          className="flex gap-2 mt-4 pt-4"
          style={{ borderTop: `1px solid ${theme.cardBorder}` }}
        >
          <Link
            to={`/user/warehouses/${warehouse.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: theme.buttonSecondary,
              color: theme.textPrimary
            }}
          >
            <Eye size={16} />
            View
          </Link>
          <Link
            to={`/user/warehouses/${warehouse.id}/edit`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: theme.primaryGradient,
              color: theme.textInverted
            }}
          >
            <Edit size={16} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: theme.buttonDanger,
              color: theme.textInverted
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

WarehouseCard.propTypes = {
  warehouse: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string,
    state: PropTypes.string,
    build_up_area: PropTypes.number,
    warehouse_type: PropTypes.string,
    rent: PropTypes.number,
    approval_status: PropTypes.oneOf(['pending', 'approved', 'rejected']).isRequired,
    images: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
  }).isRequired,
  onRefresh: PropTypes.func.isRequired
};

export default WarehouseCard;