import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ 
  rating = 0, 
  onChange, 
  readonly = false, 
  size = 20,
  showValue = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform duration-150 focus:outline-none`}
            style={{ padding: '2px' }}
          >
            <FiStar
              size={size}
              style={{
                color: isFilled ? '#facc15' : 'var(--text-muted)',
                fill: isFilled ? '#facc15' : 'transparent'
              }}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
