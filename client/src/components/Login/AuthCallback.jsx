// src/components/Login/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  console.log('🚨 [AuthCallback] COMPONENT MOUNTED - FIRST LOG');

  useEffect(() => {
    console.log('🔍 [AuthCallback] Component loaded');
    console.log('🔍 [AuthCallback] Current URL:', window.location.href);
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userData = params.get('user');
    const redirectPath = params.get('redirectPath');
    const showRegister = params.get('showRegister');
    const googleEmail = params.get('googleEmail');
  
    console.log('🔍 [AuthCallback] URL Parameters:', {
      token: token ? 'Present' : 'Missing',
      userData: userData ? 'Present' : 'Missing',
      redirectPath,
      showRegister,
      googleEmail
    });

    // If user is not registered, redirect to register page
    if (showRegister && googleEmail) {
      console.log('🔍 [AuthCallback] Redirecting to register page');
      navigate('/', {
        state: {
          showRegister: true,
          googleEmail,
        },
      });
      return;
    }
  
    // If we have token and user data, process the login
    if (token && userData) {
      try {
        console.log('🔍 [AuthCallback] Processing login with token and userData');
        console.log('🔍 [AuthCallback] Token:', token);
        console.log('🔍 [AuthCallback] UserData (raw):', userData);
        
        const parsedUser = JSON.parse(userData);
        console.log('🔍 [AuthCallback] Parsed user data:', parsedUser);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', userData);
        
        console.log('✅ [AuthCallback] Stored in localStorage');
        console.log('🔍 [AuthCallback] localStorage token:', localStorage.getItem('token'));
        console.log('🔍 [AuthCallback] localStorage user:', localStorage.getItem('user'));
        
        // Use the redirectPath from the URL if available
        if (redirectPath) {
          console.log('✅ [AuthCallback] Redirecting to specified path:', redirectPath);
          window.location.replace(redirectPath);
        } else {
          // Parse the user data to check role as fallback
          if (parsedUser.isAdmin) {
            console.log('✅ [AuthCallback] Redirecting admin to /admin/dashboard');
            window.location.replace('/admin/dashboard');
          } else {
            console.log('✅ [AuthCallback] Redirecting user to /user/dashboard');
            window.location.replace('/user/dashboard');
          }
        }
      } catch (error) {
        console.error('❌ [AuthCallback] Error processing login:', error);
        navigate('/');
      }
    } else {
      console.log('❌ [AuthCallback] Missing token or userData, redirecting to home');
      navigate('/');
    }
}, [navigate]);
  
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;
