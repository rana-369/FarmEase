import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUser, FiAlertCircle, FiThumbsUp } from 'react-icons/fi';
import Modal from '../../components/Modal';
import { 
  getAllTestimonials, 
  getPendingTestimonials,
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  toggleTestimonialActive,
  approveTestimonial
} from '../../services/testimonialService';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    authorName: '',
    authorRole: 'Farmer',
    content: '',
    rating: 5,
    authorLocation: '',
    isActive: true,
    isApproved: true,
    displayOrder: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const [allData, pendingData] = await Promise.all([
        getAllTestimonials(),
        getPendingTestimonials()
      ]);
      setTestimonials(allData);
      setPendingTestimonials(pendingData);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setFormData({
      authorName: '',
      authorRole: 'Farmer',
      content: '',
      rating: 5,
      authorLocation: '',
      isActive: true,
      displayOrder: 0
    });
    setModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole,
      content: testimonial.content,
      rating: testimonial.rating,
      authorLocation: testimonial.authorLocation || '',
      isActive: testimonial.isActive,
      isApproved: testimonial.isApproved,
      displayOrder: testimonial.displayOrder
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingTestimonial) {
        const result = await updateTestimonial(editingTestimonial.id, formData);
        if (result.success) {
          await fetchTestimonials();
          setModalOpen(false);
        } else {
          alert(result.message);
        }
      } else {
        const result = await createTestimonial(formData);
        if (result.success) {
          await fetchTestimonials();
          setModalOpen(false);
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    const result = await deleteTestimonial(id);
    if (result.success) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } else {
      alert(result.message);
    }
  };

  const handleToggleActive = async (id) => {
    const result = await toggleTestimonialActive(id);
    if (result.success) {
      await fetchTestimonials();
    } else {
      alert(result.message);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this testimonial? It will be shown on the landing page.')) return;
    
    const result = await approveTestimonial(id);
    if (result.success) {
      await fetchTestimonials();
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">Testimonials</h1>
          <p className="page-subtitle-new">Manage platform reviews and ratings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="primary-button flex items-center gap-2"
        >
          <FiPlus /> Add Testimonial
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card-new">
          <div className="stat-info">
            <p className="stat-title-new">Total</p>
            <h3 className="stat-value-new">{testimonials.length}</h3>
          </div>
        </div>
        <div className="stat-card-new">
          <div className="stat-info">
            <p className="stat-title-new">Active</p>
            <h3 className="stat-value-new" style={{ color: '#10b981' }}>
              {testimonials.filter(t => t.isActive && t.isApproved).length}
            </h3>
          </div>
        </div>
        <div className="stat-card-new">
          <div className="stat-info">
            <p className="stat-title-new">Pending</p>
            <h3 className="stat-value-new" style={{ color: '#f59e0b' }}>
              {pendingTestimonials.length}
            </h3>
          </div>
        </div>
        <div className="stat-card-new">
          <div className="stat-info">
            <p className="stat-title-new">Avg Rating</p>
            <h3 className="stat-value-new" style={{ color: '#3b82f6' }}>
              {testimonials.length > 0 
                ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                : '0'}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: activeTab === 'all' ? '#10b981' : 'var(--bg-secondary)',
            color: activeTab === 'all' ? '#fff' : 'var(--text-primary)',
            border: activeTab === 'all' ? 'none' : '1px solid var(--border-primary)'
          }}
        >
          All Testimonials ({testimonials.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          style={{
            background: activeTab === 'pending' ? '#f59e0b' : 'var(--bg-secondary)',
            color: activeTab === 'pending' ? '#fff' : 'var(--text-primary)',
            border: activeTab === 'pending' ? 'none' : '1px solid var(--border-primary)'
          }}
        >
          <FiAlertCircle />
          Pending Approval ({pendingTestimonials.length})
        </button>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'all' ? testimonials : pendingTestimonials).map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`card ${!testimonial.isActive ? 'opacity-60' : ''}`}
          >
            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-4 h-4 ${star <= testimonial.rating ? 'fill-current' : ''}`}
                  style={{ color: star <= testimonial.rating ? '#f59e0b' : 'var(--text-muted)' }}
                />
              ))}
              <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {testimonial.rating}/5
              </span>
            </div>

            {/* Content */}
            <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
              "{testimonial.content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(16, 185, 129, 0.15)' }}
              >
                <FiUser className="w-4 h-4" style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {testimonial.authorName}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {testimonial.authorRole}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex gap-2">
                {!testimonial.isApproved && (
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                  >
                    Pending Approval
                  </span>
                )}
                {testimonial.isApproved && (
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      background: testimonial.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: testimonial.isActive ? '#10b981' : '#f87171'
                    }}
                  >
                    {testimonial.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
                {testimonial.isUserSubmitted && (
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}
                  >
                    User Submitted
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Order: {testimonial.displayOrder}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border-secondary)' }}>
              {!testimonial.isApproved && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleApprove(testimonial.id)}
                  className="icon-button"
                  title="Approve"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
                >
                  <FiThumbsUp />
                </motion.button>
              )}
              {testimonial.isApproved && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggleActive(testimonial.id)}
                  className="icon-button"
                  title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                  style={{ 
                    background: testimonial.isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: testimonial.isActive ? '#f87171' : '#10b981'
                  }}
                >
                  {testimonial.isActive ? <FiX /> : <FiCheck />}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => openEditModal(testimonial)}
                className="icon-button"
                title="Edit"
              >
                <FiEdit2 />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(testimonial.id)}
                className="icon-button"
                title="Delete"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
              >
                <FiTrash2 />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {(activeTab === 'all' ? testimonials : pendingTestimonials).length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiStar />
          </div>
          <p className="empty-state-title">
            {activeTab === 'pending' ? 'No pending reviews' : 'No testimonials yet'}
          </p>
          <p className="empty-state-text">
            {activeTab === 'pending' 
              ? 'All submitted reviews have been processed'
              : 'Add testimonials to showcase on the landing page'}
          </p>
          {activeTab === 'all' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="primary-button"
            >
              Add First Testimonial
            </motion.button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex justify-between items-center mb-6 p-4" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
          <h3 className="card-title">
            {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          </h3>
          <button onClick={() => setModalOpen(false)} className="icon-button">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Author Name */}
          <div>
            <label htmlFor="authorName" className="input-label block mb-2">Author Name *</label>
            <input
              id="authorName"
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Author Role */}
          <div>
            <label htmlFor="authorRole" className="input-label block mb-2">Author Role *</label>
            <select
              id="authorRole"
              value={formData.authorRole}
              onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
              className="input-field"
            >
              <option value="Farmer">Farmer</option>
              <option value="Owner">Equipment Owner</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="input-label block mb-2">Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1"
                >
                  <FiStar
                    className={`w-8 h-8 ${star <= formData.rating ? 'fill-current' : ''}`}
                    style={{ color: star <= formData.rating ? '#f59e0b' : 'var(--text-muted)' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="input-label block mb-2">Testimonial Content *</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-field resize-none"
              rows={4}
              placeholder="Share your experience with FarmEase..."
              required
              maxLength={500}
            />
            <p className="text-xs text-right mt-1" style={{ color: 'var(--text-muted)' }}>
              {formData.content.length}/500
            </p>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="authorLocation" className="input-label block mb-2">Location (optional)</label>
            <input
              id="authorLocation"
              type="text"
              value={formData.authorLocation}
              onChange={(e) => setFormData({ ...formData, authorLocation: e.target.value })}
              className="input-field"
              placeholder="Punjab, India"
            />
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="displayOrder" className="input-label block mb-2">Display Order</label>
            <input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              className="input-field"
              min="0"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Lower numbers appear first
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Show on landing page
            </label>
          </div>

          {/* Approved Toggle (for editing) */}
          {editingTestimonial?.isUserSubmitted && (
            <div className="flex items-center gap-3">
              <input
                id="isApproved"
                type="checkbox"
                checked={formData.isApproved}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="isApproved" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Approved (visible on landing page)
              </label>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="secondary-button flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="primary-button flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                editingTestimonial ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTestimonials;
