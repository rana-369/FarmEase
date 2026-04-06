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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(168, 85, 247, 0.2)', borderTopColor: '#a855f7' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const farmerCount = users.filter(u => u.role?.toLowerCase() === 'farmer').length;
  const ownerCount = users.filter(u => u.role?.toLowerCase() === 'owner').length;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiUsers className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Users</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Manage platform users</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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
                className="p-5 rounded-2xl relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}20`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
                <div className="flex items-center justify-between mb-2 relative">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}15 100%)`,
                      border: `1px solid ${stat.color}30`
                    }}
                  >
                    <Icon className="text-lg" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold relative" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs font-medium relative" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-purple-500/30" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: 'rgba(255,255,255,0.8)' }} />
            <input
              id="user-search"
              name="user-search"
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: 'rgba(255,255,255,0.8)' }} />
            <select
              id="role-filter"
              name="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm font-medium"
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
        <div className="rounded-3xl overflow-hidden relative" style={{ 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)' }} />
          <div className="overflow-x-auto relative">
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
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
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                              border: '1px solid rgba(168, 85, 247, 0.2)'
                            }}
                          >
                            <FiUsers className="text-sm" style={{ color: '#a855f7' }} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                              {user.fullName || 'N/A'}
                            </div>
                            <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                          style={{ 
                            background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg} 100%)`,
                            border: `1px solid ${config.color}25`,
                            color: config.color 
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {user.role || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            color: '#10b981' 
                          }}
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          <FiCalendar className="w-3 h-3" />
                          {formatDate(user.createdAt || user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedUser(user)}
                            className="p-2.5 rounded-xl transition-colors"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              color: '#10b981' 
                            }}
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 rounded-xl"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              color: '#3b82f6' 
                            }}
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 rounded-xl"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171' 
                            }}
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
            <div className="text-center py-12 relative">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <FiUsers className="text-4xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>No users found</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Try adjusting your search or filter</p>
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
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-3xl p-6 max-w-md w-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)' }} />
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>User Details</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255,255,255,0.6)' 
                }}
              >
                <FiX />
              </motion.button>
            </div>
            
            <div className="space-y-4 relative">
              {[
                { label: 'Name', value: selectedUser.fullName || 'N/A' },
                { label: 'Email', value: selectedUser.email },
                { label: 'Joined', value: formatDate(selectedUser.createdAt || selectedUser.created_at) }
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.label}</p>
                  <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>{item.value}</p>
                </div>
              ))}
              
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Role</p>
                <span 
                  className="px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                  style={{ 
                    background: `linear-gradient(135deg, ${getRoleConfig(selectedUser.role).bg} 0%, ${getRoleConfig(selectedUser.role).bg} 100%)`,
                    border: `1px solid ${getRoleConfig(selectedUser.role).color}25`,
                    color: getRoleConfig(selectedUser.role).color 
                  }}
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
