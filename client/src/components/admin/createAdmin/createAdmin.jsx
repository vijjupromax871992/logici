import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { BACKEND_URL } from '../../../config/api';
import ThemedPageWrapper from '../common/ThemedPageWrapper';
import { useTheme } from '../../../contexts/ThemeContext';

const CreateAdmin = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    country: '',
    state: '',
    city: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        mobileNumber: '',
        country: '',
        state: '',
        city: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedPageWrapper title="Create New Admin" subtitle="Add a new administrator to the system">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">

      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-900/50 border border-green-500/50 text-green-200 p-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Admin user created successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobileNumber"
              required
              value={formData.mobileNumber}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white 
              focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: theme.buttonPrimary, 
              color: theme.textInverted,
              ':hover': { 
                background: theme.primary 
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>
      </div>
    </ThemedPageWrapper>
  );
};

export default CreateAdmin;