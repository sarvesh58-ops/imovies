import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { showToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        limit: 50
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await adminService.toggleUserStatus(userId, nextStatus);
      showToast(`User account ${nextStatus ? 'activated' : 'suspended'}`, 'info');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: nextStatus } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle user status', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">User Accounts Management</h2>
          <p className="text-secondary small mb-0">Manage customer profiles, roles, and account permissions</p>
        </div>
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-info px-3 py-2">
          {users.length} Users
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="card glass-panel border-secondary p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white"
                placeholder="Search by user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-cinema" type="submit">Search</button>
            </div>
          </div>

          <div className="col-md-6 d-flex justify-content-md-end gap-2">
            {['all', 'user', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                className={`btn btn-sm text-capitalize ${
                  roleFilter === r ? 'btn-danger' : 'btn-dark border-secondary text-secondary'
                }`}
                onClick={() => setRoleFilter(r)}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card glass-panel border-secondary p-4">
        {loading ? (
          <Loader message="Loading users..." />
        ) : users.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-secondary mb-0">No users match your criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary extra-small text-uppercase">
                  <th>User Profile</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                          alt=""
                          className="rounded-circle border border-secondary"
                          style={{ width: '32px', height: '32px' }}
                        />
                        <div>
                          <span className="text-white fw-bold d-block">{u.name}</span>
                          <span className="text-secondary extra-small">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-secondary">{u.phone || '—'}</td>
                    <td>
                      <select
                        className="form-select form-select-sm bg-black border-secondary text-white py-0 px-2"
                        style={{ width: '100px', fontSize: '0.75rem' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.isActive
                            ? 'bg-success bg-opacity-25 text-success border border-success'
                            : 'bg-danger bg-opacity-25 text-danger border border-danger'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="text-secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'} extra-small py-1`}
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
