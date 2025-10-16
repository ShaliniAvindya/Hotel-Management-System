import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../apiconfig';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const { user, api } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, message: '', userId: null });
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'guest', isAdmin: false });
  const [editModal, setEditModal] = useState({ open: false, user: null });

  // Authentication check
  useEffect(() => {
    if (!user) {
      setError('Please log in to access this page.');
      navigate('/login', { state: { message: 'Access required' } });
    } else if (!user.isAdmin) {
      setError('Access denied. Admins only.');
      navigate('/', { state: { message: 'Access denied' } });
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  // Error timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Success timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_BASE_URL}/users/all`);
      console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id) => {
    console.log('Delete clicked for user:', id);
    setConfirmModal({
      open: true,
      action: () => executeDeleteUser(id),
      message: `Are you sure you want to delete user ID ${id}?`,
      userId: id,
    });
  };

  const executeDeleteUser = async (id) => {
    try {
      console.log('Executing delete for user:', id);
      await api.delete(`${API_BASE_URL}/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      setSuccess('User deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete user: ${err.response?.data?.message || err.message}`);
    } finally {
      setConfirmModal({ open: false, action: null, message: '', userId: null });
    }
  };

  const handleToggleAdmin = (id, currentStatus) => {
    console.log('Toggle admin clicked for user:', id, 'current status:', currentStatus);
    setConfirmModal({
      open: true,
      action: () => executeToggleAdmin(id, currentStatus),
      message: `Are you sure you want to ${currentStatus ? 'demote' : 'promote'} user ID ${id} ${currentStatus ? 'from' : 'to'} admin?`,
      userId: id,
    });
  };
  const executeToggleAdmin = async (id, currentStatus) => {
    try {
      console.log('Executing toggle admin for user:', id);
      const response = await api.put(`${API_BASE_URL}/users/${id}/toggle-admin`, {
        isAdmin: !currentStatus
      });
      setUsers(users.map(u => u._id === id ? { ...u, isAdmin: response.data.user.isAdmin } : u));
      setSuccess(response.data.message);
    } catch (err) {
      console.error('Toggle admin error:', err);
      setError(`Failed to toggle admin status: ${err.response?.data?.message || err.message}`);
    } finally {
      setConfirmModal({ open: false, action: null, message: '', userId: null });
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, action: null, message: '', userId: null });
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const body = { ...createForm };
      const res = await api.post(`${API_BASE_URL}/users`, body);
      const newUser = res.data.user;
      setUsers([...(users || []), newUser]);
      setCreateForm({ name: '', email: '', password: '', role: 'guest', isAdmin: false });
      setSuccess('User created');
      toast.success('User created successfully');
    } catch (err) {
      console.error('Create user error', err);
      const msg = err.response?.data?.error || err.message || 'Failed to create user';
      setError(msg);
      toast.error(msg);
    }
  };

  // Edit user
  const openEditModal = (user) => {
    setEditModal({ open: true, user: { ...user } });
  };
  const closeEditModal = () => setEditModal({ open: false, user: null });

  const handleEditSave = async () => {
    try {
      const u = editModal.user;
      const payload = {};
      if (u.status !== undefined) payload.status = u.status;
      if (u.isActive !== undefined) payload.isActive = u.isActive;
      if (u.lastLogin !== undefined) payload.lastLogin = u.lastLogin;
      const res = await api.patch(`${API_BASE_URL}/users/${u._id}`, payload);
      const updated = res.data.user;
      setUsers(users.map(x => x._id === updated._id ? updated : x));
      closeEditModal();
      setSuccess('User updated');
      toast.success('User updated successfully');
    } catch (err) {
      console.error('Edit user error', err);
      const msg = err.response?.data?.error || err.message || 'Failed to update user';
      setError(msg);
      toast.error(msg);
    }
  };

  if (loading || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        <p className="text-xl text-[#34495e]">{error || 'Loading users...'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-[#34495e]">User Management</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 mb-6 rounded-lg">{success}</div>}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#34495e]">Create User</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <input required value={createForm.name} onChange={(e) => setCreateForm({...createForm, name: e.target.value})} placeholder="Full name" className="p-3 border rounded-xl" />
            <input required value={createForm.email} onChange={(e) => setCreateForm({...createForm, email: e.target.value})} placeholder="Email" type="email" className="p-3 border rounded-xl" />
            <input required value={createForm.password} onChange={(e) => setCreateForm({...createForm, password: e.target.value})} placeholder="Password" type="password" className="p-3 border rounded-xl" />
            <div className="flex items-center space-x-2">
              <select value={createForm.role} onChange={(e) => setCreateForm({...createForm, role: e.target.value})} className="p-3 border rounded-xl">
                <option value="guest">Guest</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" checked={createForm.isAdmin} onChange={(e) => setCreateForm({...createForm, isAdmin: e.target.checked})} />
                <span className="text-sm">Is Admin</span>
              </label>
              <button type="submit" className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-xl">Create</button>
            </div>
          </form>
        </div>

        {/* User List */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-[#34495e]">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-lg">
              <thead>
                <tr className="bg-gray-100 text-[#34495e]">
                  <th className="py-3 px-6 text-left font-semibold">Name</th>
                  <th className="py-3 px-6 text-left font-semibold">Email</th>
                  <th className="py-3 px-6 text-left font-semibold">Role</th>
                  <th className="py-3 px-6 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(u => {
                    const status = u.status || (typeof u.isActive === 'boolean' ? (u.isActive ? 'Active' : 'Inactive') : (u.isAdmin ? 'Active' : '—'));
                    const lastLoginRaw = u.lastLogin || u.last_login || u.lastSeen || u.lastSeenAt || u.lastActive || u.updatedAt || u.lastOnline;
                    let lastLogin = '—';
                    if (lastLoginRaw) {
                      try {
                        lastLogin = new Date(lastLoginRaw).toLocaleString();
                      } catch (e) {
                        lastLogin = String(lastLoginRaw);
                      }
                    }
                    return (
                      <tr key={u._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-6">{u.name || '—'}</td>
                        <td className="py-3 px-6">{u.email || '—'}</td>
                        <td className="py-3 px-6">{u.isAdmin ? 'Admin' : 'User'}</td>
                        <td className="py-3 px-6">{status}</td>
                        <td className="py-3 px-6">{lastLogin}</td>
                        <td className="py-3 px-6 flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!u.isAdmin}
                              onChange={() => handleToggleAdmin(u._id, u.isAdmin)}
                              className="sr-only"
                              disabled={u._id === user?._id || confirmModal.userId === u._id}
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${u.isAdmin ? 'bg-blue-600' : 'bg-gray-300'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${u.isAdmin ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="ml-2 text-gray-600">{u.isAdmin ? 'Demote' : 'Promote'}</span>
                          </label>
                          <button onClick={() => openEditModal(u)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-xl font-semibold">Edit</button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-xl font-semibold transition-all"
                            disabled={u._id === user?._id || confirmModal.userId === u._id}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-3 px-6 text-center text-gray-600">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              <h3 className="text-xl font-semibold text-[#34495e] mb-4">Confirm Action</h3>
              <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeConfirmModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmModal.action}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    Confirm
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[#34495e] mb-4">Edit User</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm">Status</label>
                  <select value={editModal.user.status || ''} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, status: e.target.value } })} className="w-full p-2 border rounded">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm">Is Active</label>
                  <input type="checkbox" checked={!!editModal.user.isActive} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, isActive: e.target.checked } })} />
                </div>
                <div>
                  <label className="text-sm">Last Login (ISO or leave blank)</label>
                  <input type="text" value={editModal.user.lastLogin || ''} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, lastLogin: e.target.value } })} placeholder="2025-10-16T12:34:56Z" className="w-full p-2 border rounded" />
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={closeEditModal} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                  <button onClick={handleEditSave} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;