//src/components/user/warehouses/WarehouseForm.jsx (Part 1 - Imports and Initial State)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';

const initialFormState = {
  name: '',
  mobile_number: '',
  email: '',
  ownership_type: 'Owner',
  address: '',
  city: '',
  state: '',
  pin_code: '',
  warehouse_type: 'Standard or General Storage',
  build_up_area: '',
  total_plot_area: '',
  total_parking_area: '',
  plot_status: 'Industrial',
  listing_for: 'Rent',
  plinth_height: '',
  dock_doors: '',
  electricity_kva: '',
  floor_plans: 'Ground Floor',
  rent: '',
  deposit: '',
  description: '',
  images: [],
};

// Validation schema
const warehouseTypes = [
  'Standard or General Storage',
  'Hazardous Chemicals Storage',
  'Climate Controlled Storage',
];

const plotStatuses = [
  'Agricultural',
  'Commercial',
  'Industrial',
  'Residential',
];
const floorPlans = ['Ground Floor', 'First Floor', 'Second Floor'];
const listingTypes = ['Rent', 'Sale'];
const ownershipTypes = ['Owner', 'Broker'];

const WarehouseForm = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const isEditMode = !!id;

  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/warehouses/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
    
        if (!response.ok) throw new Error('Failed to fetch warehouse data');
        
        const data = await response.json();
        setFormData(data.data);
        if (data.data.images) {
          setImagePreviewUrls(data.data.images);
        }
      } catch {
        setError('Failed to load warehouse data');
      }
    };

    if (isEditMode) {
      fetchWarehouseData();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
        alert('Maximum 5 images allowed');
        return;
    }

    const newFiles = files.map(file => {
        const objectUrl = URL.createObjectURL(file);
        return { file, objectUrl }; // Store both file and its URL
    });

    setImageFiles(prev => [...prev, ...newFiles.map(f => f.file)]);
    setImagePreviewUrls(prev => [...prev, ...newFiles.map(f => f.objectUrl)]);
};

const removeImage = (index) => {
    const imageUrl = imagePreviewUrls[index];

    // Check if the image is newly uploaded (blob URL)
    const isNewImage = imageFiles.some(file => file.objectUrl === imageUrl);

    if (isNewImage) {
        setImageFiles(prev => prev.filter(file => file.objectUrl !== imageUrl));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    } else {
        // Only remove from preview, keeping server-stored images for reference
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const formDataToSend = new FormData();

        // Handle numeric fields
        const numericFields = [
            'build_up_area', 'total_plot_area', 'total_parking_area',
            'plinth_height', 'dock_doors', 'electricity_kva',
            'rent', 'deposit', 'pin_code'
        ];

        numericFields.forEach(field => {
            if (formData[field] !== '') {
                formDataToSend.append(field, formData[field]);
            }
        });

        // Handle ENUM fields
        const enumFields = [
            'plot_status', 'listing_for', 'floor_plans',
            'ownership_type', 'warehouse_type'
        ];

        enumFields.forEach(field => {
            if (formData[field]) {
                formDataToSend.append(field, formData[field]);
            }
        });

        // Handle all other fields (excluding images and additional details)
        Object.keys(formData).forEach(key => {
            if (!numericFields.includes(key) && 
                !enumFields.includes(key) && 
                key !== 'images' && 
                key !== 'additional_details' && 
                formData[key] !== undefined) {
                formDataToSend.append(key, formData[key]);
            }
        });

        // Append uploaded image files
        if (imageFiles.length > 0) {
            imageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });
        }

        // Handle existing server images
        const existingServerImages = imagePreviewUrls.filter(url =>
            typeof url === 'string' &&
            !url.startsWith('blob:') && 
            !imageFiles.some(file => file.objectUrl === url)
        );

        if (existingServerImages.length > 0) {
            formDataToSend.append('existing_images', JSON.stringify(existingServerImages));
        }

        const url = isEditMode
            ? `${BACKEND_URL}/api/warehouses/${id}`
            : `${BACKEND_URL}/api/warehouses`;

        const response = await fetch(url, {
            method: isEditMode ? 'PUT' : 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: formDataToSend
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save warehouse');
        }

        navigate('/user/warehouses');
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
};



  return (
    <div className="max-w-4xl mx-auto">
      <h1 
        className="text-2xl font-semibold mb-6"
        style={{ color: theme.textPrimary }}
      >
        {isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}
      </h1>

      {error && (
        <div 
          className="px-4 py-3 rounded-lg mb-6"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${theme.error}`,
            color: theme.error
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div 
          className="p-6 rounded-lg mb-6"
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
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Warehouse Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary,
                  '::placeholder': { color: theme.textMuted },
                  '&:focus': {
                    borderColor: theme.inputFocus,
                    ringColor: theme.inputFocus
                  }
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Mobile Number*
              </label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Ownership Type*
              </label>
              <select
                name="ownership_type"
                value={formData.ownership_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              >
                {ownershipTypes.map((type) => (
                  <option key={type} value={type} style={{ background: theme.surface }}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* src/components/user/warehouses/WarehouseForm.jsx (Part 5 - Form JSX Continued) */}
        {/* Location Details */}
        <div 
          className="p-6 rounded-lg mb-6"
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
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Address*
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                City*
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                State*
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                PIN Code*
              </label>
              <input
                type="text"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>
          </div>
        </div>

        {/*src/components/user/warehouses/WarehouseForm.jsx (Part 6 - Property Details) */}
        {/* Property Details */}
        <div 
          className="p-6 rounded-lg mb-6"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Warehouse Type*
              </label>
              <select
                name="warehouse_type"
                value={formData.warehouse_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              >
                {warehouseTypes.map((type) => (
                  <option key={type} value={type} style={{ background: theme.surface }}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Built-up Area (sq ft)*
              </label>
              <input
                type="number"
                name="build_up_area"
                value={formData.build_up_area}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Total Plot Area (sq ft)
              </label>
              <input
                type="number"
                name="total_plot_area"
                value={formData.total_plot_area}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Plot Status
              </label>
              <select
                name="plot_status"
                value={formData.plot_status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              >
                {plotStatuses.map((status) => (
                  <option key={status} value={status} style={{ background: theme.surface }}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Floor Plans
              </label>
              <select
                name="floor_plans"
                value={formData.floor_plans}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              >
                {floorPlans.map((plan) => (
                  <option key={plan} value={plan} style={{ background: theme.surface }}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Dock Doors
              </label>
              <input
                type="number"
                name="dock_doors"
                value={formData.dock_doors}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Electricity (KVA)
              </label>
              <input
                type="number"
                name="electricity_kva"
                value={formData.electricity_kva}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>
          </div>
        </div>

        {/* src/components/user/warehouses/WarehouseForm.jsx (Part 7 - Pricing & Images) */}
        {/* Pricing Details */}
        <div 
          className="p-6 rounded-lg mb-6"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Listing Type*
              </label>
              <select
                name="listing_for"
                value={formData.listing_for}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              >
                {listingTypes.map((type) => (
                  <option key={type} value={type} style={{ background: theme.surface }}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Rent (₹/sqft/month)*
              </label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Security Deposit (₹)*
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.textPrimary
                }}
              />
            </div>
          </div>
        </div>

        {/* Images Upload */}
        <div 
          className="p-6 rounded-lg mb-6"
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
            Warehouse Images
          </h2>

          <div className="space-y-4">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: theme.textSecondary }}
            >
              Upload Images (Max 5)
            </label>

            <div className="flex items-center justify-center w-full">
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                style={{
                  borderColor: theme.inputBorder,
                  '&:hover': { borderColor: theme.primary }
                }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload 
                    className="w-8 h-8 mb-3" 
                    style={{ color: theme.textMuted }}
                  />
                  <p 
                    className="mb-2 text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    PNG, JPG up to 5MB each
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 rounded-full transition-colors"
                      style={{
                        background: theme.error,
                        color: theme.textInverted
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* src/components/user/warehouses/WarehouseForm.jsx (Part 8 - Submit Section & Export) */}
        {/* Submit Section */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/user/warehouses')}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              background: theme.buttonSecondary,
              color: theme.textPrimary
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: theme.buttonPrimary,
              color: theme.textInverted
            }}
          >
            {loading
              ? 'Saving...'
              : isEditMode
              ? 'Update Warehouse'
              : 'Create Warehouse'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WarehouseForm;
