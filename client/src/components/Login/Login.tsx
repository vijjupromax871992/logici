// src/components/Login/Login.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import OtpSection from './OtpSection';
import ForgotPasswordSection from './ForgotPasswordSection';
import authService from '../../services/authService';

interface LoginProps {
  onClose: () => void;
  onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onShowRegister }) => {
  const navigate = useNavigate();
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [googleConfigStatus, setGoogleConfigStatus] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    checkGoogleConfig();
    handleGoogleAuthResponse();
  }, [location, onShowRegister]);

  const handleGoogleAuthResponse = () => {
    const params = new URLSearchParams(window.location.search);
    const showRegister = params.get('showRegister');
    const googleEmail = params.get('googleEmail');

    if (showRegister === 'true' && googleEmail) {
      onShowRegister();
    }
  };

  const checkGoogleConfig = async () => {
    const isConfigured = await authService.checkGoogleConfig();
    setGoogleConfigStatus(isConfigured);
  };

  const handleLogin = async () => {
    try {
      setError('');

      // Validate inputs
      if (!emailOrMobile || !password) {
        setError('Please enter all required fields');
        return;
      }

      const response = await authService.login(emailOrMobile, password);

      if (response.success && response.data) {
        const user = authService.getCurrentUser();
        if (user) {
          const dashboardPath = authService.getDashboardPath(user.isAdmin);
          navigate(dashboardPath);
          onClose();
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('An error occurred during login');
    }
  };

  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBackToLogin = () => {
    setShowOtpSection(false);
    setShowForgotPassword(false);
    setError('');
  };

  const getTitle = () => {
    if (showForgotPassword) return 'Reset Password';
    if (showOtpSection) return 'Login with OTP';
    return 'Login';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white 
      rounded-lg shadow-2xl w-full max-w-md z-50 animate-fadeIn">
        <div className="bg-sky-50 rounded-t-lg p-5 border-b border-sky-100">
          <div className="flex items-center">
            {(showOtpSection || showForgotPassword) && (
              <button
                onClick={handleBackToLogin}
                className="mr-3 text-[#00599c] hover:text-[#004d84] transition-colors duration-200 
                focus:outline-none"
                aria-label="Back to login"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl md:text-2xl font-semibold text-[#00599c]">
              {getTitle()}
            </h2>
          </div>
          <button
            className="absolute top-4 right-4 text-[#00599c] hover:text-[#00599c] transition-colors 
            duration-200 focus:outline-none"
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

        {showForgotPassword ? (
          <ForgotPasswordSection 
            onBack={handleBackToLogin}
            onClose={onClose}
          />
        ) : !showOtpSection ? (
          <div className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Email or Mobile Number"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 
                  focus:outline-none"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#00599c] hover:text-[#004d84] transition-colors duration-200 
                  focus:outline-none font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg 
                shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 text-center"
              >
                Log In
              </button>

              {googleConfigStatus && (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg 
                  shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 text-center"
                >
                  Continue with Google
                </button>
              )}

              <button
                onClick={() => setShowOtpSection(true)}
                className="w-full px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg 
                shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 text-center"
              >
                Login with OTP
              </button>
            </div>

            <p className="text-center text-gray-600 mt-4 text-sm">
              Not registered yet?
              <span
                onClick={onShowRegister}
                className="text-sky-600 ml-2 cursor-pointer hover:text-sky-800 font-medium"
              >
                Sign Up
              </span>
            </p>
          </div>
        ) : (
          <OtpSection
            onClose={() => {
              setShowOtpSection(false);
              onShowRegister();
            }}
          />
        )}
      </div>
    </>
  );
};

export default Login;