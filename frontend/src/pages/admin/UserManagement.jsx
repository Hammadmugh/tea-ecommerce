import React, { useEffect, useState } from 'react';
import {
  getAllUsers,
  blockUser,
  unblockUser,
  createAdmin,
  changeUserRole,
  deleteUser,
} from '../../services/adminApi';
import { AlertCircle, Trash2, Lock, Unlock, Plus } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState({ type: '', data: {} });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, blockedFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const isBlockedFilter = blockedFilter === '' ? null : blockedFilter === 'true';
      const response = await getAllUsers(currentPage, 20, roleFilter || null, isBlockedFilter);
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await blockUser(userId);
      setSuccess('User blocked successfully');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      setSuccess('User unblocked successfully');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to unblock user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setSuccess('User deleted successfully');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  const openCreateAdminModal = () => {
    setModal({ type: 'createAdmin', data: { name: '', email: '', password: '' } });
    setShowModal(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const { name, email, password } = modal.data;

    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    try {
      await createAdmin(name, email, password);
      setSuccess('Admin created successfully');
      setShowModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      setSuccess('User role changed successfully');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change user role');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-montserrat">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white">
            ✓
          </div>
          <p className="text-green-800 font-montserrat">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-800 font-montserrat">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-prosto-one font-normal text-gray-950">User Management</h2>
        <button
          onClick={openCreateAdminModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-montserrat text-sm"
        >
          <Plus size={18} />
          Create Admin
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
            Filter by Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={blockedFilter}
            onChange={(e) => {
              setBlockedFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Users</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-700 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-700 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-montserrat text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-montserrat text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.role !== 'superadmin' ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded font-montserrat text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs font-montserrat font-medium">
                            Super Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-montserrat font-medium ${
                            user.isBlocked
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex items-center">
                        {!user.isBlocked ? (
                          <button
                            onClick={() => handleBlockUser(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Block user"
                          >
                            <Lock size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(user._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Unblock user"
                          >
                            <Unlock size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-600 font-montserrat">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-montserrat disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-montserrat disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 font-montserrat">No users found</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showModal && modal.type === 'createAdmin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-prosto-one font-normal text-gray-950 mb-4">
              Create New Admin
            </h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={modal.data.name}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={modal.data.email}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={modal.data.password}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, password: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-montserrat font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-montserrat font-medium text-sm"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
