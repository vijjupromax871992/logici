import { useState, useEffect } from 'react';
import { Trash2, AlertCircle, CheckCircle, Search, Settings } from 'lucide-react';
import {BACKEND_URL} from '../../../config/api';
import ThemedPageWrapper from '../common/ThemedPageWrapper';
import { useTheme } from '../../../contexts/ThemeContext';

const ManageUsers = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data.rows);
      setTotalPages(Math.ceil(data.data.count / 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccessMessage('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers(); 

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId, newIsAdmin) => {
    try {
      setUpdatingRole(userId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin: newIsAdmin })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: newIsAdmin }
          : user
      ));

      setSuccessMessage(`User role updated to ${newIsAdmin ? 'Admin' : 'User'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="p-6" style={{ background: theme.background }}>
      <div className="animate-pulse space-y-4">
        <div className="h-10 rounded w-1/4" style={{ background: theme.surface }}></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded" style={{ background: theme.surface }}></div>
        ))}
      </div>
    </div>
  );

  return (
    <ThemedPageWrapper title="Manage Users" subtitle="View and manage all registered users">
      <div className="rounded-lg shadow-lg p-6" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg flex items-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: theme.success }}>
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg flex items-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: theme.error }}>
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5" style={{ color: theme.textMuted }} />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ 
            background: theme.inputBg, 
            border: `1px solid ${theme.inputBorder}`, 
            color: theme.textPrimary 
          }}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b" style={{ color: theme.textMuted, borderColor: theme.cardBorder }}>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Mobile</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b transition-colors" style={{ 
                borderColor: theme.cardBorder, 
                color: theme.textSecondary 
              }}
              onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = theme.surfaceHover}
              onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                <td className="px-6 py-4">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.mobileNumber}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs" style={{
                    backgroundColor: user.isAdmin ? 'rgba(147, 51, 234, 0.2)' : theme.primaryLight,
                    color: user.isAdmin ? '#c4b5fd' : theme.primary
                  }}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <select
                      value={user.isAdmin}
                      onChange={(e) => handleRoleChange(user.id, e.target.value === 'true')}
                      disabled={updatingRole === user.id}
                      className="px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                      style={{ 
                        backgroundColor: theme.inputBg, 
                        borderColor: theme.inputBorder, 
                        color: theme.textPrimary,
                        border: `1px solid ${theme.inputBorder}`
                      }}
                    >
                      <option value={false}>User</option>
                      <option value={true}>Admin</option>
                    </select>
                    {updatingRole === user.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderBottomColor: theme.primary }}></div>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(user.id)}
                      className="transition-colors"
                      style={{ color: theme.error }}
                      onMouseEnter={(e) => e.target.style.color = '#fca5a5'}
                      onMouseLeave={(e) => e.target.style.color = theme.error}
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

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className="px-3 py-1 rounded transition-colors"
            style={{
              backgroundColor: currentPage === i + 1 ? theme.primary : theme.surface,
              color: currentPage === i + 1 ? theme.textInverted : theme.textMuted
            }}
            onMouseEnter={(e) => {
              if (currentPage !== i + 1) {
                e.target.style.backgroundColor = theme.surfaceHover;
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== i + 1) {
                e.target.style.backgroundColor = theme.surface;
              }
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="p-6 rounded-lg max-w-md w-full mx-4" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: theme.textPrimary }}>Confirm Delete</h3>
            <p className="mb-6" style={{ color: theme.textSecondary }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded transition-colors"
                style={{ backgroundColor: theme.surface, color: theme.textPrimary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.surfaceHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.surface}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded transition-colors"
                style={{ backgroundColor: theme.error, color: theme.textInverted }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.error}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ThemedPageWrapper>
  );
};

export default ManageUsers;