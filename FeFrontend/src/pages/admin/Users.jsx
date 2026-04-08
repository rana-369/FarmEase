import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiEdit2, FiTrash2, FiEye, FiMail, FiCalendar, FiShield, FiSearch, FiFilter, FiX, FiUserCheck, FiUserX, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import Modal from '../../components/Modal';
import { getAllUsers, changeUserRole, deleteUser } from '../../services/dashboardService';
import Pagination from '../../components/Pagination';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, user: null, newRole: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(currentPage, itemsPerPage, searchTerm, filterRole);
      
      setUsers(response.users || []);
      setTotalItems(response.totalItems || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const getRoleConfig = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { icon: FiShield, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'farmer': return { icon: FiUsers, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
      case 'owner': return { icon: FiUsers, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      default: return { icon: FiUsers, color: '#888888', bg: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditClick = (user) => {
    setEditModal({ open: true, user, newRole: user.role || 'farmer' });
  };

  const handleDeleteClick = (user) => {
    setDeleteModal({ open: true, user });
  };

  const handleRoleChange = async () => {
    if (!editModal.user) return;
    setActionLoading(true);
    const result = await changeUserRole(editModal.user.id, editModal.newRole);
    if (result.success) {
      setNotification({ type: 'success', message: result.message });
      setEditModal({ open: false, user: null, newRole: '' });
      fetchUsers();
    } else {
      setNotification({ type: 'error', message: result.message });
    }
    setActionLoading(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    setActionLoading(true);
    const result = await deleteUser(deleteModal.user.id);
    if (result.success) {
      setNotification({ type: 'success', message: result.message });
      setDeleteModal({ open: false, user: null });
      fetchUsers();
    } else {
      setNotification({ type: 'error', message: result.message });
    }
    setActionLoading(false);
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  const adminCount = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const farmerCount = users.filter(u => u.role?.toLowerCase() === 'farmer').length;
  const ownerCount = users.filter(u => u.role?.toLowerCase() === 'owner').length;

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">Users</h1>
          <p className="page-subtitle-new">Manage platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            className="logo-icon-new"
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.35)'
            }}
          >
            <FiUsers />
          </motion.div>
        </div>
      </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total', value: totalItems, color: '#a855f7', icon: FiUsers },
            { label: 'Admins', value: adminCount, color: '#ef4444', icon: FiShield },
            { label: 'Farmers', value: farmerCount, color: '#10b981', icon: FiUserCheck },
            { label: 'Owners', value: ownerCount, color: '#3b82f6', icon: FiUsers }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="stat-card-new"
              >
                <div className="stat-info">
                  <p className="stat-title-new">{stat.label}</p>
                  <h3 className="stat-value-new" style={{ color: stat.color }}>{stat.value}</h3>
                </div>
                <div 
                  className="stat-icon-new"
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    color: stat.color
                  }}
                >
                  <Icon />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="filters-bar-new mb-6">
          <div className="search-box-new">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <input
              id="user-search"
              name="user-search"
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter style={{ color: 'rgba(255,255,255,0.5)' }} />
            <select
              id="role-filter"
              name="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              autoComplete="off"
              className="filter-select-new"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="farmer">Farmer</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container-new">
          <div className="overflow-x-auto">
            <table className="data-table-new">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const config = getRoleConfig(user.role);
                  const Icon = config.icon;
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div 
                            className="nav-item-icon"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                              color: '#a855f7'
                            }}
                          >
                            <FiUsers />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {user.fullName || 'N/A'}
                            </div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}25` }}>
                          <Icon className="w-3 h-3" />
                          {user.role || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          <FiCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          <FiCalendar className="w-3 h-3" />
                          {formatDate(user.createdAt || user.created_at)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedUser(user)}
                            className="icon-button"
                            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(user)}
                            className="icon-button"
                            style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(user)}
                            className="icon-button"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiUsers />
              </div>
              <p className="empty-state-title">No users found</p>
              <p className="empty-state-text">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

      {/* User Detail Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <div className="flex items-center justify-between mb-6 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="card-title">User Details</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedUser(null)}
            className="icon-button"
          >
            <FiX />
          </motion.button>
        </div>
        
        <div className="space-y-4 px-4 pb-4">
          {[
            { label: 'Name', value: selectedUser?.fullName || 'N/A' },
            { label: 'Email', value: selectedUser?.email },
            { label: 'Joined', value: formatDate(selectedUser?.createdAt || selectedUser?.created_at) }
          ].map((item) => (
            <div key={item.label}>
              <p className="input-label">{item.label}</p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>{item.value}</p>
            </div>
          ))}
          
          <div>
            <p className="input-label">Role</p>
            <span 
              className="badge"
              style={{ 
                background: getRoleConfig(selectedUser?.role).bg,
                border: `1px solid ${getRoleConfig(selectedUser?.role).color}25`,
                color: getRoleConfig(selectedUser?.role).color 
              }}
            >
              {selectedUser?.role || 'Unknown'}
            </span>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, user: null, newRole: '' })}>
        <div className="flex items-center justify-between mb-6 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="card-title">Change User Role</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setEditModal({ open: false, user: null, newRole: '' })}
            className="icon-button"
          >
            <FiX />
          </motion.button>
        </div>
        
        <div className="px-4 pb-4">
          <div className="mb-4">
            <p className="input-label">User</p>
            <p className="font-semibold" style={{ color: '#ffffff' }}>{editModal.user?.fullName}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{editModal.user?.email}</p>
          </div>
          
          <div className="mb-6">
            <p className="input-label mb-2">New Role</p>
            <select
              value={editModal.newRole}
              onChange={(e) => setEditModal({ ...editModal, newRole: e.target.value })}
              style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                width: '100%',
                background: '#1a1a2e',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <option value="farmer" style={{ background: '#1a1a2e', color: '#ffffff' }}>Farmer</option>
              <option value="owner" style={{ background: '#1a1a2e', color: '#ffffff' }}>Owner</option>
              <option value="admin" style={{ background: '#1a1a2e', color: '#ffffff' }}>Admin</option>
            </select>
          </div>
          
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Are you sure you want to change this user's role to <strong style={{ color: '#10b981' }}>{editModal.newRole}</strong>?
          </p>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditModal({ open: false, user: null, newRole: '' })}
              className="secondary-button flex-1"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRoleChange}
              disabled={actionLoading}
              className="primary-button flex-1"
            >
              {actionLoading ? 'Updating...' : 'Confirm'}
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, user: null })}>
        <div className="flex items-center justify-between mb-6 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="card-title" style={{ color: '#f87171' }}>Delete User</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDeleteModal({ open: false, user: null })}
            className="icon-button"
          >
            <FiX />
          </motion.button>
        </div>
        
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 mb-4 p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
            <FiAlertTriangle style={{ color: '#f87171', fontSize: '24px' }} />
            <div>
              <p className="font-semibold" style={{ color: '#f87171' }}>Warning</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>This action cannot be undone.</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="input-label">User to delete</p>
            <p className="font-semibold" style={{ color: '#ffffff' }}>{deleteModal.user?.fullName}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{deleteModal.user?.email}</p>
          </div>
          
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            All associated data (bookings, machines, notifications) will be permanently deleted.
          </p>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDeleteModal({ open: false, user: null })}
              className="secondary-button flex-1"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="primary-button flex-1"
              style={{ background: 'rgba(239, 68, 68, 0.8)' }}
            >
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-[10000] p-4 rounded-lg"
          style={{
            background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff'
          }}
        >
          {notification.message}
        </motion.div>
      )}
    </div>
  );
};

export default UsersManagement;
