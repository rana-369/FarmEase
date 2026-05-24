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
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(245, 158, 11, 0.15)'
          }}>
            <FiStar style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Share Your Experience
          </h3>
        </div>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.15)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FiX style={{ color: '#f87171', width: '18px', height: '18px' }} />
          </motion.button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '24px' }}>
        {message ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              background: message.type === 'success'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
              border: message.type === 'success'
                ? '1px solid rgba(16, 185, 129, 0.25)'
                : '1px solid rgba(239, 68, 68, 0.25)',
              color: message.type === 'success' ? '#10b981' : '#f87171'
            }}
          >
            <p style={{ fontWeight: 600, margin: 0 }}>{message.text}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Your Rating *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    style={{
                      padding: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <FiStar
                      style={{
                        width: '32px',
                        height: '32px',
                        color: star <= formData.rating ? '#f59e0b' : 'var(--text-muted)',
                        fill: star <= formData.rating ? '#f59e0b' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </motion.button>
                ))}
                <span style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formData.rating}/5
                </span>
              </div>
              {formData.rating < 4 && (
                <p style={{ fontSize: '12px', marginTop: '8px', color: '#f59e0b' }}>
                  Reviews with 1-3 stars will be reviewed by our team before publishing.
                </p>
              )}
            </div>

            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="authorName" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Your Name *
              </label>
              <input
                id="authorName"
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  outline: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.2s ease'
                }}
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="authorRole" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                I am a *
              </label>
              <select
                id="authorRole"
                value={formData.authorRole}
                onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  outline: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="Farmer">Farmer</option>
                <option value="Owner">Equipment Owner</option>
              </select>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="authorLocation" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Location (optional)
              </label>
              <input
                id="authorLocation"
                type="text"
                value={formData.authorLocation}
                onChange={(e) => setFormData({ ...formData, authorLocation: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  outline: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.2s ease'
                }}
                placeholder="e.g., Punjab, India"
              />
            </div>

            {/* Review */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="content" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Your Review *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  outline: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease'
                }}
                rows={4}
                placeholder="Share your experience with FarmEase..."
                required
                maxLength={500}
              />
              <p style={{
                fontSize: '12px',
                textAlign: 'right',
                marginTop: '4px',
                color: 'var(--text-muted)',
                fontWeight: 500
              }}>
                {formData.content.length}/500
              </p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend />
                  Submit Review
                </>
              )}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitTestimonial;
