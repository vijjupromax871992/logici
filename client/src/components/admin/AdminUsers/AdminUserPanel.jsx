import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import CreateAdminModal from './CreateAdminModal';
import EditAdminModal from './EditAdminModal';
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ThemedCard,
  ThemedTable,
  ThemedTableHeader,
  ThemedTableHeaderCell,
  ThemedTableBody,
  ThemedTableRow,
  ThemedTableCell,
  ThemedButton,
  ThemedInput,
  ThemedSelect
} from '../common/ThemedTable';

const AdminUserPanel = () => {
  const { theme } = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/admin/admin-users?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin users');
      }

      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create admin');
      }

      if (result.success) {
        setShowCreateModal(false);
        await fetchAdmins(); // Refresh the list
        // Show success message
        alert('Admin user created successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditAdmin = async (adminData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/users/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update admin');
      }

      if (result.success) {
        setShowEditModal(false);
        setSelectedAdmin(null);
        await fetchAdmins(); // Refresh the list
        alert('Admin user updated successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/users/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete admin');
      }

      if (result.success) {
        await fetchAdmins(); // Refresh the list
        alert('Admin user deleted successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAdmins = admins;

  if (loading) {
    return (
      <div className="p-6 min-h-screen" style={{ background: theme.background }}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 rounded-lg w-64" style={{ backgroundColor: theme.surface + '80' }}></div>
          <div className="h-12 rounded-lg" style={{ backgroundColor: theme.surface + '80' }}></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg" style={{ backgroundColor: theme.surface + '80' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen" style={{ background: theme.background }}>
        <div className="border px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: theme.error + '33', color: theme.error }}>
          <p className="font-medium">Error loading admin users</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ background: theme.background }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: theme.textPrimary }}>
              Admin User Management
            </h1>
            <p style={{ color: theme.textSecondary }}>
              Manage administrator accounts and permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:opacity-90"
            style={{ background: theme.buttonPrimary, color: theme.textInverted }}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Create Admin
          </button>
        </div>

        {/* Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: theme.glassBg }}></div>
          <div className="relative z-10 flex items-center">
            <div className="p-4 rounded-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: theme.primaryLight, color: theme.primary }}>
              <Users className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold uppercase tracking-wider mb-1 group-hover:opacity-80 transition-colors duration-300" style={{ color: theme.textSecondary }}>Total Admins</p>
              <p className="text-3xl font-black transition-all duration-300" style={{ color: theme.textPrimary }}>{admins.length}</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: theme.glassBg }}></div>
          <div className="relative z-10 flex items-center">
            <div className="p-4 rounded-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: theme.success }}>
              <Shield className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold uppercase tracking-wider mb-1 group-hover:opacity-80 transition-colors duration-300" style={{ color: theme.textSecondary }}>Active Admins</p>
              <p className="text-3xl font-black transition-all duration-300" style={{ color: theme.textPrimary }}>{admins.filter(a => a.isAdmin).length}</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: theme.glassBg }}></div>
          <div className="relative z-10 flex items-center">
            <div className="p-4 rounded-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' }}>
              <UserPlus className="h-7 w-7" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold uppercase tracking-wider mb-1 group-hover:opacity-80 transition-colors duration-300" style={{ color: theme.textSecondary }}>Recently Added</p>
              <p className="text-3xl font-black transition-all duration-300" style={{ color: theme.textPrimary }}>
                {admins.filter(a => new Date(a.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="relative overflow-hidden backdrop-blur-2xl rounded-2xl shadow-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
        <div className="p-6 border-b" style={{ borderColor: theme.cardBorder, background: theme.surface }}>
          <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Admin Users ({filteredAdmins.length})</h2>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: theme.surface }}>
              <Users className="h-8 w-8" style={{ color: theme.textMuted }} />
            </div>
            <p className="text-lg" style={{ color: theme.textMuted }}>No admin users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="backdrop-blur-sm" style={{ background: theme.surface }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme.cardBorder }}>
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="group transition-all duration-300 hover:shadow-lg" style={{ '&:hover': { background: theme.surfaceHover } }}>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl border flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: theme.primaryLight, borderColor: theme.primary + '50' }}>
                          <span className="font-bold text-lg" style={{ color: theme.primary }}>
                            {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-5">
                          <div className="text-base font-bold group-hover:opacity-90 transition-colors duration-300" style={{ color: theme.textPrimary }}>
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="flex items-center mt-1">
                            <Shield className="h-3 w-3 mr-1" style={{ color: theme.primary }} />
                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.primary }}>Administrator</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium mb-1" style={{ color: theme.textPrimary }}>{admin.email}</div>
                      <div className="text-sm" style={{ color: theme.textSecondary }}>{admin.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium mb-1" style={{ color: theme.textPrimary }}>
                        {admin.city ? `${admin.city}, ${admin.state}` : 'Not specified'}
                      </div>
                      <div className="text-sm" style={{ color: theme.textSecondary }}>{admin.country || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium mb-1" style={{ color: theme.textPrimary }}>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm" style={{ color: theme.textSecondary }}>
                        {new Date(admin.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowEditModal(true);
                          }}
                          className="group/btn p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:opacity-80"
                          style={{ color: theme.primary, '&:hover': { backgroundColor: theme.primaryLight } }}
                          title="Edit Admin"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="group/btn p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:opacity-80"
                          style={{ color: theme.error, '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' } }}
                          title="Delete Admin"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAdmin}
        />
      )}

      {showEditModal && selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
          }}
          onSubmit={handleEditAdmin}
        />
      )}
    </div>
  );
};

export default AdminUserPanel;