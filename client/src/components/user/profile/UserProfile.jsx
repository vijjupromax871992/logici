// src/components/user/profile/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, CheckIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import ProfileSkeleton from './ProfileSkeleton';
import { toast } from 'react-hot-toast';
import {BACKEND_URL} from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';

const UserProfile = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const API_URL = `${BACKEND_URL}`;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    country: '',
    state: '',
    city: '',
    profilePhoto: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token missing');
        navigate('/');
        return;
      }

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user data');
      }
      
      setUser(data.data);
      setFormData({
        firstName: data.data.first_name || '',
        lastName: data.data.last_name || '',
        email: data.data.email || '',
        mobileNumber: data.data.mobile || '',
        country: data.data.country || '',
        state: data.data.state || '',
        city: data.data.city || '',
        profilePhoto: data.data.profilePhoto || ''
      });
      
      if (data.data.profilePhoto) {
        setImagePreview(`${API_URL}/uploads/${data.data.profilePhoto}`);
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token missing');
        navigate('/');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('city', formData.city);
      
      if (profileImage) {
        formDataToSend.append('profilePhoto', profileImage);
      }

      // Use the same /me endpoint that works for GET
      const response = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      // Refresh user data
      await fetchUserData();
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      mobileNumber: user.mobile || '',
      country: user.country || '',
      state: user.state || '',
      city: user.city || ''
    });
    
    if (user.profilePhoto) {
      setImagePreview(`${API_URL}/uploads/${user.profilePhoto}`);
    } else {
      setImagePreview(null);
    }
    
    setProfileImage(null);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div 
        className="rounded-lg shadow-lg overflow-hidden"
        style={{ background: theme.cardBg }}
      >
        {/* Header with background */}
        <div 
          className="h-32 relative"
          style={{ background: theme.primaryGradient }}
        >
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div 
                className="h-32 w-32 rounded-full border-4 overflow-hidden"
                style={{ 
                  background: theme.surface,
                  borderColor: theme.cardBorder
                }}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center"
                    style={{ 
                      background: theme.surface,
                      color: theme.textMuted
                    }}
                  >
                    {formData.firstName && formData.lastName ? (
                      <span className="text-4xl font-bold">
                        {formData.firstName[0]}{formData.lastName[0]}
                      </span>
                    ) : (
                      <span className="text-4xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
                
                {isEditing && (
                  <label 
                    htmlFor="profile-photo-upload" 
                    className="absolute bottom-0 right-0 rounded-full p-2 cursor-pointer"
                    style={{ background: theme.primary }}
                  >
                    <CameraIcon 
                      className="h-5 w-5" 
                      style={{ color: theme.textInverted }}
                    />
                    <input 
                      id="profile-photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          
          {/* Edit/Save buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 px-4 py-2 rounded-md transition-colors"
                style={{
                  background: theme.buttonPrimary,
                  color: theme.textInverted
                }}
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-1 px-4 py-2 rounded-md transition-colors"
                  style={{
                    background: theme.buttonSecondary,
                    color: theme.textPrimary
                  }}
                  disabled={isSaving}
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-1 px-4 py-2 rounded-md transition-colors"
                  style={{
                    background: theme.buttonPrimary,
                    color: theme.textInverted
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg 
                        className="animate-spin h-4 w-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                        style={{ color: theme.textInverted }}
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile content */}
        <div className="p-8 pt-20">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                Personal Information
              </h1>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.textSecondary }}
                  >
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                      style={{
                        background: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                        color: theme.textPrimary
                      }}
                    />
                  ) : (
                    <p style={{ color: theme.textPrimary }}>{formData.firstName || '—'}</p>
                  )}
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.textSecondary }}
                  >
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                      style={{
                        background: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                        color: theme.textPrimary
                      }}
                    />
                  ) : (
                    <p style={{ color: theme.textPrimary }}>{formData.lastName || '—'}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Email
                </label>
                <p style={{ color: theme.textPrimary }}>{formData.email || '—'}</p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: theme.textMuted }}
                >
                  Email cannot be changed
                </p>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Mobile Number
                </label>
                <p style={{ color: theme.textPrimary }}>{formData.mobileNumber || '—'}</p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: theme.textMuted }}
                >
                  Mobile number cannot be changed
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                Location
              </h1>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Country
                </label>
                {isEditing ? (
                  <select
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                    style={{
                      background: theme.inputBg,
                      border: `1px solid ${theme.inputBorder}`,
                      color: theme.textPrimary
                    }}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                ) : (
                  <p style={{ color: theme.textPrimary }}>{formData.country || '—'}</p>
                )}
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                    style={{
                      background: theme.inputBg,
                      border: `1px solid ${theme.inputBorder}`,
                      color: theme.textPrimary
                    }}
                  />
                ) : (
                  <p style={{ color: theme.textPrimary }}>{formData.state || '—'}</p>
                )}
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                    style={{
                      background: theme.inputBg,
                      border: `1px solid ${theme.inputBorder}`,
                      color: theme.textPrimary
                    }}
                  />
                ) : (
                  <p style={{ color: theme.textPrimary }}>{formData.city || '—'}</p>
                )}
              </div>

              <div className="pt-4">
                <p 
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  Last updated: {user?.last_login ? new Date(user.last_login).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;