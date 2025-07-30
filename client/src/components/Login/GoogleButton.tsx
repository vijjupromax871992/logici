// src/components/GoogleButton.tsx
import React from 'react';

const GoogleButton: React.FC = () => {
  const handleGoogleLogin = () => {
    const apiUrl = 'https://logic-i-backend.onrender.com';
    if (!apiUrl) {
      return;
    }
    
    // Direct link to Google auth endpoint
    const googleAuthUrl = `${apiUrl}/api/auth/google`;

    // Use window.location.href for the redirect
    window.location.href = googleAuthUrl;
  };

  return (
    <button 
      type="button"
      onClick={handleGoogleLogin}
      className="google-login-button"
    >
      <img 
        src="https://developers.google.com/identity/images/g-logo.png" 
        alt="Google"
        className="google-icon"
      />
      Continue with Google...
    </button>
  );
};

export default GoogleButton;