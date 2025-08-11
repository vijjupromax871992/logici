import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, MapPin, Building2, User, Mail, Phone, Calendar, Info } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BACKEND_URL } from '../../../config/api';

const AdminWarehouseDetailModal = ({ warehouse, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !warehouse) return null;

  // Helper function to get image URL
  const getImageUrl = (images) => {
    if (!images) return '/placeholder-warehouse.jpg';
    
    if (Array.isArray(images)) {
      if (images.length === 0) return '/placeholder-warehouse.jpg';
      const mainImage = images[0];
      return mainImage.startsWith('http') ? mainImage : `${BACKEND_URL}/${mainImage}`;
    }
    
    if (typeof images === 'string') {
      const imageArray = images.split(',').map(img => img.trim());
      if (imageArray.length === 0) return '/placeholder-warehouse.jpg';
      const mainImage = imageArray[0];
      return mainImage.startsWith('http') ? mainImage : `${BACKEND_URL}/${mainImage}`;
    }
    
    return '/placeholder-warehouse.jpg';
  };

  // Get all images as array
  const getAllImages = (images) => {
    if (!images) return [];
    
    if (Array.isArray(images)) {
      return images.map(img => img.startsWith('http') ? img : `${BACKEND_URL}/${img}`);
    }
    
    if (typeof images === 'string') {
      return images.split(',')
        .map(img => img.trim())
        .filter(img => img)
        .map(img => img.startsWith('http') ? img : `${BACKEND_URL}/${img}`);
    }
    
    return [];
  };

  const allImages = getAllImages(warehouse.images);
  const currentImage = allImages[selectedImageIndex] || getImageUrl(warehouse.images);

  // Get status badge style
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div 
        className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        style={{ 
          background: theme.cardBg, 
          border: `1px solid ${theme.cardBorder}` 
        }}
        onClick={(e) => {
          // Prevent modal content clicks from closing the modal
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div 
          className="flex justify-between items-center p-6 border-b"
          style={{ borderColor: theme.cardBorder }}
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" style={{ color: theme.primary }} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                {warehouse.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" style={{ color: theme.textMuted }} />
                <span className="text-sm" style={{ color: theme.textMuted }}>
                  {warehouse.city}, {warehouse.state}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={getStatusBadge(warehouse.approval_status)}>
              {warehouse.approval_status?.charAt(0).toUpperCase() + warehouse.approval_status?.slice(1)}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ background: theme.surface }}
            >
              <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                Warehouse Images
              </h3>
              
              {/* Main Image */}
              <div className="aspect-video rounded-lg overflow-hidden" style={{ background: theme.surface }}>
                <img
                  src={currentImage}
                  alt={warehouse.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-warehouse.jpg';
                  }}
                />
              </div>

              {/* Image Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                      style={{ background: theme.surface }}
                    >
                      <img
                        src={image}
                        alt={`${warehouse.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-warehouse.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <Info className="w-5 h-5" />
                  Basic Information
                </h3>
                <div 
                  className="grid grid-cols-2 gap-4 p-4 rounded-lg"
                  style={{ background: theme.surface }}
                >
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                      Type
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {warehouse.warehouse_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                      Total Area
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {warehouse.total_area || warehouse.build_up_area || 'N/A'} sq ft
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                      Available Area
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {warehouse.available_area || 'N/A'} sq ft
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                      Price per sq ft
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      ₹{warehouse.price_per_sqft || warehouse.rent || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {warehouse.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Description
                  </h3>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ background: theme.surface }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: theme.textPrimary }}>
                      {warehouse.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                <div 
                  className="p-4 rounded-lg space-y-2"
                  style={{ background: theme.surface }}
                >
                  {warehouse.address && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        Address
                      </label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {warehouse.address}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        City
                      </label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {warehouse.city}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        State
                      </label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {warehouse.state}
                      </p>
                    </div>
                  </div>
                  {warehouse.pin_code && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        PIN Code
                      </label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {warehouse.pin_code}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Information */}
              {warehouse.owner && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: theme.textPrimary }}>
                    <User className="w-5 h-5" />
                    Owner Information
                  </h3>
                  <div 
                    className="p-4 rounded-lg space-y-3"
                    style={{ background: theme.surface }}
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        Name
                      </label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {warehouse.owner.firstName} {warehouse.owner.lastName}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: theme.textMuted }} />
                        <span className="text-sm" style={{ color: theme.textPrimary }}>
                          {warehouse.owner.email}
                        </span>
                      </div>
                      {warehouse.owner.mobile && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" style={{ color: theme.textMuted }} />
                          <span className="text-sm" style={{ color: theme.textPrimary }}>
                            {warehouse.owner.mobile}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Administrative Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <Calendar className="w-5 h-5" />
                  Administrative Info
                </h3>
                <div 
                  className="p-4 rounded-lg space-y-2"
                  style={{ background: theme.surface }}
                >
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                      Registration Date
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {new Date(warehouse.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {warehouse.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        Last Updated
                      </label>
                      <p className="text-sm" style={{ color: theme.textPrimary }}>
                        {new Date(warehouse.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex justify-end p-6 border-t"
          style={{ borderColor: theme.cardBorder }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              background: theme.primary, 
              color: theme.textInverted 
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

AdminWarehouseDetailModal.propTypes = {
  warehouse: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string,
    state: PropTypes.string,
    address: PropTypes.string,
    description: PropTypes.string,
    warehouse_type: PropTypes.string,
    total_area: PropTypes.number,
    build_up_area: PropTypes.number,
    available_area: PropTypes.number,
    price_per_sqft: PropTypes.number,
    rent: PropTypes.number,
    pin_code: PropTypes.string,
    approval_status: PropTypes.oneOf(['pending', 'approved', 'rejected']),
    images: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    owner: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      mobile: PropTypes.string
    })
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AdminWarehouseDetailModal;