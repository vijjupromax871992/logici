import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import { BACKEND_URL } from '../../../config/api';

const AdminLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing tokens when landing on login page
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleGoogleLogin = () => {
    // Clear storage before redirecting to OAuth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to Google OAuth
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Secure access for administrators</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-400 text-sm">
                Please sign in with your Google account to access the admin dashboard
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Security Notice */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-200">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>Only authorized administrators can access this portal. All login attempts are logged and monitored.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={handleGoHome}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center space-x-1 mx-auto"
          >
            <span>← Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;