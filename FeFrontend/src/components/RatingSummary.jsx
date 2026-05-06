import { useState, useEffect } from 'react';
import { FiStar, FiUsers } from 'react-icons/fi';
import { getMachineRatingSummary } from '../services/reviewService';

const RatingSummary = ({ machineId, showDetails = false }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [machineId]);

  const fetchSummary = async () => {
    setLoading(true);
    const result = await getMachineRatingSummary(machineId);
    setSummary(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <div className="animate-pulse h-4 w-16 rounded" style={{ background: 'var(--bg-primary)' }}></div>
      </div>
    );
  }

  if (!summary || summary.totalReviews === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        background: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(250, 204, 21, 0.3)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <FiStar size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No reviews</span>
      </div>
    );
  }

  if (!showDetails) {
    // Compact view for cards - improved visibility
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 700,
        background: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(250, 204, 21, 0.5)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <FiStar size={14} style={{ color: '#facc15', fill: '#facc15' }} />
        <span style={{ color: '#facc15' }}>{summary.averageRating.toFixed(1)}</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>({summary.totalReviews})</span>
      </div>
    );
  }

  // Detailed view
  const maxCount = Math.max(
    summary.rating1,
    summary.rating2,
    summary.rating3,
    summary.rating4,
    summary.rating5,
    1
  );

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
      {/* Overall Rating */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {summary.averageRating.toFixed(1)}
        </div>
        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={18}
                style={{
                  color: star <= Math.round(summary.averageRating) ? '#facc15' : 'var(--text-muted)',
                  fill: star <= Math.round(summary.averageRating) ? '#facc15' : 'transparent'
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            <FiUsers size={14} />
            {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summary[`rating${rating}`];
          const percentage = (count / maxCount) * 100;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm w-8" style={{ color: 'var(--text-muted)' }}>
                {rating} ★
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%`, background: '#facc15' }}
                />
              </div>
              <span className="text-sm w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSummary;
