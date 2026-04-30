import React, { memo } from 'react';

// Skeleton animation styles - add to index.css or inline
const skeletonStyle = {
  background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s ease-in-out infinite',
};

// Base Skeleton component
export const Skeleton = memo(({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  style = {} 
}) => (
  <div 
    style={{
      ...skeletonStyle,
      width,
      height,
      borderRadius,
      ...style
    }}
  />
));

Skeleton.displayName = 'Skeleton';

// Text skeleton - for paragraphs
export const SkeletonText = memo(({ lines = 3, lineHeight = '16px', gap = '8px' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i}
        height={lineHeight}
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
));

SkeletonText.displayName = 'SkeletonText';

// Card skeleton - for card components
export const SkeletonCard = memo(({ hasImage = true, hasTitle = true, hasText = true }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-tertiary)',
    borderRadius: '16px',
    padding: '20px',
  }}>
    {hasImage && (
      <Skeleton height="140px" borderRadius="12px" style={{ marginBottom: '16px' }} />
    )}
    {hasTitle && (
      <Skeleton height="20px" width="70%" style={{ marginBottom: '12px' }} />
    )}
    {hasText && (
      <SkeletonText lines={2} lineHeight="14px" gap="6px" />
    )}
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

// Avatar skeleton
export const SkeletonAvatar = memo(({ size = '48px' }) => (
  <Skeleton 
    width={size} 
    height={size} 
    borderRadius="50%" 
  />
));

SkeletonAvatar.displayName = 'SkeletonAvatar';

// Table row skeleton
export const SkeletonTableRow = memo(({ columns = 4 }) => (
  <div style={{
    display: 'flex',
    gap: '16px',
    padding: '16px',
    borderBottom: '1px solid var(--border-secondary)',
  }}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton 
        key={i}
        height="16px"
        width={i === 0 ? '40px' : `${100 / columns}%`}
      />
    ))}
  </div>
));

SkeletonTableRow.displayName = 'SkeletonTableRow';

// Stat card skeleton
export const SkeletonStat = memo(() => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-tertiary)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <div style={{ flex: 1 }}>
      <Skeleton height="13px" width="80px" style={{ marginBottom: '8px' }} />
      <Skeleton height="28px" width="60px" style={{ marginBottom: '4px' }} />
      <Skeleton height="12px" width="100px" />
    </div>
    <Skeleton width="48px" height="48px" borderRadius="14px" />
  </div>
));

SkeletonStat.displayName = 'SkeletonStat';

// Page loader with multiple skeletons
export const SkeletonPage = memo(({ type = 'dashboard' }) => {
  if (type === 'dashboard') {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton height="28px" width="200px" style={{ marginBottom: '4px' }} />
          <Skeleton height="14px" width="150px" />
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          {[1, 2, 3, 4].map(i => <SkeletonStat key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }
  
  if (type === 'list') {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Skeleton height="48px" borderRadius="14px" />
        </div>
        <div style={{ 
          background: 'var(--bg-card)', 
          borderRadius: '16px', 
          overflow: 'hidden' 
        }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonTableRow key={i} />)}
        </div>
      </div>
    );
  }
  
  return <Skeleton height="100vh" />;
});

SkeletonPage.displayName = 'SkeletonPage';

export default Skeleton;
