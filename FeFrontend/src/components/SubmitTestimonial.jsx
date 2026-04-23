import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiX, FiSend } from 'react-icons/fi';
import { submitTestimonial } from '../services/testimonialService';

const SubmitTestimonial = ({ onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    authorName: '',
    authorRole: 'Farmer',
    content: '',
    rating: 5,
    authorLocation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const result = await submitTestimonial(formData);
    
    if (result.success) {
      setMessage({
        type: 'success',
        text: result.data.message || 'Thank you for your review!'
      });
      if (onSubmitSuccess) {
        setTimeout(() => onSubmitSuccess(), 2000);
      }
    } else {
      setMessage({
        type: 'error',
        text: result.message || 'Failed to submit review. Please try again.'
      });
    }
    
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        maxWidth: '500px',
        width: '100%'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Share Your Experience
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {message ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl text-center ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          <p className="font-medium">{message.text}</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Your Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <FiStar
                    className={`w-8 h-8 ${star <= formData.rating ? 'fill-current' : ''}`}
                    style={{ color: star <= formData.rating ? '#f59e0b' : 'var(--text-muted)' }}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {formData.rating}/5
              </span>
            </div>
            {formData.rating < 4 && (
              <p className="text-xs mt-2 text-amber-600">
                Reviews with 1-3 stars will be reviewed by our team before publishing.
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Your Name *
            </label>
            <input
              id="authorName"
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="authorRole" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              I am a *
            </label>
            <select
              id="authorRole"
              value={formData.authorRole}
              onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="Farmer">Farmer</option>
              <option value="Owner">Equipment Owner</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="authorLocation" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Location (optional)
            </label>
            <input
              id="authorLocation"
              type="text"
              value={formData.authorLocation}
              onChange={(e) => setFormData({ ...formData, authorLocation: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              placeholder="e.g., Punjab, India"
            />
          </div>

          {/* Review */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Your Review *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              rows={4}
              placeholder="Share your experience with FarmEase..."
              required
              maxLength={500}
            />
            <p className="text-xs text-right mt-1" style={{ color: 'var(--text-muted)' }}>
              {formData.content.length}/500
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff'
            }}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend />
                Submit Review
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default SubmitTestimonial;
