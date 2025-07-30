// src/components/Login/ForgotPasswordSection.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Key } from 'lucide-react';
import { BACKEND_URL } from '../../config/api';

interface ForgotPasswordSectionProps {
  onBack: () => void;
  onClose: () => void;
}

const ForgotPasswordSection: React.FC<ForgotPasswordSectionProps> = ({ onBack, onClose }) => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!email) {
        setError('Please enter your email address');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP sent to your email address. Please check your inbox.');
        setStep('reset');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validation
      if (!otp || !newPassword || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! You can now login with your new password.');
        setTimeout(() => {
          onBack(); // Go back to login form
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
          {success}
        </div>
      )}

      {step === 'email' ? (
        <>
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-[#00599c]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Forgot your password?</h3>
            <p className="text-gray-600 text-sm">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg 
              shadow-md hover:bg-[#004d84] transition-colors duration-300 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Your Password</h3>
            <p className="text-gray-600 text-sm">
              Enter the OTP sent to <span className="font-medium">{email}</span> and your new password.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500 text-center text-lg tracking-widest"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg 
              shadow-md hover:bg-[#004d84] transition-colors duration-300 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>

            <button
              onClick={handleBackToEmail}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg 
              shadow-md hover:bg-gray-200 transition-colors duration-300 text-center disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>
        </>
      )}

      <div className="text-center">
        <button
          onClick={onBack}
          className="text-sm text-[#00599c] hover:text-[#004d84] transition-colors duration-200 font-medium"
          disabled={loading}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordSection;