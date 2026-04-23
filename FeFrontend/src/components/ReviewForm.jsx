import { useState } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import StarRating from './StarRating';
import Modal from './Modal';
import { createReview } from '../services/reviewService';

const ReviewForm = ({ bookingId, machineName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createReview({
      bookingId,
      rating,
      comment: comment.trim() || null
    });

    setLoading(false);

    if (result.success) {
      onSuccess?.(result.data);
      onClose?.();
    } else {
      setError(result.message);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
        <h3 className="card-title">Review Equipment</h3>
        <button onClick={onClose} className="icon-button">
          <FiX />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Machine Name */}
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Equipment: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{machineName}</span>
          </p>
        </div>

        {/* Rating */}
        <fieldset>
          <legend className="input-label block mb-2">
            Rating *
          </legend>
          <StarRating
            rating={rating}
            onChange={setRating}
            size={32}
            readonly={false}
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {rating === 0 ? 'Click to rate' : `${rating} star${rating > 1 ? 's' : ''}`}
          </p>
        </fieldset>

        {/* Comment */}
        <div>
          <label htmlFor="review-comment" className="input-label block mb-2">
            Comment (optional)
          </label>
          <textarea
            id="review-comment"
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Share your experience with this equipment..."
            className="input-field resize-none"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-right" style={{ color: 'var(--text-muted)' }}>
            {comment.length}/500
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-center p-3 rounded-lg" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="secondary-button flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="primary-button flex-1 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <FiSend size={16} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewForm;
