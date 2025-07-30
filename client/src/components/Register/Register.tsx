// src/components/Register/Register.tsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import VerificationSection from './VerificationSection';

interface RegisterProps {
  onClose: () => void;
  onShowLogin: () => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  age: string;
  country: string;
  state: string;
  city: string;
  address: {
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const Register: React.FC<RegisterProps> = ({ onClose, onShowLogin }) => {
  const [showVerification, setShowVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    age: '',
    country: '',
    state: '',
    city: '',
    address: {
      area: '',
      city: '',
      state: '',
      pincode: '',
    },
  });
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!registerData.firstName || !registerData.lastName) {
      setError('First name and last name are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(registerData.mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (registerData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setRegisterData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setRegisterData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError(null);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowVerification(true);
    }
  };

  const handleLoginClick = () => {
    onClose(); // Close Register form
    onShowLogin(); // Show Login form
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50"
        onClick={onClose}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-lg animate-fadeIn border-t-4 border-sky-500 max-h-[90vh] overflow-y-auto z-50">
        <div className="bg-sky-50 rounded-t-lg p-5 border-b border-sky-100">
          <h2 className="text-xl md:text-2xl font-semibold text-[#00599c]">
            Create Account
          </h2>
          <button
            className="absolute top-4 right-4 text-[#00599c] hover:text-[#00599c] transition-colors duration-200 focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!showVerification ? (
          <div className="p-6">
            {/* Form content */}
            <div className="space-y-4">
              {/* Name fields */}
              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={registerData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={registerData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                  />
                </div>
              </div>

              {/* Email & Mobile */}
              <div className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={registerData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                />
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Mobile Number"
                  value={registerData.mobileNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                />
              </div>

              {/* Password fields */}
              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                <div className="space-y-2 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Age & Country */}
              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                <div className="space-y-2">
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={registerData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <select
                    name="country"
                    value={registerData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm bg-white"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              {/* State & City */}
              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={registerData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={registerData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                  />
                </div>
              </div>
              {/* Address Section */}
              <div className="space-y-4">
                <input
                  type="text"
                  name="address.area"
                  placeholder="Area/Street"
                  value={registerData.address.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                />
                <input
                  type="text"
                  name="address.pincode"
                  placeholder="Pincode"
                  value={registerData.address.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  className="w-full px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 text-center"
                >
                  Continue to Verification
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-4 text-gray-600">
                Already have an account?
                <span
                  onClick={handleLoginClick}
                  className="text-[#00599c] hover:text-[#0056b3] cursor-pointer ml-2 font-medium hover:underline transition-colors"
                >
                  Log In
                </span>
              </div>
            </div>
          </div>
        ) : (
          <VerificationSection
            registerData={registerData}
            onBack={() => {
              setShowVerification(false);
              onClose();
              onShowLogin();
            }}
          />
        )}
      </div>
    </>
  );
};

export default Register;