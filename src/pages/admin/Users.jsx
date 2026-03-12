import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiMail, FiCalendar, FiShield } from 'react-icons/fi';
import { getAllUsers } from '../../services/dashboardService';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        
        // Set users from backend response
        if (response && Array.isArray(response)) {
          setUsers(response);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Only run once on mount

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'farmer': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'owner': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: '#a1a1a1', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f0f' }}>
      {/* Header */}
      <div className="p-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Users Management</h1>
            <p style={{ color: '#a1a1a1' }}>Manage and monitor all platform users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              {users.length} Total Users
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <FiSearch className="absolute left-3 top-3" style={{ color: '#666666' }} />
            <input
              id="user-search"
              name="user-search"
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg"
              autoComplete="off"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-3" style={{ color: '#666666' }} />
            <select
              id="role-filter"
              name="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              autoComplete="off"
              className="pl-10 pr-4 py-3 rounded-lg appearance-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="farmer">Farmer</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-8">
        <div className="rounded-2xl overflow-hidden" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-opacity-50 transition-colors"
                    style={{ hover: { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ 
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}>
                          <FiUsers className="text-sm" style={{ color: '#22c55e' }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#ffffff' }}>
                            {user.fullName || 'N/A'}
                          </div>
                          <div className="text-sm" style={{ color: '#666666' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border" style={{
                        backgroundColor: getRoleColor(user.role).bg,
                        color: getRoleColor(user.role).text,
                        borderColor: getRoleColor(user.role).border
                      }}>
                        {user.role || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border" style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        color: '#22c55e',
                        borderColor: 'rgba(34, 197, 94, 0.3)'
                      }}>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#a1a1a1' }}>
                      {formatDate(user.createdAt || user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'}
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-4xl mb-4" style={{ color: '#666666' }} />
              <p style={{ color: '#a1a1a1' }}>No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: '#a1a1a1' }}>Name</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>{selectedUser.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#a1a1a1' }}>Email</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#a1a1a1' }}>Role</p>
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border" style={{
                  backgroundColor: getRoleColor(selectedUser.role).bg,
                  color: getRoleColor(selectedUser.role).text,
                  borderColor: getRoleColor(selectedUser.role).border
                }}>
                  {selectedUser.role || 'Unknown'}
                </span>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#a1a1a1' }}>Joined</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>
                  {formatDate(selectedUser.createdAt || selectedUser.created_at)}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UsersManagement;
