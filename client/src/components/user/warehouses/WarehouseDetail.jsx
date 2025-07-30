import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { ArrowLeft, Edit, Trash2, MapPin, Phone, Mail, Building, Warehouse } from "lucide-react";
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';

// PropertyDetail Component
const PropertyDetail = ({ label, value = "-" }) => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col">
      <span 
        className="text-sm"
        style={{ color: theme.textSecondary }}
      >
        {label}
      </span>
      <span 
        className="font-medium"
        style={{ color: theme.textPrimary }}
      >
        {value}
      </span>
    </div>
  );
};

PropertyDetail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const WarehouseDetail = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ✅ Fetch warehouse details
  useEffect(() => {
    let isMounted = true;

    const fetchWarehouseDetails = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/warehouses/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Failed to fetch warehouse details");

        const result = await response.json();
        if (isMounted && result.data) {
          setWarehouse({
            ...result.data,
            images: processImages(result.data.images), 
          });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWarehouseDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const processImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    return images.split(",").map((img) => img.trim());
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-warehouse.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}/${imagePath}`;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/warehouses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to delete warehouse");
      navigate("/user/warehouses");
    } catch (error) {
      alert("Failed to delete warehouse");
    }
  };

  if (loading) return (
    <div 
      className="text-center"
      style={{ color: theme.textPrimary }}
    >
      Loading...
    </div>
  );
  if (error) return (
    <div style={{ color: theme.error }}>
      {error}
    </div>
  );
  if (!warehouse) return (
    <div style={{ color: theme.textMuted }}>
      Warehouse not found
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate("/user/warehouses")} 
          className="flex items-center gap-2 transition-colors"
          style={{ color: theme.textSecondary }}
        >
          <ArrowLeft size={20} />
          Back to Warehouses
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/user/warehouses/${id}/edit`)} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: theme.primaryGradient,
              color: theme.textInverted
            }}
          >
            <Edit size={16} />
            Edit
          </button>
          <button 
            onClick={handleDelete} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images Section */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: theme.cardShadow
            }}
          >
            {warehouse.images?.length > 0 ? (
              <img src={getImageUrl(warehouse.images[selectedImageIndex])} alt={warehouse.name} className="w-full h-[400px] object-cover" />
            ) : (
              <div 
                className="w-full h-[400px] flex items-center justify-center"
                style={{ backgroundColor: theme.surface }}
              >
                <Warehouse 
                  className="w-32 h-32" 
                  style={{ color: theme.textMuted }}
                />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {warehouse.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {warehouse.images.map((image, index) => (
                <button 
                  key={index} 
                  onClick={() => setSelectedImageIndex(index)} 
                  className="relative aspect-video rounded-lg overflow-hidden transition-all"
                  style={{
                    border: selectedImageIndex === index 
                      ? `2px solid ${theme.primary}` 
                      : `1px solid ${theme.cardBorder}`
                  }}
                >
                  <img src={getImageUrl(image)} alt={`View ${index + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div 
            className="p-6 rounded-lg"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: theme.cardShadow
            }}
          >
            <h1 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.textPrimary }}
            >
              {warehouse.name}
            </h1>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin 
                  className="mt-1" 
                  size={20}
                  style={{ color: theme.textSecondary }}
                />
                <div>
                  <div style={{ color: theme.textPrimary }}>
                    {warehouse.address}
                  </div>
                  <div style={{ color: theme.textSecondary }}>
                    {[warehouse.city, warehouse.state, warehouse.pin_code]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone 
                  size={20}
                  style={{ color: theme.textSecondary }}
                />
                <div style={{ color: theme.textPrimary }}>
                  {warehouse.mobile_number}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail 
                  size={20}
                  style={{ color: theme.textSecondary }}
                />
                <div style={{ color: theme.textPrimary }}>
                  {warehouse.email}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building 
                  size={20}
                  style={{ color: theme.textSecondary }}
                />
                <div style={{ color: theme.textPrimary }}>
                  {warehouse.warehouse_type}
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div 
            className="p-6 rounded-lg"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: theme.cardShadow
            }}
          >
            <h2 
              className="text-lg font-medium mb-4"
              style={{ color: theme.textPrimary }}
            >
              Property Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <PropertyDetail 
                label="Built-up Area" 
                value={warehouse.build_up_area ? `${warehouse.build_up_area} sq ft` : null} 
              />
              <PropertyDetail 
                label="Total Plot Area" 
                value={warehouse.total_plot_area ? `${warehouse.total_plot_area} sq ft` : null} 
              />
              <PropertyDetail label="Plot Status" value={warehouse.plot_status} />
              <PropertyDetail label="Dock Doors" value={warehouse.dock_doors} />
              <PropertyDetail 
                label="Electricity" 
                value={warehouse.electricity_kva ? `${warehouse.electricity_kva} KVA` : null} 
              />
              <PropertyDetail label="Floor Plan" value={warehouse.floor_plans} />
            </div>
          </div>

          {/* Pricing Details */}
          <div 
            className="p-6 rounded-lg"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: theme.cardShadow
            }}
          >
            <h2 
              className="text-lg font-medium mb-4"
              style={{ color: theme.textPrimary }}
            >
              Pricing Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <PropertyDetail label="Listing Type" value={warehouse.listing_for} />
              <PropertyDetail 
                label="Rent" 
                value={warehouse.rent ? `₹${warehouse.rent}/sqft/month` : null} 
              />
              <PropertyDetail 
                label="Security Deposit" 
                value={warehouse.deposit ? `₹${warehouse.deposit}` : null} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetail;
