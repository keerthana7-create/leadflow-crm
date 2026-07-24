import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, Shield, Mail, Lock } from 'lucide-react';
import { userService } from '../../services/userService';
import { RoleBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userService.createUser(newUser);
      toast.success('User created successfully');
      setCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Member' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { _id, name, email, role, isActive } = editModal.user;
      await userService.updateUser(_id, { name, email, role, isActive });
      toast.success('User updated successfully');
      setEditModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    try {
      await userService.deleteUser(deleteModal.user._id);
      toast.success('User deleted successfully');
      setDeleteModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <TableSkeleton rows={6} cols={5} />;
  if (error) return <ErrorState message={error} onRetry={fetchUsers} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500">Manage sales team members, role permissions, and access status.</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus size={16} /> Add Team Member
        </Button>
      </div>

      {/* Users Table Card */}
      <div className="card overflow-hidden">
        {users.length === 0 ? (
          <EmptyState title="No users found" action={() => setCreateModal(true)} actionLabel="Add User" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">User Name</th>
                  <th className="table-cell">Role</th>
                  <th className="table-cell">Status</th>
                  <th className="table-cell">Joined Date</th>
                  <th className="table-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="table-row">
                    <td className="table-cell font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditModal({ open: true, user: { ...u } })}
                          className="btn-ghost p-1.5"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, user: u })}
                          className="btn-ghost p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete User"
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
        )}
      </div>

      {/* Create User Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Add New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              className="input"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input
              type="email"
              required
              className="input"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password * (Min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Role Permission</label>
            <select
              className="input"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="Member">Member (Sales Rep)</option>
              <option value="Admin">Admin (Full Access)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, user: null })} title="Edit User">
        {editModal.user && (
          <form onSubmit={handleEditUserSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                required
                className="input"
                value={editModal.user.name}
                onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, name: e.target.value } })}
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                className="input"
                value={editModal.user.email}
                onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, email: e.target.value } })}
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={editModal.user.role}
                onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editModal.user.isActive}
                onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, isActive: e.target.checked } })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Active</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false, user: null })}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, user: null })} title="Delete User">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete user <span className="font-bold text-slate-900 dark:text-white">{deleteModal.user?.name}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false, user: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUserConfirm}>
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
