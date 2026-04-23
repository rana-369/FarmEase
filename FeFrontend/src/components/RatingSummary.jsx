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
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold" 
        style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)', color: 'var(--text-muted)' }}>
        <FiStar size={12} />
        <span>No reviews</span>
      </div>
    );
  }

  if (!showDetails) {
    // Compact view for cards
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)', border: '1px solid rgba(250, 204, 21, 0.25)', color: '#facc15' }}>
        <FiStar size={12} style={{ fill: '#facc15' }} />
        <span>{summary.averageRating.toFixed(1)}</span>
        <span style={{ color: 'var(--text-muted)' }}>({summary.totalReviews})</span>
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
