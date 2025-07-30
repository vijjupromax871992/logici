import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';

const EditAdminModal = ({ admin, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    country: '',
    state: '',
    city: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin) {
      setFormData({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        mobileNumber: admin.mobileNumber || '',
        country: admin.country || '',
        state: admin.state || '',
        city: admin.city || ''
      });
    }
  }, [admin]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (formData.mobileNumber && !mobileRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.cardShadow
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme.cardBorder }}
        >
          <h2 className="text-xl font-semibold" style={{ color: theme.textPrimary }}>Edit Admin User</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: theme.textSecondary }}
            onMouseEnter={(e) => e.target.style.color = theme.textPrimary}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div 
              className="px-4 py-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: theme.error
              }}
            >
              {errors.submit}
            </div>
          )}

          {/* Current Admin Info */}
          <div 
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder
            }}
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Current Admin</h3>
            <div className="flex items-center">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <span className="font-medium" style={{ color: theme.primary }}>
                  {admin?.firstName?.charAt(0)}{admin?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium" style={{ color: theme.textPrimary }}>{admin?.firstName} {admin?.lastName}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{admin?.email}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: theme.textPrimary }}>
              <User className="h-5 w-5 mr-2" style={{ color: theme.primary }} />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent
                  ${errors.firstName ? 'border-red-500' : ''}`}
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: errors.firstName ? theme.error : theme.inputBorder,
                    color: theme.textPrimary,
                    '--tw-ring-color': theme.primary
                  }}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm" style={{ color: theme.error }}>{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent
                  ${errors.lastName ? 'border-red-500' : ''}`}
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: errors.lastName ? theme.error : theme.inputBorder,
                    color: theme.textPrimary,
                    '--tw-ring-color': theme.primary
                  }}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm" style={{ color: theme.error }}>{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: theme.textPrimary }}>
              <Mail className="h-5 w-5 mr-2" style={{ color: theme.primary }} />
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent
                  ${errors.email ? 'border-red-500' : ''}`}
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: errors.email ? theme.error : theme.inputBorder,
                    color: theme.textPrimary,
                    '--tw-ring-color': theme.primary
                  }}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm" style={{ color: theme.error }}>{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: theme.textMuted }} />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent
                    ${errors.mobileNumber ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: errors.mobileNumber ? theme.error : theme.inputBorder,
                      color: theme.textPrimary,
                      '--tw-ring-color': theme.primary
                    }}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="mt-1 text-sm" style={{ color: theme.error }}>{errors.mobileNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: theme.textPrimary }}>
              <MapPin className="h-5 w-5 mr-2" style={{ color: theme.primary }} />
              Location (Optional)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                    '--tw-ring-color': theme.primary
                  }}
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                    '--tw-ring-color': theme.primary
                  }}
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                    '--tw-ring-color': theme.primary
                  }}
                  placeholder="Enter city"
                />
              </div>
            </div>
          </div>

          {/* Password Notice */}
          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}
          >
            <p className="text-sm" style={{ color: theme.warning }}>
              <strong>Note:</strong> Password cannot be changed through this form. Admin users can reset their password using the "Forgot Password" feature on the login page.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: theme.cardBorder }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: theme.buttonSecondary,
                color: theme.textSecondary,
                border: `1px solid ${theme.cardBorder}`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.surfaceHover;
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.buttonSecondary;
                e.target.style.transform = 'translateY(0)';
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center"
              style={{
                background: theme.buttonPrimary,
                color: theme.textInverted,
                boxShadow: theme.cardShadow
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 mr-2" style={{ borderColor: theme.textInverted }}></div>
                  Updating...
                </>
              ) : (
                'Update Admin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditAdminModal.propTypes = {
  admin: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EditAdminModal;