// src/config/api.js
// Helper function for image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return `${BACKEND_URL}/uploads/default.jpg`;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_URL}/${imagePath.replace(/^\/+/, '')}`;
};

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://logic-i.com';

export default BACKEND_URL;

export const getApiUrl = (endpoint) => `${BACKEND_URL}${endpoint}`;

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data;
};