import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiEdit2, FiTrash2, FiEye, FiMail, FiCalendar, FiShield, FiSearch, FiFilter, FiX, FiUserCheck, FiUserX, FiCheckCircle } from 'react-icons/fi';
import { getAllUsers } from '../../services/dashboardService';
import Pagination from '../../components/Pagination';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const farmerCount = users.filter(u => u.role?.toLowerCase() === 'farmer').length;
  const ownerCount = users.filter(u => u.role?.toLowerCase() === 'owner').length;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}
            >
              <FiUsers className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Users</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Manage platform users</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: totalItems, color: '#a855f7', icon: FiUsers },
            { label: 'Admins', value: adminCount, color: '#ef4444', icon: FiShield },
            { label: 'Farmers', value: farmerCount, color: '#22c55e', icon: FiUserCheck },
            { label: 'Owners', value: ownerCount, color: '#3b82f6', icon: FiUsers }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${stat.color}10`, border: `1px solid ${stat.color}20` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="text-lg" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#888888' }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: '#666666' }} />
            <input
              id="user-search"
              name="user-search"
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: '#666666' }} />
            <select
              id="role-filter"
              name="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm"
              style={{ color: '#ffffff' }}
            >
              <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>All Roles</option>
              <option value="admin" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Admin</option>
              <option value="farmer" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Farmer</option>
              <option value="owner" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Owner</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl overflow-hidden" style={{ 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
                {users.map((user, index) => {
                  const config = getRoleConfig(user.role);
                  const Icon = config.icon;
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                          >
                            <FiUsers className="text-sm" style={{ color: '#a855f7' }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: '#ffffff' }}>
                              {user.fullName || 'N/A'}
                            </div>
                            <div className="text-xs" style={{ color: '#666666' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                          style={{ backgroundColor: config.bg, color: config.color }}
                        >
                          <Icon className="w-3 h-3" />
                          {user.role || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                          style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#888888' }}>
                          <FiCalendar className="w-3 h-3" />
                          {formatDate(user.createdAt || user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedUser(user)}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
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
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-4xl mb-4" style={{ color: '#333333' }} />
              <p className="text-sm" style={{ color: '#666666' }}>No users found</p>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>User Details</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
              >
                <FiX />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Name', value: selectedUser.fullName || 'N/A' },
                { label: 'Email', value: selectedUser.email },
                { label: 'Joined', value: formatDate(selectedUser.createdAt || selectedUser.created_at) }
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs mb-1" style={{ color: '#666666' }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{item.value}</p>
                </div>
              ))}
              
              <div>
                <p className="text-xs mb-1" style={{ color: '#666666' }}>Role</p>
                <span 
                  className="px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                  style={{ backgroundColor: getRoleConfig(selectedUser.role).bg, color: getRoleConfig(selectedUser.role).color }}
                >
                  {selectedUser.role || 'Unknown'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UsersManagement;
