import { useState, useEffect } from 'react';
import { FiUser, FiCalendar, FiChevronLeft, FiChevronRight, FiMessageSquare } from 'react-icons/fi';
import StarRating from './StarRating';
import { getMachineReviews } from '../services/reviewService';

const ReviewList = ({ machineId, refreshKey = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5;

  useEffect(() => {
    fetchReviews();
  }, [machineId, page, refreshKey]);

  const fetchReviews = async () => {
    setLoading(true);
    const result = await getMachineReviews(machineId, page, limit);
    setReviews(result.items || []);
    setTotalItems(result.totalItems || 0);
    setTotalPages(result.totalPages || 1);
    setLoading(false);
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
      <div className="flex items-center justify-center py-8">
        <div className="spinner" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="empty-state-icon mx-auto mb-3">
          <FiMessageSquare />
        </div>
        <p className="card-subtitle">No reviews yet.</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Be the first to review this equipment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Review count */}
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {totalItems} review{totalItems !== 1 ? 's' : ''}
      </p>

      {/* Reviews */}
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 rounded-lg"
          style={{ background: 'var(--bg-primary)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="nav-item-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <FiUser />
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {review.farmerName || 'Anonymous'}
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <FiCalendar size={12} />
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>
            <StarRating rating={review.rating} readonly size={16} />
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm mt-2 pl-10" style={{ color: 'var(--text-secondary)' }}>
              {review.comment}
            </p>
          )}
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ background: 'var(--bg-primary)' }}
          >
            <FiChevronLeft style={{ color: 'var(--text-muted)' }} />
          </button>
          
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ background: 'var(--bg-primary)' }}
          >
            <FiChevronRight style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
