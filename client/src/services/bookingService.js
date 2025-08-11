// src/services/bookingService.js - ENHANCED WITH CONFIRMED BOOKINGS
import { BACKEND_URL } from '../config/api';

// Get auth token from localStorage with multiple fallbacks
const getAuthToken = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('auth_token') ||
         localStorage.getItem('authToken') || 
         localStorage.getItem('accessToken') ||
         localStorage.getItem('jwt');
};

// Get auth headers with debugging
const getAuthHeaders = () => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Enhanced error handling
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Clear all possible token storage locations
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      
      // Redirect to homepage instead of login
      window.location.href = '/';
      throw new Error('Authentication required');
    }
    
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
};

const bookingService = {
  // Owner/User methods - ENHANCED WITH TYPE SUPPORT
  async getBookings(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${BACKEND_URL}/api/bookings?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async updateBookingStatus(bookingId, status, type = 'inquiry') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, type })
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async getBookingStats() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Admin methods - ENHANCED WITH TYPE SUPPORT
  async getAllBookingsAdmin(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${BACKEND_URL}/admin/bookings?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async updateBookingStatusAdmin(bookingId, status, notes = '', type = 'inquiry') {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes, type })
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async deleteBookingAdmin(bookingId, type = 'inquiry') {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type })
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async getBookingByIdAdmin(bookingId, type = 'inquiry') {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/bookings/${bookingId}?type=${type}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async bulkUpdateBookingStatusAdmin(bookingIds, status, type = 'inquiry') {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/bookings/bulk-update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingIds, status, type })
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Payment related methods
  async getConfirmedBookings(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${BACKEND_URL}/api/payments/bookings?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create booking (for payment cancelled flow)
  async createBooking(bookingData) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/public/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      return await handleResponse(response);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Utility method to check auth status
  async checkAuthStatus() {
    try {
      const token = getAuthToken();
      if (!token) {
        return { authenticated: false, message: 'No token found' };
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return { authenticated: true, user: data.user };
      } else {
        return { authenticated: false, message: 'Token invalid' };
      }
    } catch (error) {
      return { authenticated: false, message: error.message };
    }
  },

  // Helper method to format currency
  formatCurrency(amountInPaise) {
    return `₹${(amountInPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  },

  // Helper method to determine booking type badge color
  getBookingTypeBadge(type, isPaid) {
    if (type === 'confirmed' || isPaid) {
      return {
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
        label: 'Paid'
      };
    } else {
      return {
        color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        label: 'Inquiry'
      };
    }
  }
};

export default bookingService;