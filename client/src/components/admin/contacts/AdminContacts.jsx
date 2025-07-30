import React, { useState, useEffect } from 'react';
import { Phone, Mail, Building2, Calendar, User, Eye, Trash2, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BACKEND_URL } from '../../../config/api';

const AdminContacts = () => {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const contactsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'All Contacts', color: theme.textPrimary },
    { value: 'new', label: 'New', color: '#3b82f6' },
    { value: 'contacted', label: 'Contacted', color: '#f59e0b' },
    { value: 'in_progress', label: 'In Progress', color: '#8b5cf6' },
    { value: 'completed', label: 'Completed', color: '#10b981' },
    { value: 'closed', label: 'Closed', color: '#6b7280' }
  ];

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : theme.textMuted;
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: contactsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`${BACKEND_URL}/api/admin/contacts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setContacts(data.data);
        setTotalContacts(data.total);
        setTotalPages(data.totalPages);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId, newStatus, notes = '') => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/api/admin/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh contacts list
        fetchContacts();
        // Update selected contact if it's open
        if (selectedContact && selectedContact.id === contactId) {
          setSelectedContact({
            ...selectedContact,
            status: newStatus,
            notes: notes || selectedContact.notes
          });
        }
        setUpdateStatus('');
        setStatusNotes('');
        return true;
      } else {
        throw new Error(data.message || 'Failed to update contact status');
      }
    } catch (err) {
      console.error('Error updating contact status:', err);
      setError(err.message);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchContacts();
        if (selectedContact && selectedContact.id === contactId) {
          setShowDetails(false);
          setSelectedContact(null);
        }
      } else {
        throw new Error(data.message || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError(err.message);
    }
  };

  const openContactDetails = async (contact) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/contacts/${contact.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedContact(data.data);
        setShowDetails(true);
        setUpdateStatus(data.data.status);
        setStatusNotes(data.data.notes || '');
      } else {
        throw new Error(data.message || 'Failed to fetch contact details');
      }
    } catch (err) {
      console.error('Error fetching contact details:', err);
      setError(err.message);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchContacts();
  }, [currentPage, statusFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>
          Contact Management
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Manage and respond to contact form submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusOptions.slice(1).map(({ value, label, color }) => {
          const count = contacts.filter(c => c.status === value).length;
          return (
            <div
              key={value}
              className="p-6 rounded-xl border transition-all duration-200 hover:scale-105"
              style={{
                background: theme.cardBg,
                borderColor: theme.cardBorder,
                boxShadow: theme.cardShadow
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                    {label}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: color }}>
                    {count}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Phone size={24} style={{ color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div 
        className="mb-6 p-4 rounded-xl border"
        style={{
          background: theme.cardBg,
          borderColor: theme.cardBorder
        }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.textMuted }} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200"
              style={{
                background: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} style={{ color: theme.textMuted }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border transition-colors duration-200"
              style={{
                background: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }}
            >
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Contacts Table */}
      <div 
        className="rounded-xl border overflow-hidden"
        style={{
          background: theme.cardBg,
          borderColor: theme.cardBorder
        }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: theme.primary }}></div>
            <p style={{ color: theme.textSecondary }}>Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <Phone size={48} className="mx-auto mb-4" style={{ color: theme.textMuted }} />
            <p className="text-lg font-medium mb-2" style={{ color: theme.textPrimary }}>No contacts found</p>
            <p style={{ color: theme.textSecondary }}>
              {searchTerm ? 'Try adjusting your search terms.' : 'Contact form submissions will appear here.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: theme.surface }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact, index) => (
                    <tr 
                      key={contact.id}
                      className="border-t transition-colors duration-200 hover:bg-opacity-50"
                      style={{ 
                        borderColor: theme.cardBorder,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.surfaceHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium" style={{ color: theme.textPrimary }}>
                            {contact.fullName}
                          </div>
                          <div className="flex items-center mt-1 space-x-4">
                            <div className="flex items-center" style={{ color: theme.textSecondary }}>
                              <Mail size={14} className="mr-1" />
                              <span className="text-sm">{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center" style={{ color: theme.textSecondary }}>
                                <Phone size={14} className="mr-1" />
                                <span className="text-sm">{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 size={16} className="mr-2" style={{ color: theme.textSecondary }} />
                          <span style={{ color: theme.textPrimary }}>{contact.companyName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: `${getStatusColor(contact.status)}20`,
                            color: getStatusColor(contact.status)
                          }}
                        >
                          {contact.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center" style={{ color: theme.textSecondary }}>
                          <Calendar size={14} className="mr-1" />
                          <span className="text-sm">{formatDate(contact.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openContactDetails(contact)}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{
                              background: theme.buttonSecondary,
                              color: theme.textPrimary
                            }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{
                              background: `${theme.error}20`,
                              color: theme.error
                            }}
                            title="Delete Contact"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div 
                className="px-6 py-4 border-t flex items-center justify-between"
                style={{ borderColor: theme.cardBorder }}
              >
                <div style={{ color: theme.textSecondary }}>
                  Showing {((currentPage - 1) * contactsPerPage) + 1} to {Math.min(currentPage * contactsPerPage, totalContacts)} of {totalContacts} contacts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: theme.buttonSecondary,
                      color: theme.textPrimary
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-4 py-2" style={{ color: theme.textPrimary }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: theme.buttonSecondary,
                      color: theme.textPrimary
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Details Modal */}
      {showDetails && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border"
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder
            }}
          >
            <div 
              className="p-6 border-b"
              style={{ borderColor: theme.cardBorder }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold" style={{ color: theme.textPrimary }}>
                  Contact Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{ color: theme.textSecondary }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                      Full Name
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {selectedContact.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                      Company
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {selectedContact.companyName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                      Email
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {selectedContact.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                      Phone
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {selectedContact.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                      Preferred Contact Method
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {selectedContact.preferredContactMethod || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                      Preferred Contact Time
                    </label>
                    <p className="text-sm" style={{ color: theme.textPrimary }}>
                      {selectedContact.preferredContactTime || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Status Management
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                      Current Status
                    </label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{
                        background: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.textPrimary
                      }}
                    >
                      {statusOptions.slice(1).map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                      Notes
                    </label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{
                        background: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.textPrimary
                      }}
                      placeholder="Add notes about this contact..."
                    />
                  </div>
                  <button
                    onClick={() => updateContactStatus(selectedContact.id, updateStatus, statusNotes)}
                    disabled={updating}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: theme.buttonPrimary,
                      color: theme.textInverted
                    }}
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Submitted:</span>
                    <span style={{ color: theme.textPrimary }}>{formatDate(selectedContact.createdAt)}</span>
                  </div>
                  {selectedContact.contactedAt && (
                    <div className="flex justify-between">
                      <span style={{ color: theme.textSecondary }}>First Contacted:</span>
                      <span style={{ color: theme.textPrimary }}>{formatDate(selectedContact.contactedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Last Updated:</span>
                    <span style={{ color: theme.textPrimary }}>{formatDate(selectedContact.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;