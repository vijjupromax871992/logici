// src/services/inquiryService.js
import axios from 'axios';
import { BACKEND_URL } from '../config/api';

const API_URL = BACKEND_URL;

class InquiryService {
  // Get inquiries allocated to the partner
  async getPartnerInquiries() {
    try {
      // Use the correct endpoint from your backend
      const response = await axios.get(`${API_URL}/api/partner/inquiries`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      // Return a default structure to prevent UI errors
      return { data: [], pagination: { total: 0 } };
    }
  }

  // Get unallocated inquiries
  async getUnallocatedInquiries() {
    try {
      const response = await axios.get(`${API_URL}/api/partner/inquiries/unallocated`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return { data: [], pagination: { total: 0 } };
    }
  }

  // Update inquiry status
  async updateInquiryStatus(inquiryId, newStatus) {
    try {
      const response = await axios.put(
        `${API_URL}/api/partner/inquiries/${inquiryId}/status`,
        { status: newStatus },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}

const inquiryService = new InquiryService();
export default inquiryService;